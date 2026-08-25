"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image, FileText, Camera } from "lucide-react";
import { useState } from "react";

export default function UploadReceiptPage() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <Header title="Upload Receipt" />
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Upload a Receipt</CardTitle>
            <CardDescription className="text-slate-400">
              Take a photo or upload an image/PDF of your receipt. Our AI will extract the details automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drop zone */}
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-12 text-center transition-colors
                ${isDragging 
                  ? "border-sky-500 bg-sky-500/10" 
                  : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                }
              `}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                // TODO: Handle file drop in Phase 2
              }}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  // TODO: Handle file selection in Phase 2
                  console.log("File selected:", e.target.files?.[0]);
                }}
              />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-sky-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-100 mb-2">
                  Drop your receipt here
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  or click to browse files
                </p>
                <p className="text-slate-500 text-xs">
                  Supports JPG, PNG, HEIC, and PDF up to 10MB
                </p>
              </div>
            </div>

            {/* Alternative options */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center gap-3 p-4 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Take Photo</p>
                  <p className="text-xs text-slate-500">Use your camera</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Image className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Photo Library</p>
                  <p className="text-xs text-slate-500">Choose from gallery</p>
                </div>
              </button>
            </div>

            {/* Info */}
            <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-200 mb-1">What we extract</p>
                  <p className="text-sm text-slate-400">
                    Merchant name, date, total amount, tax, tip, individual items, payment method, and more.
                    You can review and edit everything before saving.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming soon notice */}
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
          <p className="text-sm text-amber-400">
            <strong>Phase 1 Preview:</strong> Receipt upload UI is ready. AI extraction will be enabled in Phase 2.
          </p>
        </div>
      </div>
    </>
  );
}
