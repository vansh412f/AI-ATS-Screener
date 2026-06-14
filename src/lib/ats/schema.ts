import { SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import type { AtsAnalysisResult } from "@/types/ats";

export const ATS_RESPONSE_SCHEMA: Schema = {
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
        "2-3 sentence executive summary of the candidate's profile and fit.",
    },
    strengths: {
      type: SchemaType.ARRAY,
      description: "3 to 4 specific strong points of the resume.",
      items: { type: SchemaType.STRING },
    },
    weaknesses: {
      type: SchemaType.ARRAY,
      description: "3 to 4 missing skills, ATS red flags, or formatting issues.",
      items: { type: SchemaType.STRING },
    },
    actionableSteps: {
      type: SchemaType.ARRAY,
      description:
        "Ordered list of concrete, specific improvements the candidate should make.",
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

export function isValidAtsResult(value: unknown): value is AtsAnalysisResult {
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