import { CATEGORY_NAMES } from "@/lib/categories";
import type { ParsedReceipt, ReceiptQuestion } from "@/lib/ocr";

export interface OllamaEnrichment {
  merchantName: string;
  category: string;
  questions: ReceiptQuestion[];
}

function ollamaHost() {
  return process.env.OLLAMA_HOST || "http://localhost:11434";
}

export function ollamaModel() {
  return process.env.OLLAMA_MODEL || "qwen3:4b";
}

export async function checkOllamaHealth() {
  const response = await fetch(`${ollamaHost()}/api/tags`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status}`);
  }
  const data = (await response.json()) as { models?: Array<{ name: string }> };
  return {
    status: "ok",
    model: ollamaModel(),
    models: data.models?.map((model) => model.name) ?? [],
  };
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const fenced = cleaned.replace(/```json|```/g, "").trim();
  const match = fenced.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : fenced);
}

export async function ollamaStructured<T>(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  schema: Record<string, unknown>,
  options?: { temperature?: number }
): Promise<T> {
  const response = await fetch(`${ollamaHost()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel(),
      messages,
      stream: false,
      format: schema,
      think: false,
      options: { temperature: options?.temperature ?? 0 },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed: ${errorText || response.status}`);
  }

  const data = (await response.json()) as { message?: { content?: string } };
  const content = data.message?.content;
  if (!content) {
    throw new Error("Ollama returned an empty response");
  }
  return extractJson(content) as T;
}

export async function enrichReceiptWithOllama(parsed: ParsedReceipt): Promise<OllamaEnrichment> {
  const schema = {
    type: "object",
    properties: {
      merchantName: { type: "string" },
      category: { type: "string", enum: CATEGORY_NAMES },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string" },
            question: { type: "string" },
          },
          required: ["field", "question"],
        },
      },
    },
    required: ["merchantName", "category", "questions"],
  };

  const result = await ollamaStructured<OllamaEnrichment>(
    [
      {
        role: "system",
        content: [
          "You organize receipt text. You do not extract or change numbers.",
          "Locked fields from the rule parser: date, total, tax, subtotal, tip.",
          "Clean the merchant name. Pick exactly one category from the provided list.",
          "Ask short questions only for missing or unclear non-numeric labels, or if totalAmount is 0.",
          "Never invent a dollar amount.",
        ].join(" "),
      },
      {
        role: "user",
        content: JSON.stringify({
          lockedNumbers: {
            transactionDate: parsed.transactionDate,
            totalAmount: parsed.totalAmount,
            taxAmount: parsed.taxAmount,
            subtotal: parsed.subtotal,
            tipAmount: parsed.tipAmount,
          },
          merchantCandidates: parsed.merchantCandidates,
          parserMerchant: parsed.merchantName,
          parserCategory: parsed.category,
          categories: CATEGORY_NAMES,
          rawText: (parsed.rawText || "").slice(0, 4000),
        }),
      },
    ],
    schema
  );

  return {
    merchantName: result.merchantName?.trim() || parsed.merchantName,
    category: CATEGORY_NAMES.includes(result.category as never) ? result.category : parsed.category,
    questions: Array.isArray(result.questions) ? result.questions : [],
  };
}
