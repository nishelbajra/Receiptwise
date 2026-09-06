"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Check,
  DollarSign,
  FileText,
  CreditCard,
  HelpCircle,
  Loader2,
  MapPin,
  Receipt,
  ScanText,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { CATEGORY_NAMES } from "@/lib/categories";

interface ReceiptQuestion {
  field: string;
  question: string;
}

interface ExtractedData {
  merchantName: string;
  merchantAddress?: string | null;
  merchantCandidates?: string[];
  transactionDate: string;
  transactionTime?: string | null;
  subtotal?: number | null;
  taxAmount?: number | null;
  tipAmount?: number | null;
  totalAmount: number;
  currency: string;
  category: string;
  confidence: number;
  questions?: ReceiptQuestion[];
  enrichmentSource?: "ollama" | "parser-only";
  paymentMethod?: string | null;
  lastFourDigits?: string | null;
  cardBrand?: string | null;
  financialAccountId?: string | null;
  matchedCard?: {
    id: string;
    accountName: string;
    institutionName: string;
    lastFourDigits: string | null;
    cardNetwork: string | null;
  } | null;
}

interface UserCard {
  id: string;
  accountName: string;
  institutionName: string;
  lastFourDigits: string | null;
  cardNetwork: string | null;
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
  const [cards, setCards] = useState<UserCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  useEffect(() => {
    void fetch("/api/cards")
      .then((response) => response.json())
      .then((data) => setCards(data.cards || []))
      .catch(() => undefined);
  }, []);

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

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.extraction) {
        throw new Error(data.error || "Could not read this receipt");
      }
      setExtractedData(data.extraction);
      setEditedData(data.extraction);
      setReceiptId(data.receipt.id);
      setSelectedCardId(data.extraction.financialAccountId || data.extraction.matchedCard?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editedData || !receiptId) return;
    if (!editedData.merchantName.trim() || !editedData.totalAmount) {
      setError("Merchant and total are required before saving.");
      return;
    }
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
          currency: editedData.currency || "USD",
          categoryName: editedData.category,
          lastFourDigits: editedData.lastFourDigits,
          cardBrand: editedData.cardBrand || editedData.paymentMethod,
          financialAccountId: selectedCardId || null,
          paymentMethodConfidence: selectedCardId ? "HIGH" : "UNKNOWN",
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

  const updateField = (field: keyof ExtractedData, value: string | number | null) => {
    if (!editedData) return;
    setEditedData({ ...editedData, [field]: value });
  };

  const parseMoneyInput = (value: string) => {
    if (value === "") return null;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setEditedData(null);
    setReceiptId(null);
    setError(null);
    setSelectedCardId("");
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
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-8">
              <div
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  const dropped = event.dataTransfer.files[0];
                  if (dropped) handleFile(dropped);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                className={`border-2 border-dashed rounded-2xl p-12 text-center ${
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
                      <img src={preview} alt="Receipt preview" className="max-h-64 mx-auto rounded-lg" />
                    )}
                    <p className="font-medium text-green-700">{file.name}</p>
                    <div className="flex justify-center gap-3">
                      <Button onClick={handleUpload} disabled={isUploading} className="bg-red-500 hover:bg-red-600 text-white rounded-full">
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Reading receipt...
                          </>
                        ) : (
                          <>
                            <ScanText className="mr-2 h-4 w-4" />
                            Read receipt
                          </>
                        )}
                      </Button>
                      <Button onClick={resetUpload} variant="outline" className="rounded-full">
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Tesseract reads the text, rules find totals, and Qwen only cleans the merchant and category.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-500 mx-auto mb-6 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop a receipt photo</h3>
                    <p className="text-gray-500 mb-6">JPG, PNG, or WebP up to 10MB. Nothing is saved as a transaction until you confirm.</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic"
                      className="hidden"
                      id="receipt-upload"
                      onChange={(event) => {
                        const next = event.target.files?.[0];
                        if (next) handleFile(next);
                      }}
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-medium cursor-pointer"
                    >
                      Select photo
                    </label>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Receipt className="h-5 w-5 text-red-500" />
                  Receipt
                </CardTitle>
              </CardHeader>
              <CardContent>
                {preview && <img src={preview} alt="Receipt" className="w-full rounded-lg" />}
                <p className="mt-4 text-sm text-gray-500">
                  {Math.round((extractedData.confidence || 0) * 100)}% OCR confidence
                  {extractedData.enrichmentSource === "parser-only" ? " · Qwen unavailable, parser only" : " · Qwen cleaned merchant and category"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <ScanText className="h-5 w-5 text-red-500" />
                  Review before saving
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {extractedData.questions && extractedData.questions.length > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                    <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Please confirm these fields
                    </p>
                    {extractedData.questions.map((item) => (
                      <p key={item.field} className="text-sm text-amber-700">{item.question}</p>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <FileText className="h-4 w-4" />
                    Merchant
                  </Label>
                  <Input
                    value={editedData?.merchantName || ""}
                    onChange={(event) => updateField("merchantName", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Input
                    value={editedData?.merchantAddress || ""}
                    onChange={(event) => updateField("merchantAddress", event.target.value)}
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
                      onChange={(event) => updateField("transactionDate", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Time</Label>
                    <Input
                      type="time"
                      value={editedData?.transactionTime || ""}
                      onChange={(event) => updateField("transactionTime", event.target.value)}
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
                      value={editedData?.totalAmount ?? ""}
                      onChange={(event) => updateField("totalAmount", parseMoneyInput(event.target.value) ?? 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Tax</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editedData?.taxAmount ?? ""}
                      onChange={(event) => updateField("taxAmount", parseMoneyInput(event.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Subtotal</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editedData?.subtotal ?? ""}
                      onChange={(event) => updateField("subtotal", parseMoneyInput(event.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Tip</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editedData?.tipAmount ?? ""}
                      onChange={(event) => updateField("tipAmount", parseMoneyInput(event.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <CreditCard className="h-4 w-4" />
                    Payment card
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={editedData?.cardBrand || editedData?.paymentMethod || ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (!editedData) return;
                        const isCard = ["VISA", "MASTERCARD", "AMEX", "DISCOVER"].includes(value);
                        setEditedData({
                          ...editedData,
                          paymentMethod: value || null,
                          cardBrand: isCard ? value : null,
                        });
                      }}
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                    >
                      <option value="">Unknown</option>
                      <option value="VISA">Visa</option>
                      <option value="MASTERCARD">Mastercard</option>
                      <option value="AMEX">Amex</option>
                      <option value="DISCOVER">Discover</option>
                      <option value="DEBIT">Debit</option>
                      <option value="CASH">Cash</option>
                    </select>
                    <Input
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="Last 4"
                      value={editedData?.lastFourDigits || ""}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                        updateField("lastFourDigits", digits);
                        if (digits.length === 4) {
                          void fetch("/api/cards/match", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              lastFourDigits: digits,
                              cardBrand: editedData?.cardBrand || editedData?.paymentMethod,
                            }),
                          })
                            .then((response) => response.json())
                            .then((match) => {
                              if (match.matched && match.card) {
                                setSelectedCardId(match.card.id);
                              }
                            })
                            .catch(() => undefined);
                        }
                      }}
                      className="font-mono"
                    />
                  </div>
                  <select
                    value={selectedCardId}
                    onChange={(event) => setSelectedCardId(event.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                  >
                    <option value="">No card assigned</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.accountName} · {card.cardNetwork} ****{card.lastFourDigits}
                      </option>
                    ))}
                  </select>
                  {editedData?.matchedCard && selectedCardId === editedData.matchedCard.id ? (
                    <p className="text-sm text-green-700">
                      Matched {editedData.matchedCard.accountName} ({editedData.matchedCard.institutionName})
                    </p>
                  ) : editedData?.lastFourDigits && !selectedCardId ? (
                    <p className="text-sm text-amber-700">
                      No saved card ends in {editedData.lastFourDigits}.{" "}
                      <a href="/accounts" className="underline">Add it under Accounts</a>
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <Tag className="h-4 w-4" />
                    Category
                  </Label>
                  <select
                    value={editedData?.category || "Other"}
                    onChange={(event) => updateField("category", event.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                  >
                    {CATEGORY_NAMES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

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
                        Confirm and save
                      </>
                    )}
                  </Button>
                  <Button onClick={resetUpload} variant="outline" className="rounded-full">
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
