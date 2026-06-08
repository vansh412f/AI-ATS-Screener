"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AtsMode, AnalyzeResumeResult, AtsAnalysisResult } from "@/types/ats";
import { ATS_RESPONSE_SCHEMA, isValidAtsResult } from "@/lib/ats/schema";
import { buildPrompt } from "@/lib/ats/prompts";

// export type { AtsMode, AnalyzeResumeResult, AtsAnalysisResult };

export async function analyzeResumeAction(
  resumeText: string,
  jobDescription: string | null,
  atsMode: AtsMode = "general"
): Promise<AnalyzeResumeResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "GEMINI_API_KEY is not configured. Add it to your .env.local file.",
    };
  }

  const trimmedText = resumeText?.trim();
  if (!trimmedText || trimmedText.length < 50) {
    return {
      success: false,
      error: "Resume text is too short to analyze. Please upload a complete resume.",
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: ATS_RESPONSE_SCHEMA,
      temperature: atsMode === "legacy" ? 0.1 : 0.2,
    },
  });

  const prompt = buildPrompt(trimmedText, jobDescription, atsMode);

  let rawResponseText: string;
  try {
    const result = await model.generateContent(prompt);
    rawResponseText = result.response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown API error";

    if (message.includes("API_KEY_INVALID") || message.includes("403")) {
      return {
        success: false,
        error: "Invalid API key configuration. Please contact support.",
      };
    }
    if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
      return {
        success: false,
        error:
          "Our analysis engine has reached its request limit. Please wait a moment and try again.",
      };
    }
    if (message.includes("SAFETY")) {
      return {
        success: false,
        error:
          "The resume content was flagged by safety filters. Please check the document.",
      };
    }
    if (
      message.includes("503") ||
      message.includes("500") ||
      message.includes("overloaded") ||
      message.includes("high demand") ||
      message.includes("unavailable") ||
      message.includes("UNAVAILABLE")
    ) {
      return {
        success: false,
        error:
          "Our semantic evaluation servers are currently experiencing peak traffic volume. Please wait a moment and try again.",
      };
    }

    return {
      success: false,
      error:
        "Our evaluation pipeline encountered an unexpected issue. Please try again shortly.",
    };
  }

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
      error: "The analysis returned an unexpected format. Please try again.",
    };
  }

  if (!isValidAtsResult(parsed)) {
    return {
      success: false,
      error: "The analysis response was incomplete. Please try again.",
    };
  }

  const safeResult: AtsAnalysisResult = {
    ...parsed,
    atsScore: Math.min(100, Math.max(0, Math.round(parsed.atsScore))),
  };

  return { success: true, data: safeResult };
}