import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveUploadedFile, fileToBase64, getMimeType, validateFile } from "@/lib/upload";
import { extractReceiptData } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { storageKey } = await saveUploadedFile(file);

    const receipt = await db.receipt.create({
      data: {
        userId: session.user.id,
        storageKey,
        originalFilename: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
        processingStatus: "PROCESSING",
      },
    });

    let extractedData = null;
    let extractionError = null;

    try {
      const base64 = await fileToBase64(file);
      const mimeType = getMimeType(file);
      extractedData = await extractReceiptData(base64, mimeType);

      await db.receipt.update({
        where: { id: receipt.id },
        data: {
          processingStatus: "COMPLETED",
          rawExtraction: extractedData as object,
          extractionConfidence: extractedData.confidence,
        },
      });
    } catch (error) {
      extractionError = error instanceof Error ? error.message : "Extraction failed";
      await db.receipt.update({
        where: { id: receipt.id },
        data: {
          processingStatus: "FAILED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      receipt: {
        id: receipt.id,
        storageKey: receipt.storageKey,
        filePath: `/uploads/${receipt.storageKey}`,
        processingStatus: extractedData ? "COMPLETED" : "FAILED",
      },
      extraction: extractedData,
      error: extractionError,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
