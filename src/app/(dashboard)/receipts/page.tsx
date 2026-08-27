import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, Plus, Upload } from "lucide-react";
import Link from "next/link";

export default function ReceiptsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Receipts" />
      
      <div className="p-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <Receipt className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No receipts yet</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Upload your first receipt to start tracking your expenses. 
              Our AI will automatically extract all the details.
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
                Add Manually
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
