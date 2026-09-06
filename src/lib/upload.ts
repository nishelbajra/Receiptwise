import { access, mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

function storageDir() {
  return path.resolve(process.env.STORAGE_DIR || path.join(process.cwd(), "storage", "receipts"));
}

export function validateFile(file: File): { valid: true } | { valid: false; error: string } {
  if (!file.type || (!ALLOWED_TYPES.has(file.type) && !file.type.startsWith("image/"))) {
    if (file.type === "application/pdf") {
      return {
        valid: false,
        error: "PDF support comes later. Photograph the receipt for now — Tesseract is faster on photos.",
      };
    }
    return { valid: false, error: "Please upload a JPG, PNG, or WebP receipt photo." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File must be 10MB or smaller." };
  }
  return { valid: true };
}

export function getMimeType(file: File) {
  return file.type || "image/jpeg";
}

function extensionFor(file: File) {
  const fromName = path.extname(file.name || "").toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  return ".jpg";
}

export async function saveUploadedFile(file: File) {
  const dir = storageDir();
  await mkdir(dir, { recursive: true });
  const storageKey = `${randomUUID()}${extensionFor(file)}`;
  const absolutePath = path.join(dir, storageKey);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);
  return { storageKey, absolutePath, buffer };
}

export function getStoredFilePath(storageKey: string) {
  const safeKey = path.basename(storageKey);
  const primary = path.resolve(storageDir(), safeKey);
  const legacy = path.resolve(process.cwd(), "public", "uploads", safeKey);
  return { primary, legacy, safeKey };
}

export async function readStoredFile(storageKey: string) {
  const { primary, legacy } = getStoredFilePath(storageKey);
  for (const candidate of [primary, legacy]) {
    try {
      await access(candidate);
      return readFile(candidate);
    } catch {
      continue;
    }
  }
  return null;
}

export async function deleteStoredFile(storageKey: string) {
  const { primary, legacy } = getStoredFilePath(storageKey);
  await Promise.allSettled([unlink(primary), unlink(legacy)]);
}

export async function fileToBase64(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
}
