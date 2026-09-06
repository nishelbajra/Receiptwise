import { CATEGORY_NAMES } from "@/lib/categories";

export interface ParsedReceipt {
  merchantName: string;
  merchantCandidates: string[];
  merchantAddress?: string | null;
  transactionDate: string;
  transactionTime?: string | null;
  subtotal?: number | null;
  taxAmount?: number | null;
  tipAmount?: number | null;
  totalAmount: number;
  previousBalance?: number | null;
  balanceDue?: number | null;
  currency: string;
  referenceNumber?: string | null;
  paymentMethod?: string | null;
  lastFourDigits?: string | null;
  cardBrand?: string | null;
  category: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice?: number | null;
    totalPrice: number;
  }>;
  confidence: number;
  rawText?: string | null;
  parserSource: string;
  ocrConfidence?: number;
  lines?: Array<{ text: string; confidence: number }>;
}

export interface ReceiptQuestion {
  field: string;
  question: string;
}

export interface MatchedCardDraft {
  id: string;
  accountName: string;
  institutionName: string;
  lastFourDigits: string | null;
  cardNetwork: string | null;
}

export interface ReceiptDraft extends ParsedReceipt {
  questions: ReceiptQuestion[];
  enrichmentSource: "ollama" | "parser-only";
  financialAccountId?: string | null;
  matchedCard?: MatchedCardDraft | null;
  paymentMethodConfidence?: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
}

function ocrServiceUrl() {
  return process.env.OCR_SERVICE_URL || "http://localhost:8000";
}

export async function checkOcrHealth() {
  const response = await fetch(`${ocrServiceUrl()}/health`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`OCR service returned ${response.status}`);
  }
  return response.json() as Promise<{ status: string; version?: string }>;
}

export async function extractReceiptFromFile(file: File): Promise<ParsedReceipt> {
  const form = new FormData();
  form.append("file", file, file.name || "receipt.jpg");

  const response = await fetch(`${ocrServiceUrl()}/extract-receipt`, {
    method: "POST",
    body: form,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || payload.error || "OCR extraction failed");
  }

  return normalizeParsedReceipt(payload);
}

function asNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeParsedReceipt(payload: Record<string, unknown>): ParsedReceipt {
  const category = typeof payload.category === "string" && CATEGORY_NAMES.includes(payload.category as never)
    ? payload.category
    : "Other";

  return {
    merchantName: String(payload.merchantName || "Unknown Merchant"),
    merchantCandidates: Array.isArray(payload.merchantCandidates)
      ? payload.merchantCandidates.filter((item): item is string => typeof item === "string")
      : [],
    merchantAddress: (payload.merchantAddress as string | null) ?? null,
    transactionDate: String(payload.transactionDate || new Date().toISOString().slice(0, 10)),
    transactionTime: (payload.transactionTime as string | null) ?? null,
    subtotal: asNumber(payload.subtotal),
    taxAmount: asNumber(payload.taxAmount),
    tipAmount: asNumber(payload.tipAmount),
    totalAmount: asNumber(payload.totalAmount) ?? 0,
    previousBalance: asNumber(payload.previousBalance),
    balanceDue: asNumber(payload.balanceDue),
    currency: String(payload.currency || "USD"),
    referenceNumber: (payload.referenceNumber as string | null) ?? null,
    paymentMethod: (payload.paymentMethod as string | null) ?? null,
    lastFourDigits: (payload.lastFourDigits as string | null) ?? null,
    cardBrand: (payload.cardBrand as string | null) ?? null,
    category,
    items: Array.isArray(payload.items) ? (payload.items as ParsedReceipt["items"]) : [],
    confidence: asNumber(payload.confidence) ?? asNumber(payload.ocrConfidence) ?? 0.5,
    rawText: (payload.rawText as string | null) ?? null,
    parserSource: String(payload.parserSource || "tesseract"),
    ocrConfidence: asNumber(payload.ocrConfidence) ?? undefined,
    lines: Array.isArray(payload.lines) ? (payload.lines as ParsedReceipt["lines"]) : [],
  };
}

export function missingFieldQuestions(parsed: ParsedReceipt): ReceiptQuestion[] {
  const questions: ReceiptQuestion[] = [];
  if (!parsed.merchantName || parsed.merchantName === "Unknown Merchant") {
    questions.push({
      field: "merchantName",
      question: "The store name was unclear. What is the merchant name?",
    });
  }
  if (!parsed.totalAmount) {
    questions.push({
      field: "totalAmount",
      question: "The paid total was not found. What amount should be saved?",
    });
  }
  if (!parsed.transactionDate) {
    questions.push({
      field: "transactionDate",
      question: "The receipt date was missing. What date should we use?",
    });
  }
  if (!parsed.lastFourDigits && parsed.paymentMethod !== "CASH") {
    questions.push({
      field: "lastFourDigits",
      question: "No card last 4 digits were found. Which card paid this receipt?",
    });
  }
  return questions;
}
