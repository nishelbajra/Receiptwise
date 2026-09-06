import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { matchCardForUser } from "@/lib/cards";
import { getOrCreateCategory } from "@/lib/categories-db";
import { z } from "zod";

const createTransactionSchema = z.object({
  receiptId: z.string().optional().nullable(),
  merchantName: z.string().min(1, "Merchant name is required"),
  merchantAddress: z.string().optional().nullable(),
  transactionDate: z.string(),
  transactionTime: z.string().optional().nullable(),
  subtotal: z.coerce.number().optional().nullable(),
  taxAmount: z.coerce.number().optional().nullable(),
  tipAmount: z.coerce.number().optional().nullable(),
  totalAmount: z.coerce.number(),
  currency: z.string().default("USD"),
  categoryId: z.string().optional().nullable(),
  categoryName: z.string().optional().nullable(),
  paymentMethodConfidence: z.enum(["HIGH", "MEDIUM", "LOW", "UNKNOWN"]).default("UNKNOWN"),
  financialAccountId: z.string().optional().nullable(),
  lastFourDigits: z.string().optional().nullable(),
  cardBrand: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.coerce.number().default(1),
    unitPrice: z.coerce.number().optional().nullable(),
    totalPrice: z.coerce.number(),
  })).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createTransactionSchema.parse(body);

    let categoryId = data.categoryId;
    if (!categoryId && data.categoryName) {
      const category = await getOrCreateCategory(data.categoryName);
      categoryId = category.id;
    }

    let financialAccountId = data.financialAccountId || undefined;
    let paymentMethodConfidence = data.paymentMethodConfidence;
    if (!financialAccountId && data.lastFourDigits) {
      const matched = await matchCardForUser(
        session.user.id,
        data.lastFourDigits,
        data.cardBrand
      );
      if (matched) {
        financialAccountId = matched.id;
        paymentMethodConfidence = "HIGH";
      }
    }

    if (financialAccountId) {
      const owned = await db.financialAccount.findFirst({
        where: { id: financialAccountId, userId: session.user.id, isActive: true },
      });
      if (!owned) {
        return NextResponse.json({ error: "Selected card was not found" }, { status: 400 });
      }
    }

    const transaction = await db.transaction.create({
      data: {
        userId: session.user.id,
        receiptId: data.receiptId || undefined,
        merchantName: data.merchantName,
        merchantAddress: data.merchantAddress || undefined,
        transactionDate: new Date(data.transactionDate),
        transactionTime: data.transactionTime ? new Date(`1970-01-01T${data.transactionTime}`) : undefined,
        subtotal: data.subtotal ?? undefined,
        taxAmount: data.taxAmount ?? undefined,
        tipAmount: data.tipAmount ?? undefined,
        totalAmount: data.totalAmount,
        currency: data.currency,
        categoryId: categoryId || undefined,
        paymentMethodConfidence,
        financialAccountId,
        notes: data.notes || undefined,
        source: data.receiptId ? "RECEIPT" : "MANUAL",
        items: data.items && data.items.length > 0 ? {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? undefined,
            totalPrice: item.totalPrice,
          })),
        } : undefined,
      },
      include: {
        category: true,
        items: true,
        receipt: true,
        financialAccount: true,
      },
    });

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", JSON.stringify(error.errors, null, 2));
      return NextResponse.json(
        { error: error.errors[0].message, details: error.errors },
        { status: 400 }
      );
    }
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const transactions = await db.transaction.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
        receipt: true,
        financialAccount: true,
      },
      orderBy: { transactionDate: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await db.transaction.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ transactions, total });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Failed to get transactions" },
      { status: 500 }
    );
  }
}
