import { SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import type { AtsAnalysisResult } from "@/types/ats";

const ENGINE_RESULT_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    atsScore: {
      type: SchemaType.NUMBER,
      description:
        "Integer score from 0 to 100 representing overall ATS compatibility and resume quality.",
    },
    summary: {
      type: SchemaType.STRING,
      description:
        "2-3 sentence assessment of the candidate's fit from this engine's perspective.",
    },
    strengths: {
      type: SchemaType.ARRAY,
      description: "3 specific, evidence-backed strong points of the resume.",
      items: { type: SchemaType.STRING },
    },
    weaknesses: {
      type: SchemaType.ARRAY,
      description: "3 specific gaps, missing keywords, or issues found.",
      items: { type: SchemaType.STRING },
    },
    actionableSteps: {
      type: SchemaType.ARRAY,
      description:
        "4 concrete improvement steps that quote actual resume text and suggest specific replacements.",
      items: { type: SchemaType.STRING },
    },
  },
  required: [
    "atsScore",
    "summary",
    "strengths",
    "weaknesses",
    "actionableSteps",
  ],
};

export const ATS_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    isResume: {
      type: SchemaType.BOOLEAN,
      description:
        "True if the document is a resume or CV. False if it is any other document type such as a cover letter alone, tax form, invoice, academic paper, article, or legal contract.",
    },
    legacy: {
      ...ENGINE_RESULT_SCHEMA,
      description:
        "Scores and feedback from the legacy keyword-matching ATS engine simulation.",
    } as Schema,
    modern: {
      ...ENGINE_RESULT_SCHEMA,
      description:
        "Scores and feedback from the modern semantic AI ATS engine simulation.",
    } as Schema,
  },
  required: ["isResume", "legacy", "modern"],
};

export interface CombinedAtsResponse {
  isResume: boolean;
  legacy: AtsAnalysisResult;
  modern: AtsAnalysisResult;
}

export function isValidCombinedResult(
  value: unknown
): value is CombinedAtsResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  if (typeof v.isResume !== "boolean") return false;

  if (!v.isResume) return true;

  return isValidEngineResult(v.legacy) && isValidEngineResult(v.modern);
}

function isValidEngineResult(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v.atsScore === "number" &&
    v.atsScore >= 0 &&
    v.atsScore <= 100 &&
    typeof v.summary === "string" &&
    v.summary.trim().length > 0 &&
    Array.isArray(v.strengths) &&
    v.strengths.length >= 1 &&
    v.strengths.every((s) => typeof s === "string") &&
    Array.isArray(v.weaknesses) &&
    v.weaknesses.length >= 1 &&
    v.weaknesses.every((s) => typeof s === "string") &&
    Array.isArray(v.actionableSteps) &&
    v.actionableSteps.length >= 1 &&
    v.actionableSteps.every((s) => typeof s === "string")
  );
}