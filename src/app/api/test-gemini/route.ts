import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: "GEMINI_API_KEY not set in .env file" 
    }, { status: 400 });
  }

  // Check if it looks like a valid API key format
  if (!apiKey.startsWith("AIza")) {
    return NextResponse.json({ 
      error: "API key doesn't look like a Google AI Studio key. It should start with 'AIza'. Make sure you're using a key from https://aistudio.google.com/app/apikey",
      keyPrefix: apiKey.substring(0, 4) + "..."
    }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try different model names
  const modelsToTry = [
    "gemini-3.6-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest", 
    "gemini-1.5-flash",
    "gemini-pro",
  ];

  const results: Record<string, string> = {};

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'OK' if you can hear me.");
      const text = result.response.text();
      results[modelName] = `✅ Works! Response: ${text.substring(0, 50)}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results[modelName] = `❌ ${message.substring(0, 100)}`;
    }
  }

  return NextResponse.json({ 
    message: "Gemini API Test Results",
    apiKeyFormat: "Valid (starts with AIza)",
    models: results
  });
}
