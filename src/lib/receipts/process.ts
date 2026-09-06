import { matchCardForUser } from "@/lib/cards";
import { db } from "@/lib/db";
import { extractReceiptFromFile, missingFieldQuestions, type ReceiptDraft } from "@/lib/ocr";
import { enrichReceiptWithOllama } from "@/lib/ollama";

function toJson(value: ReceiptDraft) {
  return JSON.parse(JSON.stringify(value)) as object;
}

export async function processReceiptJob(options: {
  userId: string;
  receiptId: string;
  file: File;
}): Promise<ReceiptDraft> {
  const job = await db.processingJob.create({
    data: {
      userId: options.userId,
      receiptId: options.receiptId,
      type: "RECEIPT_PROCESS",
      status: "PROCESSING",
      attempts: 1,
      startedAt: new Date(),
      payload: { filename: options.file.name, mimeType: options.file.type },
    },
  });

  try {
    await db.receipt.update({
      where: { id: options.receiptId },
      data: { processingStatus: "PROCESSING" },
    });

    const parsed = await extractReceiptFromFile(options.file);
    const matchedCard = await matchCardForUser(
      options.userId,
      parsed.lastFourDigits,
      parsed.cardBrand
    );
    const questions = missingFieldQuestions(parsed);
    if (parsed.lastFourDigits && !matchedCard) {
      questions.push({
        field: "financialAccountId",
        question: `Card ****${parsed.lastFourDigits} is not in your accounts. Add it under Accounts or pick a card before saving.`,
      });
    }

    let draft: ReceiptDraft = {
      ...parsed,
      questions,
      enrichmentSource: "parser-only",
      matchedCard,
      financialAccountId: matchedCard?.id ?? null,
      paymentMethodConfidence: matchedCard ? "HIGH" : parsed.lastFourDigits ? "MEDIUM" : "UNKNOWN",
    };

    try {
      const enrichment = await enrichReceiptWithOllama(parsed);
      draft = {
        ...draft,
        merchantName: enrichment.merchantName || parsed.merchantName,
        category: enrichment.category || parsed.category,
        questions: questions.length ? questions : enrichment.questions,
        enrichmentSource: "ollama",
      };
    } catch (error) {
      console.warn("Ollama enrichment skipped:", error);
    }

    await db.receipt.update({
      where: { id: options.receiptId },
      data: {
        processingStatus: "COMPLETED",
        rawExtraction: toJson(draft),
        extractionConfidence: draft.confidence,
      },
    });

    await db.processingJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        result: toJson(draft),
        completedAt: new Date(),
      },
    });

    return draft;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Receipt processing failed";
    await db.receipt.update({
      where: { id: options.receiptId },
      data: { processingStatus: "FAILED" },
    });
    await db.processingJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        error: message,
        completedAt: new Date(),
      },
    });
    throw error;
  }
}
