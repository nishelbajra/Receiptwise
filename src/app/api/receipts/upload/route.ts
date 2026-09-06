import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { processReceiptJob } from "@/lib/receipts/process";
import { saveUploadedFile, validateFile } from "@/lib/upload";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
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
        processingStatus: "PENDING",
      },
    });

    try {
      const extraction = await processReceiptJob({
        userId: session.user.id,
        receiptId: receipt.id,
        file,
      });

      return NextResponse.json({
        success: true,
        receipt: {
          id: receipt.id,
          storageKey,
          processingStatus: "COMPLETED",
        },
        extraction,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        receipt: {
          id: receipt.id,
          storageKey,
          processingStatus: "FAILED",
        },
        extraction: null,
        error: error instanceof Error ? error.message : "Receipt processing failed",
      }, { status: 422 });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
