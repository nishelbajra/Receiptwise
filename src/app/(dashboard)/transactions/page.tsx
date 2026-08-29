import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight, Plus, Upload, Receipt, Calendar, Tag, CreditCard } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function TransactionsPage() {
  const session = await auth();
  
  const transactions = await db.transaction.findMany({
    where: { userId: session?.user?.id },
    include: {
      category: true,
      receipt: true,
      financialAccount: true,
    },
    orderBy: { transactionDate: "desc" },
    take: 50,
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Transactions" />
      
      <div className="p-6">
        {transactions.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <ArrowLeftRight className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Your transactions will appear here once you upload receipts 
                or add them manually.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/receipts/upload"
                  className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-medium transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  Upload Receipt
                </Link>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-6 py-3 font-medium transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Transaction
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
              </h2>
              <Link
                href="/receipts/upload"
                className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add New
              </Link>
            </div>

            <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <Link
                    href={`/transactions/${transaction.id}`}
                    key={transaction.id}
                    className="block p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                          {transaction.receipt ? (
                            <Receipt className="h-6 w-6 text-red-500" />
                          ) : (
                            <ArrowLeftRight className="h-6 w-6 text-red-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {transaction.merchantName}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(transaction.transactionDate)}
                            </span>
                            {transaction.category && (
                              <span className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {transaction.category.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(Number(transaction.totalAmount), transaction.currency)}
                        </p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          {transaction.financialAccount && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              <CreditCard className="h-3 w-3" />
                              {transaction.financialAccount.cardNetwork} ****{transaction.financialAccount.lastFourDigits}
                            </span>
                          )}
                          {transaction.receipt && (
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              Receipt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
