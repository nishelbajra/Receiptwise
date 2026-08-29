import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ExtractedReceiptData {
  merchantName: string;
  merchantAddress?: string;
  transactionDate: string;
  transactionTime?: string;
  subtotal?: number;
  taxAmount?: number;
  tipAmount?: number;
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
  lastFourDigits?: string;
  cardBrand?: string;
  category: string;
  items: {
    description: string;
    quantity: number;
    unitPrice?: number;
    totalPrice: number;
  }[];
  confidence: number;
}

const extractionPrompt = `Extract receipt data as JSON. Focus on: merchant, total, date, and CARD DETAILS (last 4 digits).

Look for card info like: "VISA ****1234", "MC ****5678", "Card: 1234"

Return this JSON structure:
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
  "lastFourDigits": "1234 or null",
  "cardBrand": "VISA/MASTERCARD/AMEX/DISCOVER/UNKNOWN",
  "category": "Groceries/Restaurants/Shopping/Transportation/Entertainment/Healthcare/Utilities/Travel/Education/Other",
  "items": [{"description": "item", "quantity": 1, "totalPrice": 0.00}],
  "confidence": 0.9
}

Rules:
- Numbers only for amounts (no $ signs)
- Date as YYYY-MM-DD
- MAXIMUM 10 items in items array (skip the rest)
- Card last 4 digits is CRITICAL - look carefully at bottom of receipt`;

export async function extractReceiptData(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedReceiptData> {
  // Use Gemini 3.6 Flash - free tier, supports vision (images/PDFs)
  const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  // Convert common mime types to ones Gemini accepts
  let geminiMimeType = mimeType;
  if (mimeType === "image/heic" || mimeType === "image/heif") {
    geminiMimeType = "image/heic";
  } else if (mimeType === "application/pdf") {
    geminiMimeType = "application/pdf";
  } else if (!["image/jpeg", "image/png", "image/webp", "image/heic"].includes(mimeType)) {
    // Default to JPEG for unknown image types
    geminiMimeType = "image/jpeg";
  }

  const result = await model.generateContent([
    extractionPrompt,
    {
      inlineData: {
        mimeType: geminiMimeType,
        data: imageBase64,
      },
    },
  ]);

  const response = result.response;
  const content = response.text();

  if (!content) {
    throw new Error("No response from Gemini");
  }

  console.log("Raw Gemini response:", content.substring(0, 500));

  try {
    // Clean up response - remove markdown code blocks if present
    let cleanedContent = content
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();
    
    // Try to find JSON object in the response if there's extra text
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }

    const data = JSON.parse(cleanedContent) as ExtractedReceiptData;
    return data;
  } catch (parseError) {
    console.error("=== GEMINI PARSE ERROR ===");
    console.error("Raw response:", content);
    console.error("Parse error:", parseError);
    
    // Try a more aggressive extraction
    try {
      const jsonStart = content.indexOf("{");
      const jsonEnd = content.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const extracted = content.substring(jsonStart, jsonEnd + 1);
        const data = JSON.parse(extracted) as ExtractedReceiptData;
        console.log("Successfully extracted JSON from response");
        return data;
      }
    } catch (secondError) {
      console.error("Second parse attempt failed:", secondError);
    }
    
    throw new Error(`Failed to parse AI response. Raw text: ${content.substring(0, 200)}...`);
  }
}
