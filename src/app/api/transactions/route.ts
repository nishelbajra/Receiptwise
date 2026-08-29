import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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
    console.log("Transaction request body:", JSON.stringify(body, null, 2));
    
    const data = createTransactionSchema.parse(body);
    console.log("Validated data:", JSON.stringify(data, null, 2));

    let categoryId = data.categoryId;
    if (!categoryId && data.categoryName) {
      let category = await db.category.findFirst({
        where: {
          name: data.categoryName,
          OR: [{ userId: session.user.id }, { isSystem: true }],
        },
      });

      if (!category) {
        category = await db.category.create({
          data: {
            name: data.categoryName,
            userId: session.user.id,
            isSystem: false,
          },
        });
      }
      categoryId = category.id;
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
        paymentMethodConfidence: data.paymentMethodConfidence,
        financialAccountId: data.financialAccountId || undefined,
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
