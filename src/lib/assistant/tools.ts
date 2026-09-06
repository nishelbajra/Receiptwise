import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const ASSISTANT_TOOLS = [
  "get_spending_summary",
  "get_spending_by_category",
  "get_transactions",
  "compare_months",
  "get_budget_status",
] as const;

export type AssistantToolName = (typeof ASSISTANT_TOOLS)[number];

export interface ToolArgs {
  month?: string;
  month_a?: string;
  month_b?: string;
  category?: string;
  merchant?: string;
  limit?: number;
}

const MONTH_NAMES: Record<string, string> = {
  january: "01",
  jan: "01",
  february: "02",
  feb: "02",
  march: "03",
  mar: "03",
  april: "04",
  apr: "04",
  may: "05",
  june: "06",
  jun: "06",
  july: "07",
  jul: "07",
  august: "08",
  aug: "08",
  september: "09",
  sep: "09",
  sept: "09",
  october: "10",
  oct: "10",
  november: "11",
  nov: "11",
  december: "12",
  dec: "12",
};

export function normalizeMonthArg(input?: string, userText = "", now = new Date()) {
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const raw = (input || "").trim().toLowerCase();

  if (!raw || raw === "current" || raw === "this month") {
    return `${currentYear}-${currentMonth}`;
  }

  if (raw === "last month") {
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}`;
  }

  const iso = /^(\d{4})-(\d{2})$/.exec(raw);
  if (iso) {
    const year = iso[1];
    const month = iso[2];
    const userNamedThatYear = new RegExp(`\\b${year}\\b`).test(userText);
    if (Number(year) !== currentYear && !userNamedThatYear) {
      return `${currentYear}-${month}`;
    }
    return `${year}-${month}`;
  }

  const monthOnly = /^(\d{1,2})$/.exec(raw);
  if (monthOnly) {
    return `${currentYear}-${monthOnly[1].padStart(2, "0")}`;
  }

  const namedYear = /^([a-z]+)\s+(\d{4})$/.exec(raw);
  if (namedYear && MONTH_NAMES[namedYear[1]]) {
    return `${namedYear[2]}-${MONTH_NAMES[namedYear[1]]}`;
  }

  const named = MONTH_NAMES[raw.replace(/\s+/g, "")];
  if (named) {
    return `${currentYear}-${named}`;
  }

  return `${currentYear}-${currentMonth}`;
}

function monthRange(month?: string, userText = "") {
  const value = normalizeMonthArg(month, userText);
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error("Month must be YYYY-MM");
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  return { month: value, start, end };
}

function toAmount(value: Prisma.Decimal | number | null | undefined) {
  return Number(value ?? 0);
}

export async function getSpendingSummary(userId: string, month?: string, userText = "") {
  const range = monthRange(month, userText);
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      transactionDate: { gte: range.start, lt: range.end },
    },
    select: { totalAmount: true },
  });
  const total = transactions.reduce((sum, row) => sum + toAmount(row.totalAmount), 0);
  return {
    month: range.month,
    transactionCount: transactions.length,
    totalSpent: Number(total.toFixed(2)),
  };
}

export async function getSpendingByCategory(userId: string, month?: string, userText = "") {
  const range = monthRange(month, userText);
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      transactionDate: { gte: range.start, lt: range.end },
    },
    include: { category: true },
  });

  const grouped = new Map<string, { category: string; total: number; count: number }>();
  for (const transaction of transactions) {
    const name = transaction.category?.name || "Other";
    const current = grouped.get(name) || { category: name, total: 0, count: 0 };
    current.total += toAmount(transaction.totalAmount);
    current.count += 1;
    grouped.set(name, current);
  }

  return {
    month: range.month,
    categories: [...grouped.values()]
      .map((row) => ({ ...row, total: Number(row.total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total),
  };
}

export async function getTransactions(userId: string, filters: ToolArgs = {}, userText = "") {
  const range = filters.month ? monthRange(filters.month, userText) : null;
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      ...(range ? { transactionDate: { gte: range.start, lt: range.end } } : {}),
      ...(filters.category
        ? { category: { name: { equals: filters.category, mode: "insensitive" } } }
        : {}),
      ...(filters.merchant
        ? { merchantName: { contains: filters.merchant, mode: "insensitive" } }
        : {}),
    },
    include: { category: true },
    orderBy: { transactionDate: "desc" },
    take: Math.min(filters.limit ?? 20, 50),
  });

  return {
    month: range?.month ?? null,
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      merchantName: transaction.merchantName,
      date: transaction.transactionDate.toISOString().slice(0, 10),
      totalAmount: toAmount(transaction.totalAmount),
      category: transaction.category?.name || "Other",
    })),
  };
}

export async function compareMonths(userId: string, monthA?: string, monthB?: string, userText = "") {
  const a = await getSpendingSummary(userId, monthA, userText);
  const b = await getSpendingSummary(userId, monthB, userText);
  const delta = Number((a.totalSpent - b.totalSpent).toFixed(2));
  const percentChange = b.totalSpent === 0 ? null : Number(((delta / b.totalSpent) * 100).toFixed(1));
  return {
    monthA: a,
    monthB: b,
    delta,
    percentChange,
  };
}

export async function getBudgetStatus(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { monthlyBudget: true },
  });
  const month = await getSpendingSummary(userId);
  const categoryBudgets = await db.budget.findMany({
    where: { userId, isActive: true },
    include: { category: true },
  });
  const byCategory = await getSpendingByCategory(userId);
  const spentByCategory = new Map(byCategory.categories.map((row) => [row.category, row.total]));
  const monthlyBudget = toAmount(user?.monthlyBudget);
  const remaining = monthlyBudget ? Number((monthlyBudget - month.totalSpent).toFixed(2)) : null;

  return {
    month: month.month,
    monthlyBudget,
    spentThisMonth: month.totalSpent,
    remaining,
    percentUsed: monthlyBudget ? Number(((month.totalSpent / monthlyBudget) * 100).toFixed(1)) : null,
    categoryBudgets: categoryBudgets.map((budget) => {
      const name = budget.category?.name || "Overall";
      const spent = budget.category ? spentByCategory.get(name) || 0 : month.totalSpent;
      const amount = toAmount(budget.amount);
      return {
        category: name,
        budget: amount,
        spent,
        remaining: Number((amount - spent).toFixed(2)),
      };
    }),
  };
}

export async function runAssistantTool(
  userId: string,
  tool: AssistantToolName,
  args: ToolArgs = {},
  userText = ""
) {
  switch (tool) {
    case "get_spending_summary":
      return getSpendingSummary(userId, args.month, userText);
    case "get_spending_by_category":
      return getSpendingByCategory(userId, args.month, userText);
    case "get_transactions":
      return getTransactions(userId, args, userText);
    case "compare_months":
      return compareMonths(userId, args.month_a, args.month_b, userText);
    case "get_budget_status":
      return getBudgetStatus(userId);
    default:
      throw new Error("Unknown tool");
  }
}
