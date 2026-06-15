"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { AtsMode, AnalyzeResumeResult, AtsAnalysisResult } from "@/types/ats";
import { ATS_RESPONSE_SCHEMA, isValidAtsResult } from "@/lib/ats/schema";
import { buildPrompt } from "@/lib/ats/prompts";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGeminiWithRetry(
  model: ReturnType<InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]>,
  prompt: string
): Promise<string> {
  const delays = [1000, 2000];
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const message = lastError.message;

      if (
        message.includes("API_KEY_INVALID") ||
        message.includes("403") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        message.includes("429") ||
        message.includes("SAFETY")
      ) {
        throw lastError;
      }

      const isRetryable =
        message.includes("503") ||
        message.includes("500") ||
        message.includes("overloaded") ||
        message.includes("high demand") ||
        message.includes("unavailable") ||
        message.includes("UNAVAILABLE");

      if (!isRetryable) {
        throw lastError;
      }

      if (attempt < 2) {
        await sleep(delays[attempt]);
      }
    }
  }

  throw lastError;
}

export async function analyzeResumeAction(
  resumeText: string,
  jobDescription: string | null,
  atsMode: AtsMode = "general"
): Promise<AnalyzeResumeResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to analyze a resume.",
    };
  }

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const scanCount = await prisma.resumeScan.count({
      where: {
        clerkUserId: userId,
        createdAt: { gte: twentyFourHoursAgo },
      },
    });
    if (scanCount >= 10) {
      return {
        success: false,
        error:
          "You have reached your daily limit of 10 resume scans. Please try again tomorrow.",
      };
    }
  } catch {
    console.error(
      "[analyzeResumeAction] Rate limit DB check failed — failing open."
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error:
        "GEMINI_API_KEY is not configured. Add it to your .env.local file.",
    };
  }

  const trimmedText = resumeText?.trim();
  if (!trimmedText || trimmedText.length < 50) {
    return {
      success: false,
      error:
        "Resume text is too short to analyze. Please upload a complete resume.",
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: ATS_RESPONSE_SCHEMA,
      temperature: atsMode === "legacy" ? 0.1 : 0.15,
    },
  });

  const prompt = buildPrompt(trimmedText, jobDescription, atsMode);

  let rawResponseText: string;
  try {
    rawResponseText = await callGeminiWithRetry(model, prompt);
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
          "Our semantic evaluation servers are temporarily unavailable. Please try again in a moment.",
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

  if (!parsed.isResume) {
    return {
      success: false,
      error:
        "This document does not appear to be a resume. Please upload a CV or resume to receive an ATS score.",
    };
  }

  const safeResult: AtsAnalysisResult = {
    isResume: true,
    atsScore: Math.min(100, Math.max(0, Math.round(parsed.atsScore))),
    summary: parsed.summary,
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    actionableSteps: parsed.actionableSteps,
  };

  return { success: true, data: safeResult };
}