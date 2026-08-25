import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Welcome back, {firstName}!</h2>
            <p className="text-slate-400 mt-1">Here&apos;s what&apos;s happening with your finances.</p>
          </div>
          <Link
            href="/receipts/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Upload Receipt
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Spent Today</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">$0.00</div>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <ArrowDownRight className="h-3 w-3 text-emerald-400 mr-1" />
                <span className="text-emerald-400">No spending yet</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Spent This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">$0.00</div>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <span className="text-slate-400">Start tracking to see trends</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Spent This Month</CardTitle>
              <Receipt className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">$0.00</div>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <span className="text-slate-400">0 transactions</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Monthly Budget</CardTitle>
              <CreditCard className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">Not set</div>
              <p className="text-xs text-slate-500 mt-1">
                <Link href="/settings" className="text-sky-400 hover:text-sky-300">
                  Set up budget →
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center justify-between">
                Recent Transactions
                <Link href="/transactions" className="text-sm font-normal text-sky-400 hover:text-sky-300">
                  View all
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Receipt className="h-12 w-12 text-slate-700 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No transactions yet</h3>
                <p className="text-sm text-slate-500 mb-4 max-w-sm">
                  Upload your first receipt to start tracking your spending automatically.
                </p>
                <Link
                  href="/receipts/upload"
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-4 py-2 text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Upload Receipt
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Spending by Category */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center justify-between">
                Spending by Category
                <Link href="/analytics" className="text-sm font-normal text-sky-400 hover:text-sky-300">
                  Analytics
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="h-12 w-12 text-slate-700 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No data yet</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Your spending breakdown will appear here once you start tracking transactions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-sky-500/10 text-sky-400">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
              <p className="text-slate-400 text-sm">
                Your personalized financial insights will appear here once you have enough transaction data.
                Upload receipts to get started!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
