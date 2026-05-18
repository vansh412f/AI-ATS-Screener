"use server";

// Polyfill DOMMatrix for the Node.js backend to prevent pdf.js crashes
if (typeof global !== "undefined" && typeof global.DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class DOMMatrix {};
}

const pdfParse = require("pdf-parse");

export type ParsePdfResult =
  | { success: true; text: string; pageCount: number; jobDescription: string | null; error: null; }
  | { success: false; text: null; pageCount?: never; jobDescription?: never; error: string; };

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; 
const ACCEPTED_MIME_TYPE = "application/pdf";

function validateFile(file: File): string | null {
  if (file.type !== ACCEPTED_MIME_TYPE) {
    return `Invalid file type: "${file.type}". Only PDF files are accepted.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the 5 MB limit.`;
  }
  if (file.size === 0) {
    return "The uploaded file is empty.";
  }
  return null;
}

function sanitizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")        // Normalize line endings
    .replace(/\r/g, "\n")           // Normalize carriage returns
    .replace(/\f/g, "\n")           // Replace form feeds
    .replace(/[ \t]+/g, " ")        // Collapse horizontal whitespace
    .replace(/\n{3,}/g, "\n\n")     // Collapse excessive blank lines
    .trim();
}


export async function parsePdf(formData: FormData): Promise<ParsePdfResult> {
  const rawFile = formData.get("resume");

  if (!rawFile) {
    return {
      success: false,
      text: null,
      error: "No file was received. Please attach a PDF resume.",
    };
  }

  if (!(rawFile instanceof File)) {
    return {
      success: false,
      text: null,
      error: "Invalid payload: the 'resume' field must be a file.",
    };
  }

  const validationError = validateFile(rawFile);
  if (validationError) {
    return { success: false, text: null, error: validationError };
  }

  const rawJobDescription = formData.get("jobDescription");
  const jobDescription =
    typeof rawJobDescription === "string" && rawJobDescription.trim().length > 0
      ? rawJobDescription.trim()
      : null;

  let buffer: Buffer;
  try {
    const arrayBuffer = await rawFile.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      text: null,
      error: `Failed to read file into memory: ${message}`,
    };
  }

  let parsedData: Awaited<ReturnType<typeof pdfParse>>;
  try {
    parsedData = await pdfParse(buffer, {
      // Disable the internal test-file fixture check that pdf-parse uses
      // when no `data` param is found; keeps the call clean and in-memory.
      max: 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown parsing error";

    if (message.toLowerCase().includes("password")) {
      return {
        success: false,
        text: null,
        error: "This PDF is password-protected. Please upload an unlocked copy.",
      };
    }
    if (message.toLowerCase().includes("invalid pdf")) {
      return {
        success: false,
        text: null,
        error: "The file does not appear to be a valid PDF.",
      };
    }

    return {
      success: false,
      text: null,
      error: `PDF parsing failed: ${message}`,
    };
  }

  const rawText: string = parsedData.text ?? "";

  if (!rawText.trim()) {
    return {
      success: false,
      text: null,
      error:
        "No readable text was found in this PDF. It may be a scanned image " +
        "without an OCR layer. Please use a text-based PDF.",
    };
  }

  const cleanText = sanitizeText(rawText);

  return {
    success: true,
    text: cleanText,
    pageCount: parsedData.numpages,
    jobDescription,
    error: null,
  };
}