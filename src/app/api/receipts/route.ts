import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const receipts = await db.receipt.findMany({
    where: { userId: session.user.id },
    include: { transaction: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ receipts });
}
