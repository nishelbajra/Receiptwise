"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Camera, 
  Image, 
  Sparkles, 
  Loader2, 
  Check, 
  X,
  Receipt,
  Calendar,
  DollarSign,
  MapPin,
  CreditCard,
  Tag,
  FileText
} from "lucide-react";

interface ExtractedData {
  merchantName: string;
  merchantAddress?: string;
  transactionDate: string;
  transactionTime?: string;
  subtotal?: number;
  taxAmount?: number;
  tipAmount?: number;
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
  lastFourDigits?: string;
  cardBrand?: string;
  category: string;
  items: {
    description: string;
    quantity: number;
    unitPrice?: number;
    totalPrice: number;
  }[];
  confidence: number;
}

interface MatchedCard {
  id: string;
  accountName: string;
  institutionName: string;
  lastFourDigits: string;
  cardNetwork: string;
}

interface CardMatchResult {
  matched: boolean;
  networkMatches?: boolean;
  card?: MatchedCard;
  message: string;
  suggestAdd?: boolean;
  lastFourDigits?: string;
  cardBrand?: string;
}

export default function UploadReceiptPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [editedData, setEditedData] = useState<ExtractedData | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cardMatch, setCardMatch] = useState<CardMatchResult | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleFile = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setExtractedData(null);
    setEditedData(null);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setCardMatch(null);
    setSelectedCardId(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.extraction) {
        setExtractedData(data.extraction);
        setEditedData(data.extraction);
        setReceiptId(data.receipt.id);

        // Try to match card if last 4 digits were extracted
        if (data.extraction.lastFourDigits) {
          try {
            const matchRes = await fetch("/api/cards/match", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lastFourDigits: data.extraction.lastFourDigits,
                cardBrand: data.extraction.cardBrand,
              }),
            });
            const matchData = await matchRes.json();
            setCardMatch(matchData);
            if (matchData.matched && matchData.card) {
              setSelectedCardId(matchData.card.id);
            }
          } catch (matchErr) {
            console.error("Card matching failed:", matchErr);
          }
        }
      } else {
        throw new Error(data.error || "Failed to extract data from receipt");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editedData || !receiptId) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptId,
          merchantName: editedData.merchantName,
          merchantAddress: editedData.merchantAddress,
          transactionDate: editedData.transactionDate,
          transactionTime: editedData.transactionTime,
          subtotal: editedData.subtotal,
          taxAmount: editedData.taxAmount,
          tipAmount: editedData.tipAmount,
          totalAmount: editedData.totalAmount,
          currency: editedData.currency,
          categoryName: editedData.category,
          items: editedData.items,
          financialAccountId: selectedCardId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save transaction");
      }

      router.push("/transactions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof ExtractedData, value: string | number) => {
    if (!editedData) return;
    setEditedData({ ...editedData, [field]: value });
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setEditedData(null);
    setReceiptId(null);
    setError(null);
    setCardMatch(null);
    setSelectedCardId(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Upload Receipt" />
      
      <div className="p-6 max-w-5xl mx-auto">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!extractedData ? (
          <div className="space-y-6">
            {/* Upload Area */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? "border-red-500 bg-red-50"
                      : file
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-red-400"
                  }`}
                >
                  {file ? (
                    <div className="space-y-4">
                      {preview && (
                        <img
                          src={preview}
                          alt="Receipt preview"
                          className="max-h-64 mx-auto rounded-lg shadow-md"
                        />
                      )}
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <div className="flex justify-center gap-3">
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Extracting...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Extract with AI
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={resetUpload}
                          variant="outline"
                          className="rounded-full"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-red-500 mx-auto mb-6 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Drag and drop your receipt
                      </h3>
                      <p className="text-gray-500 mb-6">
                        or click to browse from your device
                      </p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        id="receipt-upload"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f);
                        }}
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-medium transition-colors cursor-pointer"
                      >
                        Select File
                      </label>
                      <p className="text-xs text-gray-400 mt-4">
                        Supports JPG, PNG, WebP, HEIC, and PDF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Alternative Options */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Take a Photo</h4>
                    <p className="text-sm text-gray-500">Use your camera</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <Image className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Photo Library</h4>
                    <p className="text-sm text-gray-500">Choose existing photo</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Extraction Review */
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Receipt Preview */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Receipt className="h-5 w-5 text-red-500" />
                  Receipt Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {preview && (
                  <img
                    src={preview}
                    alt="Receipt"
                    className="w-full rounded-lg shadow-md"
                  />
                )}
                <div className="mt-4 flex items-center gap-2">
                  <div className={`h-2 flex-1 rounded-full ${
                    extractedData.confidence > 0.8 ? "bg-green-500" :
                    extractedData.confidence > 0.5 ? "bg-yellow-500" : "bg-red-500"
                  }`} style={{ width: `${extractedData.confidence * 100}%` }} />
                  <span className="text-sm text-gray-500">
                    {Math.round(extractedData.confidence * 100)}% confidence
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Extracted Data Form */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Sparkles className="h-5 w-5 text-red-500" />
                  Extracted Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <FileText className="h-4 w-4" />
                    Merchant
                  </Label>
                  <Input
                    value={editedData?.merchantName || ""}
                    onChange={(e) => updateField("merchantName", e.target.value)}
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Input
                    value={editedData?.merchantAddress || ""}
                    onChange={(e) => updateField("merchantAddress", e.target.value)}
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4" />
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={editedData?.transactionDate || ""}
                      onChange={(e) => updateField("transactionDate", e.target.value)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Time</Label>
                    <Input
                      type="time"
                      value={editedData?.transactionTime || ""}
                      onChange={(e) => updateField("transactionTime", e.target.value)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                      <DollarSign className="h-4 w-4" />
                      Total
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editedData?.totalAmount || ""}
                      onChange={(e) => updateField("totalAmount", parseFloat(e.target.value))}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Tax</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editedData?.taxAmount || ""}
                      onChange={(e) => updateField("taxAmount", parseFloat(e.target.value))}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Subtotal</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editedData?.subtotal || ""}
                      onChange={(e) => updateField("subtotal", parseFloat(e.target.value))}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Tip</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editedData?.tipAmount || ""}
                      onChange={(e) => updateField("tipAmount", parseFloat(e.target.value))}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <Tag className="h-4 w-4" />
                    Category
                  </Label>
                  <select
                    value={editedData?.category || ""}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Restaurants">Restaurants</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Travel">Travel</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Card Detection Section */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <CreditCard className="h-4 w-4" />
                    Payment Card
                  </Label>
                  
                  {editedData?.lastFourDigits ? (
                    <div className="space-y-3">
                      {/* Detected card info */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Detected:</span>
                        <span className="font-mono font-medium">
                          {editedData.cardBrand || editedData.paymentMethod || "Card"} ****{editedData.lastFourDigits}
                        </span>
                      </div>

                      {/* Card Match Result */}
                      {cardMatch && (
                        <div className={`p-3 rounded-lg ${
                          cardMatch.matched 
                            ? "bg-green-50 border border-green-200" 
                            : "bg-yellow-50 border border-yellow-200"
                        }`}>
                          {cardMatch.matched && cardMatch.card ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  ✓ Matched: {cardMatch.card.accountName}
                                </p>
                                <p className="text-xs text-green-600">
                                  {cardMatch.card.institutionName} • {cardMatch.card.cardNetwork} ****{cardMatch.card.lastFourDigits}
                                </p>
                              </div>
                              <Check className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-medium text-yellow-800">
                                Card not registered
                              </p>
                              <p className="text-xs text-yellow-600 mb-2">
                                {cardMatch.message}
                              </p>
                              <a
                                href="/accounts"
                                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                              >
                                Add this card →
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                      No card detected on this receipt. You can add it manually after saving.
                    </div>
                  )}
                </div>

                {/* Items */}
                {editedData?.items && editedData.items.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-gray-700">Items</Label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-2 text-gray-600">Item</th>
                            <th className="text-right p-2 text-gray-600">Qty</th>
                            <th className="text-right p-2 text-gray-600">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editedData.items.map((item, idx) => (
                            <tr key={idx} className="border-t border-gray-100">
                              <td className="p-2 text-gray-900">{item.description}</td>
                              <td className="p-2 text-right text-gray-600">{item.quantity}</td>
                              <td className="p-2 text-right text-gray-900">${item.totalPrice.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Transaction
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetUpload}
                    variant="outline"
                    className="rounded-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
