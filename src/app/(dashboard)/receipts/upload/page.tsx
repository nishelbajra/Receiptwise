"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Camera, Image, Sparkles } from "lucide-react";

export default function UploadReceiptPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Upload Receipt" />
      
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Upload Area */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-red-400 transition-colors cursor-pointer">
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
              />
              <label
                htmlFor="receipt-upload"
                className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-medium transition-colors cursor-pointer"
              >
                Select File
              </label>
              <p className="text-xs text-gray-400 mt-4">
                Supports JPG, PNG, and PDF up to 10MB
              </p>
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

        {/* AI Info */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Sparkles className="h-5 w-5 text-red-500" />
              AI-Powered Extraction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Our AI will automatically extract:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Merchant name and address",
                "Date and time",
                "Total, subtotal, tax, and tip",
                "Individual line items",
                "Payment method (if visible)",
                "Category suggestion",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100">
              <p className="text-sm text-gray-600">
                <span className="text-red-600 font-medium">Coming in Phase 2:</span> AI extraction will be enabled. 
                For now, you can manually enter transaction details after uploading.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
