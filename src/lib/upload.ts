import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveUploadedFile(
  file: File
): Promise<{ storageKey: string; filePath: string }> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${randomUUID()}.${extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return {
    storageKey: fileName,
    filePath: `/uploads/${fileName}`,
  };
}

export async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

export function getMimeType(file: File): string {
  // Handle common mime types and iPhone screenshots
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  
  // iPhone HEIC images
  if (name.endsWith(".heic") || name.endsWith(".heif")) {
    return "image/heic";
  }
  
  // Common image types
  if (type.startsWith("image/")) {
    return type;
  }
  
  // PDF
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return "application/pdf";
  }
  
  // Fallback based on extension
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (name.endsWith(".png")) {
    return "image/png";
  }
  if (name.endsWith(".webp")) {
    return "image/webp";
  }
  
  // Default
  return type || "image/jpeg";
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 20 * 1024 * 1024; // 20MB (Gemini supports up to 20MB)
  
  const allowedTypes = [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/pdf",
  ];
  
  const allowedExtensions = [
    ".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".pdf"
  ];

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 20MB" };
  }

  const extension = "." + (file.name.split(".").pop()?.toLowerCase() || "");
  const hasValidType = allowedTypes.includes(file.type.toLowerCase());
  const hasValidExtension = allowedExtensions.includes(extension);

  if (!hasValidType && !hasValidExtension) {
    return {
      valid: false,
      error: "Supported formats: JPG, PNG, WebP, HEIC (iPhone), PDF",
    };
  }

  return { valid: true };
}
