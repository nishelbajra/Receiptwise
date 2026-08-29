import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lastFourDigits, cardBrand } = await request.json();

    if (!lastFourDigits || lastFourDigits.length !== 4) {
      return NextResponse.json({ 
        matched: false, 
        message: "No card digits provided" 
      });
    }

    // Try to find exact match by last 4 digits
    const matchedCard = await db.financialAccount.findFirst({
      where: {
        userId: session.user.id,
        lastFourDigits: lastFourDigits,
        isActive: true,
        accountType: { in: ["CREDIT_CARD", "DEBIT_CARD"] },
      },
      include: {
        cardBenefits: true,
      },
    });

    if (matchedCard) {
      // Verify card network if provided
      const networkMatches = !cardBrand || 
        cardBrand === "UNKNOWN" || 
        matchedCard.cardNetwork === cardBrand ||
        matchedCard.cardNetwork === "OTHER";

      return NextResponse.json({
        matched: true,
        networkMatches,
        card: {
          id: matchedCard.id,
          accountName: matchedCard.accountName,
          institutionName: matchedCard.institutionName,
          lastFourDigits: matchedCard.lastFourDigits,
          cardNetwork: matchedCard.cardNetwork,
          benefits: matchedCard.cardBenefits,
        },
        message: networkMatches 
          ? `Matched to ${matchedCard.accountName} (${matchedCard.institutionName})`
          : `Found card ending in ${lastFourDigits}, but network mismatch (receipt shows ${cardBrand}, card is ${matchedCard.cardNetwork})`,
      });
    }

    // No match found - suggest adding the card
    return NextResponse.json({
      matched: false,
      lastFourDigits,
      cardBrand: cardBrand || "UNKNOWN",
      message: `No registered card ending in ${lastFourDigits}. Would you like to add this card?`,
      suggestAdd: true,
    });
  } catch (error) {
    console.error("Error matching card:", error);
    return NextResponse.json({ error: "Failed to match card" }, { status: 500 });
  }
}
