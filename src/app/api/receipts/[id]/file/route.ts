import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readStoredFile } from "@/lib/upload";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const receipt = await db.receipt.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  const file = await readStoredFile(receipt.storageKey);
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": receipt.mimeType || "image/jpeg",
      "Content-Disposition": `inline; filename="${receipt.originalFilename || receipt.storageKey}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
