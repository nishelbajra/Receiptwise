import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { matchCardForUser } from "@/lib/cards";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lastFourDigits, cardBrand } = await request.json();
    const card = await matchCardForUser(session.user.id, lastFourDigits, cardBrand);

    if (card) {
      return NextResponse.json({
        matched: true,
        card,
        message: `Matched ${card.accountName} ending in ${card.lastFourDigits}`,
      });
    }

    return NextResponse.json({
      matched: false,
      lastFourDigits,
      cardBrand: cardBrand || "UNKNOWN",
      suggestAdd: Boolean(lastFourDigits && String(lastFourDigits).length === 4),
      message: lastFourDigits
        ? `No registered card ending in ${lastFourDigits}. Add it under Accounts.`
        : "No card digits provided",
    });
  } catch (error) {
    console.error("Error matching card:", error);
    return NextResponse.json({ error: "Failed to match card" }, { status: 500 });
  }
}
