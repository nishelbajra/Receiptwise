import { CATEGORY_NAMES } from "@/lib/categories";
import type { ParsedReceipt } from "@/lib/ocr";

// Try multiple Gemini model endpoints (2.5 models as of 2025+)
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

function getGeminiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY || null;
}

export function isGeminiConfigured(): boolean {
  const key = getApiKey();
  return !!key && key.length > 10;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export async function extractReceiptWithGemini(file: File): Promise<ParsedReceipt> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // Convert file to base64
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  
  // Determine mime type
  let mimeType = file.type || "image/jpeg";
  const name = file.name.toLowerCase();
  if (name.endsWith(".heic") || name.endsWith(".heif")) {
    mimeType = "image/heic";
  } else if (name.endsWith(".pdf")) {
    mimeType = "application/pdf";
  }

  const prompt = `Extract data from this receipt image. Return ONLY valid JSON with this structure:
{
  "merchantName": "Store name",
  "merchantAddress": "Address or null",
  "transactionDate": "YYYY-MM-DD",
  "transactionTime": "HH:MM or null",
  "subtotal": number or null,
  "taxAmount": number or null,
  "tipAmount": number or null,
  "totalAmount": number,
  "currency": "USD",
  "paymentMethod": "VISA/MASTERCARD/AMEX/DISCOVER/DEBIT/CASH/OTHER",
  "lastFourDigits": "1234 or null (last 4 digits of card)",
  "cardBrand": "VISA/MASTERCARD/AMEX/DISCOVER/UNKNOWN",
  "category": "${CATEGORY_NAMES.join("/")}",
  "items": [{"description": "item name", "quantity": 1, "totalPrice": 0.00}],
  "confidence": 0.0 to 1.0
}

Rules:
- Numbers only for amounts (no $ signs)
- Date as YYYY-MM-DD
- Maximum 15 items
- Card last 4 digits is important - look at bottom of receipt
- Return ONLY the JSON, no explanations`;

  // Try each model until one works
  let lastError = "";
  let response: Response | null = null;
  
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${model}`);
      response = await fetch(getGeminiUrl(model) + `?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (response.ok) {
        console.log(`Success with model: ${model}`);
        break;
      }
      
      lastError = await response.text();
      console.log(`Model ${model} failed: ${response.status}`);
      response = null;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.log(`Model ${model} error: ${lastError}`);
    }
  }

  if (!response || !response.ok) {
    throw new Error(`Gemini API error: ${lastError}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("No response from Gemini");
  }

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from Gemini response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Normalize and return
  return {
    merchantName: parsed.merchantName || "Unknown Merchant",
    merchantCandidates: [],
    merchantAddress: parsed.merchantAddress || null,
    transactionDate: parsed.transactionDate || new Date().toISOString().slice(0, 10),
    transactionTime: parsed.transactionTime || null,
    subtotal: parsed.subtotal ?? null,
    taxAmount: parsed.taxAmount ?? null,
    tipAmount: parsed.tipAmount ?? null,
    totalAmount: parsed.totalAmount ?? 0,
    currency: parsed.currency || "USD",
    paymentMethod: parsed.paymentMethod || null,
    lastFourDigits: parsed.lastFourDigits || null,
    cardBrand: parsed.cardBrand || null,
    category: CATEGORY_NAMES.includes(parsed.category) ? parsed.category : "Other",
    items: Array.isArray(parsed.items) ? parsed.items : [],
    confidence: parsed.confidence ?? 0.8,
    rawText: null,
    parserSource: "gemini",
  };
}
