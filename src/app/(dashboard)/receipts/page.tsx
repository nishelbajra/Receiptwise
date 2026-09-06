import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Receipt, Upload } from "lucide-react";

export default async function ReceiptsPage() {
  const session = await auth();
  const receipts = session?.user?.id
    ? await db.receipt.findMany({
        where: { userId: session.user.id },
        include: { transaction: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Receipts" />
      <div className="p-6">
        {receipts.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <Receipt className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No receipts yet</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Upload a photo. Tesseract and rules draft the fields. You confirm before anything is saved as spending.
              </p>
              <Link
                href="/receipts/upload"
                className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-medium"
              >
                <Upload className="h-5 w-5" />
                Upload Receipt
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">{receipts.length} receipts</h2>
              <Link href="/receipts/upload" className="rounded-full bg-red-500 text-white px-4 py-2 text-sm">
                Upload
              </Link>
            </div>
            <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {receipts.map((receipt) => (
                  <div key={receipt.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                        <img
                          src={`/api/receipts/${receipt.id}/file`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {receipt.originalFilename || "Receipt"}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(receipt.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{receipt.processingStatus}</p>
                      <p className="text-xs text-gray-500">
                        {receipt.transaction ? "Confirmed" : "Awaiting confirmation"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
