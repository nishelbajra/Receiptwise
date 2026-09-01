"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Receipt,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Tag,
  DollarSign,
  ShoppingBag,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

interface TransactionItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number;
}

interface Transaction {
  id: string;
  merchantName: string;
  merchantAddress: string | null;
  transactionDate: string;
  transactionTime: string | null;
  subtotal: number | null;
  taxAmount: number | null;
  tipAmount: number | null;
  totalAmount: number;
  currency: string;
  notes: string | null;
  source: string;
  createdAt: string;
  category: { id: string; name: string } | null;
  financialAccount: {
    id: string;
    accountName: string;
    institutionName: string;
    lastFourDigits: string;
    cardNetwork: string;
  } | null;
  receipt: {
    id: string;
    storageKey: string;
    originalFilename: string | null;
    extractionConfidence: number | null;
  } | null;
  items: TransactionItem[];
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransaction() {
      try {
        const res = await fetch(`/api/transactions/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load transaction");
          return;
        }

        setTransaction(data.transaction);
      } catch (err) {
        setError("Failed to load transaction");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchTransaction();
    }
  }, [params.id]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(timeString: string) {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatCurrency(amount: number, currency: string = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header title="Transaction Details" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header title="Transaction Details" />
        <div className="p-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">{error || "Transaction not found"}</p>
              <Link
                href="/transactions"
                className="inline-flex items-center gap-2 mt-4 text-red-500 hover:text-red-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Transactions
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Transaction Details" />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transactions
        </Link>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Receipt Image */}
          <div className="space-y-6">
            {transaction.receipt && (
              <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Receipt className="h-5 w-5 text-red-500" />
                    Receipt Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={`/uploads/${transaction.receipt.storageKey}`}
                      alt="Receipt"
                      className="w-full object-contain max-h-[600px]"
                    />
                  </div>
                  {transaction.receipt.extractionConfidence && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="text-sm text-gray-500">AI Confidence:</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            transaction.receipt.extractionConfidence > 0.8
                              ? "bg-green-500"
                              : transaction.receipt.extractionConfidence > 0.5
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${transaction.receipt.extractionConfidence * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {Math.round(transaction.receipt.extractionConfidence * 100)}%
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!transaction.receipt && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No receipt image attached</p>
                  <p className="text-sm text-gray-400 mt-1">
                    This transaction was added manually
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Transaction Details */}
          <div className="space-y-6">
            {/* Merchant & Amount */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {transaction.merchantName}
                    </h2>
                    {transaction.merchantAddress && (
                      <p className="text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {transaction.merchantAddress}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(Number(transaction.totalAmount), transaction.currency)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(transaction.transactionDate)}
                      </p>
                    </div>
                  </div>

                  {transaction.transactionTime && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Time</p>
                        <p className="font-medium text-gray-900">
                          {formatTime(transaction.transactionTime)}
                        </p>
                      </div>
                    </div>
                  )}

                  {transaction.category && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                        <Tag className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Category</p>
                        <p className="font-medium text-gray-900">
                          {transaction.category.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {transaction.financialAccount && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Card Used</p>
                        <p className="font-medium text-gray-900">
                          {transaction.financialAccount.cardNetwork} ****
                          {transaction.financialAccount.lastFourDigits}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.financialAccount.accountName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Amount Breakdown */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <DollarSign className="h-5 w-5 text-red-500" />
                  Amount Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transaction.subtotal !== null && (
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>
                        {formatCurrency(Number(transaction.subtotal), transaction.currency)}
                      </span>
                    </div>
                  )}
                  {transaction.taxAmount !== null && Number(transaction.taxAmount) > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>
                        {formatCurrency(Number(transaction.taxAmount), transaction.currency)}
                      </span>
                    </div>
                  )}
                  {transaction.tipAmount !== null && Number(transaction.tipAmount) > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tip</span>
                      <span>
                        {formatCurrency(Number(transaction.tipAmount), transaction.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>
                      {formatCurrency(Number(transaction.totalAmount), transaction.currency)}
                    </span>
                  </div>
                </div>
                {transaction.notes && (
                  <p className="mt-4 whitespace-pre-line text-sm text-gray-600 border-t border-gray-100 pt-3">
                    {transaction.notes}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Items List */}
            {transaction.items && transaction.items.length > 0 && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <ShoppingBag className="h-5 w-5 text-red-500" />
                    Items ({transaction.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-gray-100">
                    {transaction.items.map((item, idx) => (
                      <div key={item.id || idx} className="py-3 flex justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.description}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                            {item.unitPrice && ` × ${formatCurrency(Number(item.unitPrice))}`}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(Number(item.totalPrice), transaction.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
