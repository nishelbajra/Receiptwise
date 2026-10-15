import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { previousPeriod, startOfDay, startOfMonth, startOfWeek, toAmount } from "@/lib/money";
import { ArrowUpRight, DollarSign, Plus, Receipt, TrendingUp } from "lucide-react";

async function sumBetween(userId: string, start: Date, end?: Date) {
  const result = await db.transaction.aggregate({
    where: {
      userId,
      transactionDate: end ? { gte: start, lt: end } : { gte: start },
    },
    _sum: { totalAmount: true },
    _count: true,
  });
  return {
    total: toAmount(result._sum.totalAmount),
    count: result._count,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const week = startOfWeek(now);
  const month = startOfMonth(now);
  const yesterdayRange = previousPeriod(today, tomorrow);
  const lastWeekRange = previousPeriod(week, today);
  const [spentToday, spentYesterday, spentWeek, spentLastWeek, spentMonth, user, recent, categories] = await Promise.all([
    sumBetween(userId, today, tomorrow),
    sumBetween(userId, yesterdayRange.start, yesterdayRange.end),
    sumBetween(userId, week),
    sumBetween(userId, lastWeekRange.start, lastWeekRange.end),
    sumBetween(userId, month),
    db.user.findUnique({ where: { id: userId }, select: { monthlyBudget: true, name: true } }),
    db.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { transactionDate: "desc" },
      take: 5,
    }),
    db.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, transactionDate: { gte: month } },
      _sum: { totalAmount: true },
    }),
  ]);

  const categoryIds = categories.map((row) => row.categoryId).filter((id): id is string => Boolean(id));
  const categoryRows = categoryIds.length
    ? await db.category.findMany({ where: { id: { in: categoryIds } } })
    : [];
  const categoryNames = new Map(categoryRows.map((row) => [row.id, row.name]));
  const categoryTotals = categories
    .map((row) => ({
      name: row.categoryId ? categoryNames.get(row.categoryId) || "Other" : "Other",
      total: toAmount(row._sum.totalAmount),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const budget = toAmount(user?.monthlyBudget);
  const todayChange = spentYesterday.total
    ? ((spentToday.total - spentYesterday.total) / spentYesterday.total) * 100
    : 0;
  const weekChange = spentLastWeek.total
    ? ((spentWeek.total - spentLastWeek.total) / spentLastWeek.total) * 100
    : 0;
  const budgetUsed = budget ? Math.min(100, (spentMonth.total / budget) * 100) : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
          </h2>
          <p className="text-gray-500 mt-1">Your spending overview at a glance.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Spent Today</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(spentToday.total)}</div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                {todayChange.toFixed(0)}% vs yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(spentWeek.total)}</div>
              <p className="text-xs text-gray-500 mt-1">{weekChange.toFixed(0)}% vs last week</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">This Month</CardTitle>
              <Receipt className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(spentMonth.total)}</div>
              <p className="text-xs text-gray-500 mt-1">{spentMonth.count} transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Monthly Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(spentMonth.total)} / {budget ? formatCurrency(budget) : "—"}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${budgetUsed}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-900">Recent Transactions</CardTitle>
              <Link href="/transactions" className="text-sm text-red-500">View all</Link>
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-500 mb-4">No confirmed transactions yet</p>
                  <Link href="/receipts/upload" className="inline-flex items-center gap-2 rounded-full bg-red-500 text-white px-4 py-2 text-sm">
                    <Plus className="h-4 w-4" />
                    Upload Receipt
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recent.map((transaction) => (
                    <Link key={transaction.id} href={`/transactions/${transaction.id}`} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.merchantName}</p>
                        <p className="text-sm text-gray-500">{transaction.category?.name || "Other"}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(toAmount(transaction.totalAmount))}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-900">Spending by Category</CardTitle>
              <Link href="/analytics" className="text-sm text-red-500">View analytics</Link>
            </CardHeader>
            <CardContent>
              {categoryTotals.length === 0 ? (
                <p className="text-gray-500 py-12 text-center">Start tracking to see a breakdown</p>
              ) : (
                <div className="space-y-3">
                  {categoryTotals.map((row) => (
                    <div key={row.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{row.name}</span>
                      <span className="font-medium">{formatCurrency(row.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
