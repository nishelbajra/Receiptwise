"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

interface ReceiptData {
  id: string;
  originalFilename: string;
  processingStatus: string;
  createdAt: string;
  rawExtraction: {
    merchantName?: string;
    merchantAddress?: string;
    transactionDate?: string;
    totalAmount?: number;
    subtotal?: number;
    taxAmount?: number;
    tipAmount?: number;
    category?: string;
    items?: Array<{ description: string; quantity: number; totalPrice: number }>;
  } | null;
  transaction: { id: string } | null;
}

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReceipt();
  }, [params.id]);

  async function fetchReceipt() {
    try {
      const res = await fetch(`/api/receipts/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch receipt");
      const data = await res.json();
      setReceipt(data);
    } catch {
      setError("Failed to load receipt");
    } finally {
      setLoading(false);
    }
  }

  async function confirmReceipt() {
    if (!receipt?.rawExtraction) return;
    setConfirming(true);
    setError("");

    try {
      const ext = receipt.rawExtraction;
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptId: receipt.id,
          merchantName: ext.merchantName || "Unknown",
          merchantAddress: ext.merchantAddress,
          transactionDate: ext.transactionDate || new Date().toISOString().slice(0, 10),
          totalAmount: ext.totalAmount || 0,
          subtotal: ext.subtotal,
          taxAmount: ext.taxAmount,
          tipAmount: ext.tipAmount,
          category: ext.category,
          items: ext.items,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to confirm");
      }

      router.push("/receipts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm receipt");
    } finally {
      setConfirming(false);
    }
  }

  async function deleteReceipt() {
    if (!confirm("Delete this receipt?")) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/receipts/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/receipts");
    } catch {
      setError("Failed to delete receipt");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header title="Receipt" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header title="Receipt" />
        <div className="p-6 text-center text-gray-500">Receipt not found</div>
      </div>
    );
  }

  const ext = receipt.rawExtraction;
  const isConfirmed = !!receipt.transaction;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Receipt Details" />
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <Link href="/receipts" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Receipts
        </Link>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Receipt Image */}
        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
          <img
            src={`/api/receipts/${receipt.id}/file`}
            alt="Receipt"
            className="w-full max-h-96 object-contain bg-gray-100"
          />
        </Card>

        {/* Extracted Data */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Extracted Data</h2>
              {isConfirmed ? (
                <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                  <Check className="h-4 w-4" /> Confirmed
                </span>
              ) : (
                <span className="text-amber-600 text-sm font-medium">Awaiting Confirmation</span>
              )}
            </div>

            {ext ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Merchant</p>
                    <p className="font-medium text-gray-900">{ext.merchantName || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">{ext.transactionDate || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium text-gray-900 text-xl">${ext.totalAmount?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{ext.category || "Other"}</p>
                  </div>
                </div>

                {(ext.subtotal || ext.taxAmount || ext.tipAmount) && (
                  <div className="border-t pt-3 mt-3 space-y-1 text-sm">
                    {ext.subtotal && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>${ext.subtotal.toFixed(2)}</span>
                      </div>
                    )}
                    {ext.taxAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tax</span>
                        <span>${ext.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {ext.tipAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tip</span>
                        <span>${ext.tipAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {ext.items && ext.items.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-sm text-gray-500 mb-2">Items</p>
                    <div className="space-y-1 text-sm">
                      {ext.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-gray-700">{item.description}</span>
                          <span>${item.totalPrice?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No data extracted from this receipt.</p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          {!isConfirmed && ext && (
            <button
              onClick={confirmReceipt}
              disabled={confirming}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 font-medium"
            >
              {confirming ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              Confirm & Save
            </button>
          )}
          <button
            onClick={deleteReceipt}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-6 py-3 font-medium"
          >
            {deleting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
