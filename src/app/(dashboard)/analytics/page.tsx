import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, TrendingUp, BarChart3, Calendar } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <>
      <Header title="Analytics" />
      <div className="p-6 space-y-6">
        <p className="text-slate-400">Detailed insights into your spending patterns</p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Spending by Category */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <PieChart className="h-7 w-7 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Spending by Category</h3>
                <p className="text-slate-500 text-sm">
                  Upload transactions to see your spending breakdown
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Spending Over Time */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <TrendingUp className="h-7 w-7 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Spending Over Time</h3>
                <p className="text-slate-500 text-sm">
                  Track your spending trends week over week
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Comparison */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <BarChart3 className="h-7 w-7 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Monthly Comparison</h3>
                <p className="text-slate-500 text-sm">
                  Compare your spending month over month
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <Calendar className="h-7 w-7 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Calendar View</h3>
                <p className="text-slate-500 text-sm">
                  See your spending by day on a calendar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-4">
          <p className="text-sm text-sky-400">
            <strong>Tip:</strong>{" "}
            <Link href="/receipts/upload" className="underline hover:no-underline">
              Upload your first receipt
            </Link>{" "}
            to start seeing your analytics come to life.
          </p>
        </div>
      </div>
    </>
  );
}
