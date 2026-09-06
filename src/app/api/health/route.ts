import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkOcrHealth } from "@/lib/ocr";
import { checkOllamaHealth, ollamaModel } from "@/lib/ollama";

export async function GET() {
  const checks = {
    database: "error",
    ocr: "error",
    ollama: "error",
  };
  const details: Record<string, unknown> = {};

  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch (error) {
    details.database = error instanceof Error ? error.message : "Database unreachable";
  }

  try {
    details.ocr = await checkOcrHealth();
    checks.ocr = "ok";
  } catch (error) {
    details.ocr = error instanceof Error ? error.message : "OCR service unreachable";
  }

  try {
    details.ollama = await checkOllamaHealth();
    checks.ollama = "ok";
  } catch (error) {
    details.ollama = error instanceof Error ? error.message : "Ollama unreachable";
  }

  const ok = Object.values(checks).every((status) => status === "ok");
  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      model: ollamaModel(),
      checks,
      details,
    },
    { status: ok ? 200 : 503 }
  );
}
