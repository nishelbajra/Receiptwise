import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createCardSchema = z.object({
  accountName: z.string().min(1, "Card name is required"),
  institutionName: z.string().min(1, "Bank/Institution name is required"),
  lastFourDigits: z.string().length(4, "Must be exactly 4 digits").regex(/^\d{4}$/, "Must be 4 digits"),
  cardNetwork: z.enum(["VISA", "MASTERCARD", "AMEX", "DISCOVER", "OTHER"]),
  accountType: z.enum(["CREDIT_CARD", "DEBIT_CARD"]).default("CREDIT_CARD"),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cards = await db.financialAccount.findMany({
      where: {
        userId: session.user.id,
        accountType: { in: ["CREDIT_CARD", "DEBIT_CARD"] },
        isActive: true,
      },
      include: {
        cardBenefits: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCardSchema.parse(body);

    // Check if card with same last 4 digits already exists
    const existingCard = await db.financialAccount.findFirst({
      where: {
        userId: session.user.id,
        lastFourDigits: validatedData.lastFourDigits,
        isActive: true,
      },
    });

    if (existingCard) {
      return NextResponse.json(
        { error: "A card with these last 4 digits already exists" },
        { status: 400 }
      );
    }

    const card = await db.financialAccount.create({
      data: {
        userId: session.user.id,
        accountName: validatedData.accountName,
        institutionName: validatedData.institutionName,
        lastFourDigits: validatedData.lastFourDigits,
        cardNetwork: validatedData.cardNetwork,
        accountType: validatedData.accountType,
      },
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Error creating card:", error);
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 });
  }
}
