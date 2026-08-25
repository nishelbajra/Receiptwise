import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, Plus } from "lucide-react";
import Link from "next/link";

export default function TransactionsPage() {
  return (
    <>
      <Header title="Transactions" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-slate-400">View and manage all your transactions</p>
          <Link
            href="/receipts/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Link>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <ArrowLeftRight className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-medium text-slate-300 mb-2">No transactions yet</h3>
              <p className="text-slate-500 mb-6 max-w-md">
                Upload a receipt or add a transaction manually to start tracking your spending.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/receipts/upload"
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 font-medium transition-colors"
                >
                  Upload Receipt
                </Link>
                <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-4 py-2 font-medium transition-colors">
                  Add Manually
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
