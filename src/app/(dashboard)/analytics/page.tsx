import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSpendingByCategory, getSpendingSummary, compareMonths } from "@/lib/assistant/tools";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}`;

  const [summary, byCategory, comparison] = await Promise.all([
    getSpendingSummary(userId, thisMonth),
    getSpendingByCategory(userId, thisMonth),
    compareMonths(userId, thisMonth, lastMonth),
  ]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Analytics" />
      <div className="p-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <PieChart className="h-5 w-5 text-red-500" />
                Spending by Category · {summary.month}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {byCategory.categories.length === 0 ? (
                <p className="text-gray-500 py-12 text-center">Add confirmed transactions to see a breakdown</p>
              ) : (
                <div className="space-y-3">
                  {byCategory.categories.map((row) => (
                    <div key={row.category} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{row.category}</p>
                        <p className="text-xs text-gray-500">{row.count} transactions</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(row.total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BarChart3 className="h-5 w-5 text-red-500" />
                Monthly Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{comparison.monthA.month}</span>
                <span className="font-semibold">{formatCurrency(comparison.monthA.totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{comparison.monthB.month}</span>
                <span className="font-semibold">{formatCurrency(comparison.monthB.totalSpent)}</span>
              </div>
              <p className="text-sm text-gray-500">
                Change: {formatCurrency(comparison.delta)}
                {comparison.percentChange != null ? ` (${comparison.percentChange}%)` : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-red-500" />
                This month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.totalSpent)}</p>
              <p className="text-sm text-gray-500 mt-1">{summary.transactionCount} confirmed transactions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
