import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, Plus, Upload } from "lucide-react";
import Link from "next/link";

export default function ReceiptsPage() {
  return (
    <>
      <Header title="Receipts" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400">Manage your uploaded receipts</p>
          </div>
          <Link
            href="/receipts/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Upload Receipt
          </Link>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-medium text-slate-300 mb-2">No receipts uploaded yet</h3>
              <p className="text-slate-500 mb-6 max-w-md">
                Upload your first receipt to start tracking your expenses automatically with AI.
              </p>
              <Link
                href="/receipts/upload"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 font-medium transition-colors"
              >
                <Upload className="h-5 w-5" />
                Upload Your First Receipt
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
