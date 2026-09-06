import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const settingsSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  monthlyBudget: z.coerce.number().min(0).nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, monthlyBudget: true },
  });

  return NextResponse.json({
    name: user?.name ?? "",
    email: user?.email ?? "",
    monthlyBudget: user?.monthlyBudget ? Number(user.monthlyBudget) : null,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = settingsSchema.parse(await request.json());
    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.monthlyBudget !== undefined ? { monthlyBudget: data.monthlyBudget } : {}),
      },
      select: { name: true, email: true, monthlyBudget: true },
    });

    return NextResponse.json({
      name: user.name ?? "",
      email: user.email,
      monthlyBudget: user.monthlyBudget ? Number(user.monthlyBudget) : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
