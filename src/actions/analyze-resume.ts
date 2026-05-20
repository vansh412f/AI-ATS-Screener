"use server";

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// ─── Public Result Type (consumed by the client) ──────────────────────────────

export interface AtsAnalysisResult {
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actionableSteps: string[];
}

// ─── Action Return Envelope ───────────────────────────────────────────────────

export type AnalyzeResumeResult =
  | { success: true; data: AtsAnalysisResult }
  | { success: false; error: string };

// ─── Gemini JSON Schema (enforces structured output at the API level) ─────────

const ATS_RESPONSE_SCHEMA = {
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
      description:
        "3 to 4 missing skills, ATS red flags, or formatting issues.",
      items: { type: SchemaType.STRING },
    },
    actionableSteps: {
      type: SchemaType.ARRAY,
      description:
        "Ordered list of concrete, specific improvements the candidate should make.",
      items: { type: SchemaType.STRING },
    },
  },
  required: ["atsScore", "summary", "strengths", "weaknesses", "actionableSteps"],
};

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildPrompt(resumeText: string, jobDescription: string | null): string {
  const jdSection = jobDescription
    ? `
## Target Job Description
${jobDescription}

## Your Role
You are a strict technical recruiter and ATS (Applicant Tracking System) expert.
Evaluate the resume SPECIFICALLY against the job description above.
The ATS score must reflect how well the resume's keywords, skills, and experience
match the job requirements. Penalize heavily for missing required skills or
technologies mentioned in the JD.`
    : `
## Your Role
You are a senior technical recruiter and ATS expert evaluating a resume against
general industry best practices for software engineering roles.
Score based on: quantified impact statements, action verb usage, keyword density,
formatting clarity, skill relevance, and ATS parseability.
Penalize vague language, passive voice, missing metrics, and poor structure.`;

  return `${jdSection}

## Resume Text
${resumeText}

## Instructions
Analyze the resume and respond ONLY with a valid JSON object.
Do not include any markdown fences, preamble, or explanation — raw JSON only.

The JSON must conform exactly to this shape:
{
  "atsScore": <integer 0-100>,
  "summary": "<2-3 sentence professional summary of the candidate>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "actionableSteps": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"]
}

Scoring guide:
- 80-100: Excellent — strong keyword match, quantified achievements, clean format
- 60-79: Good — solid experience but gaps in keywords or impact statements
- 40-59: Fair — relevant experience but significant ATS or content issues
- 0-39: Poor — major keyword mismatches, vague content, or structural problems`;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function isValidAtsResult(value: unknown): value is AtsAnalysisResult {
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

// ─── Server Action ────────────────────────────────────────────────────────────

export async function analyzeResumeAction(
  resumeText: string,
  jobDescription: string | null
): Promise<AnalyzeResumeResult> {
  // ── 1. Guard: API Key ──────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error:
        "GEMINI_API_KEY is not configured. Add it to your .env.local file.",
    };
  }

  // ── 2. Guard: Input ────────────────────────────────────────────────────────
  const trimmedText = resumeText?.trim();
  if (!trimmedText || trimmedText.length < 50) {
    return {
      success: false,
      error:
        "Resume text is too short to analyze. Please upload a complete resume.",
    };
  }

  // ── 3. Initialize Gemini with structured output schema ────────────────────
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: ATS_RESPONSE_SCHEMA,
      temperature: 0.2, // Low temperature for consistent, structured scoring
    },
  });

  // ── 4. Build prompt and call the API ──────────────────────────────────────
  const prompt = buildPrompt(trimmedText, jobDescription);

  let rawResponseText: string;
  try {
    const result = await model.generateContent(prompt);
    rawResponseText = result.response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown API error";

    if (message.includes("API_KEY_INVALID") || message.includes("403")) {
      return {
        success: false,
        error: "Invalid Gemini API key. Please check your GEMINI_API_KEY.",
      };
    }
    if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
      return {
        success: false,
        error: "Gemini API rate limit reached. Please try again in a moment.",
      };
    }
    if (message.includes("SAFETY")) {
      return {
        success: false,
        error:
          "The resume content was flagged by safety filters. Please check the document.",
      };
    }

    return { success: false, error: `Gemini API error: ${message}` };
  }

  // ── 5. Parse and validate the JSON response ────────────────────────────────
  // Strip markdown fences defensively even though we requested raw JSON
  const cleaned = rawResponseText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return {
      success: false,
      error:
        "Gemini returned an unexpected response format. Please try again.",
    };
  }

  if (!isValidAtsResult(parsed)) {
    return {
      success: false,
      error:
        "Gemini response was missing required fields. Please try again.",
    };
  }

  // Clamp score to valid integer range as a final safety measure
  const safeResult: AtsAnalysisResult = {
    ...parsed,
    atsScore: Math.min(100, Math.max(0, Math.round(parsed.atsScore))),
  };

  return { success: true, data: safeResult };
}