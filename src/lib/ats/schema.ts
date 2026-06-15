import { SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import type { AtsAnalysisResult } from "@/types/ats";

export const ATS_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    isResume: {
      type: SchemaType.BOOLEAN,
      description:
        "True if the document is a resume or CV. False if it is any other type of document such as a cover letter alone, tax form, invoice, academic paper, article, legal contract, or blank document.",
    },
    atsScore: {
      type: SchemaType.NUMBER,
      description:
        "Integer score from 0 to 100 representing overall ATS compatibility and resume quality. Must be 0 if isResume is false.",
    },
    summary: {
      type: SchemaType.STRING,
      description:
        "2-3 sentence executive summary of the candidate's profile and fit. If isResume is false, this must be an empty string.",
    },
    strengths: {
      type: SchemaType.ARRAY,
      description:
        "3 to 4 specific strong points of the resume. If isResume is false, this must be an empty array.",
      items: { type: SchemaType.STRING },
    },
    weaknesses: {
      type: SchemaType.ARRAY,
      description:
        "3 to 4 missing skills, ATS red flags, or formatting issues. If isResume is false, this must be an empty array.",
      items: { type: SchemaType.STRING },
    },
    actionableSteps: {
      type: SchemaType.ARRAY,
      description:
        "Ordered list of concrete, specific improvements the candidate should make. If isResume is false, this must be an empty array.",
      items: { type: SchemaType.STRING },
    },
  },
  required: [
    "isResume",
    "atsScore",
    "summary",
    "strengths",
    "weaknesses",
    "actionableSteps",
  ],
};

export function isValidAtsResult(value: unknown): value is AtsAnalysisResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  if (typeof v.isResume !== "boolean") return false;
  if (typeof v.atsScore !== "number") return false;
  if (typeof v.summary !== "string") return false;
  if (!Array.isArray(v.strengths)) return false;
  if (!Array.isArray(v.weaknesses)) return false;
  if (!Array.isArray(v.actionableSteps)) return false;

  if (!v.isResume) return true;

  return (
    v.atsScore >= 0 &&
    v.atsScore <= 100 &&
    v.summary.trim().length > 0 &&
    v.strengths.length >= 1 &&
    v.strengths.every((s) => typeof s === "string") &&
    v.weaknesses.length >= 1 &&
    v.weaknesses.every((s) => typeof s === "string") &&
    v.actionableSteps.length >= 1 &&
    v.actionableSteps.every((s) => typeof s === "string")
  );
}