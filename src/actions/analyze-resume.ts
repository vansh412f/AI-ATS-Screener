"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { redis, ratelimit } from "@/lib/redis";

import type { CombinedAnalyzeResumeResult } from "@/types/ats";
import { ATS_RESPONSE_SCHEMA, isValidCombinedResult } from "@/lib/ats/schema";
import { buildCombinedPrompt } from "@/lib/ats/prompts";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const CACHE_VERSION = "v1";
const CACHE_TTL_SECONDS = 86_400;

function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .toLowerCase();
}

function generateCacheKey(
  resumeText: string,
  jobDescription: string | null
): string {
  const normalizedResume = normalizeText(resumeText);
  const normalizedJd = jobDescription
    ? normalizeText(jobDescription)
    : "__NO_JD__";
  const combined = `${normalizedResume}|||JD_DELIMITER|||${normalizedJd}`;
  const hash = createHash("sha256").update(combined, "utf8").digest("hex");
  return `ats_cache:${CACHE_VERSION}:${hash}`;
}

async function getCachedResult(
  cacheKey: string
): Promise<CombinedAnalyzeResumeResult | null> {
  try {
    const cached = await redis.get<string>(cacheKey);
    if (!cached) return null;
    const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
    if (parsed && parsed.success === true) {
      return parsed as CombinedAnalyzeResumeResult;
    }
    return null;
  } catch {
    return null;
  }
}

async function setCachedResult(
  cacheKey: string,
  result: CombinedAnalyzeResumeResult
): Promise<void> {
  try {
    await redis.set(cacheKey, JSON.stringify(result), {
      ex: CACHE_TTL_SECONDS,
    });
  } catch {
    console.error("[cache] Failed to write result to Redis — non-blocking.");
  }
}

async function checkRateLimit(userId: string): Promise<{
  allowed: boolean;
  source: "redis" | "postgres" | "failopen";
}> {
  try {
    const result = await ratelimit.limit(userId);
    return { allowed: result.success, source: "redis" };
  } catch {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const count = await prisma.resumeScan.count({
        where: {
          clerkUserId: userId,
          createdAt: { gte: twentyFourHoursAgo },
        },
      });
      return { allowed: count < 10, source: "postgres" };
    } catch {
      console.error("[rateLimit] Both Redis and Postgres failed — failing open.");
      return { allowed: true, source: "failopen" };
    }
  }
}

async function callGeminiWithRetry(
  model: ReturnType<
    InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]
  >,
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
        message.includes("SAFETY")
      ) {
        throw lastError;
      }

      if (
        message.includes("RESOURCE_EXHAUSTED") ||
        message.includes("429")
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

      if (!isRetryable) throw lastError;
      if (attempt < 2) await sleep(delays[attempt]);
    }
  }

  throw lastError;
}

async function callGroq(
  model: string,
  prompt: string,
  apiKey: string
): Promise<string> {
  const systemMessage = `You are an ATS scoring system. You must respond with ONLY a valid JSON object — no markdown fences, no explanation, no text before or after the JSON. Follow the scoring instructions exactly as provided.`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("Groq returned empty response");

  return content;
}

async function callGroqWithFallback(
  prompt: string,
  apiKey: string
): Promise<string> {
  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  let lastError: Error = new Error("All Groq models failed");

  for (const model of models) {
    try {
      return await callGroq(model, prompt, apiKey);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const message = lastError.message;
      if (message.includes("401") || message.includes("invalid_api_key")) {
        throw lastError;
      }
    }
  }

  throw lastError;
}

function parseAndValidate(raw: string): unknown {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function analyzeResumeAction(
  resumeText: string,
  jobDescription: string | null
): Promise<CombinedAnalyzeResumeResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to analyze a resume.",
    };
  }

  const trimmedText = resumeText?.trim();
  if (!trimmedText || trimmedText.length < 50) {
    return {
      success: false,
      error: "Resume text is too short to analyze. Please upload a complete resume.",
    };
  }

  const cacheKey = generateCacheKey(trimmedText, jobDescription);
  const cachedResult = await getCachedResult(cacheKey);
  if (cachedResult) return cachedResult;

  const { allowed } = await checkRateLimit(userId);
  if (!allowed) {
    return {
      success: false,
      error:
        "You have reached your daily limit of 10 resume scans. Please try again tomorrow.",
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "GEMINI_API_KEY is not configured. Add it to your .env.local file.",
    };
  }

  const prompt = buildCombinedPrompt(trimmedText, jobDescription);
  let rawResponseText: string | null = null;
  let usedFallback = false;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ATS_RESPONSE_SCHEMA,
        temperature: 0.1,
      },
    });
    rawResponseText = await callGeminiWithRetry(model, prompt);
  } catch (geminiErr) {
    const geminiMessage =
      geminiErr instanceof Error ? geminiErr.message : String(geminiErr);

    if (
      geminiMessage.includes("API_KEY_INVALID") ||
      geminiMessage.includes("403")
    ) {
      return {
        success: false,
        error: "Invalid API key configuration. Please contact support.",
      };
    }

    if (geminiMessage.includes("SAFETY")) {
      return {
        success: false,
        error:
          "The resume content was flagged by safety filters. Please check the document.",
      };
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return {
        success: false,
        error:
          "Our analysis engine is temporarily unavailable. Please try again in a moment.",
      };
    }

    try {
      rawResponseText = await callGroqWithFallback(prompt, groqApiKey);
      usedFallback = true;
    } catch {
      return {
        success: false,
        error:
          "Our analysis engines are temporarily unavailable. Please try again in a moment.",
      };
    }
  }

  if (!rawResponseText) {
    return {
      success: false,
      error: "No response received from analysis engine. Please try again.",
    };
  }

  let parsed: unknown;
  try {
    parsed = parseAndValidate(rawResponseText);
  } catch {
    if (usedFallback) {
      return {
        success: false,
        error:
          "Our backup analysis engine returned an unexpected format. Please try again.",
      };
    }
    return {
      success: false,
      error: "The analysis returned an unexpected format. Please try again.",
    };
  }

  if (!isValidCombinedResult(parsed)) {
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

  const finalResult: CombinedAnalyzeResumeResult = {
    success: true,
    legacy: {
      isResume: true,
      atsScore: Math.min(100, Math.max(0, Math.round(parsed.legacy.atsScore))),
      summary: parsed.legacy.summary,
      strengths: parsed.legacy.strengths,
      weaknesses: parsed.legacy.weaknesses,
      actionableSteps: parsed.legacy.actionableSteps,
    },
    modern: {
      isResume: true,
      atsScore: Math.min(100, Math.max(0, Math.round(parsed.modern.atsScore))),
      summary: parsed.modern.summary,
      strengths: parsed.modern.strengths,
      weaknesses: parsed.modern.weaknesses,
      actionableSteps: parsed.modern.actionableSteps,
    },
  };

  void setCachedResult(cacheKey, finalResult);

  return finalResult;
}