"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { redis, ratelimit } from "@/lib/redis";

import type { CombinedAnalyzeResumeResult } from "@/types/ats";
import { ATS_RESPONSE_SCHEMA, isValidCombinedResult } from "@/lib/ats/schema";
import type { CombinedAtsResponse } from "@/lib/ats/schema";
import { buildCombinedPrompt } from "@/lib/ats/prompts";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const CACHE_VERSION = "v2";
const CACHE_TTL_SECONDS = 86_400;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite";

const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
] as const;

const GEMINI_REQUEST_TIMEOUT_MS = 10_000;
const GROQ_REQUEST_TIMEOUT_MS = 12_000;
const GROQ_MAX_COMPLETION_TOKENS = 4096;

const GROQ_ENGINE_SCHEMA = {
  type: "object",
  properties: {
    atsScore: { type: "number" },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    actionableSteps: { type: "array", items: { type: "string" } },
  },
  required: [
    "atsScore",
    "summary",
    "strengths",
    "weaknesses",
    "actionableSteps",
  ],
  additionalProperties: false,
};

const GROQ_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    isResume: { type: "boolean" },
    legacy: GROQ_ENGINE_SCHEMA,
    modern: GROQ_ENGINE_SCHEMA,
  },
  required: ["isResume", "legacy", "modern"],
  additionalProperties: false,
};

const POLICY_REFUSAL_REASONS = new Set([
  "SAFETY",
  "RECITATION",
  "BLOCKLIST",
  "PROHIBITED_CONTENT",
  "SPII",
  "MALICIOUS",
  "ESCALATION",
]);

class PolicyRefusalError extends Error {
  constructor(message = "Content blocked by safety or policy filters") {
    super(message);
    this.name = "PolicyRefusalError";
  }
}

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
  const modelChainIdentity = `${GEMINI_MODEL}:${GROQ_MODELS.join("->")}`;
  const combined = `${modelChainIdentity}|||${normalizedResume}|||JD_DELIMITER|||${normalizedJd}`;
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

function parseAndValidate(raw: string): unknown {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(cleaned);
}

function requireValidResult(raw: string): CombinedAtsResponse {
  const parsed = parseAndValidate(raw);

  if (!isValidCombinedResult(parsed)) {
    throw new Error("INVALID_MODEL_RESPONSE");
  }

  return parsed;
}

async function callGeminiWithRetry(
  model: ReturnType<
    InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]
  >,
  prompt: string
): Promise<string> {
  const delays = [1000];
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;

      const promptBlockReason = response.promptFeedback?.blockReason;
      if (
        promptBlockReason &&
        (promptBlockReason as string) !== "BLOCKED_REASON_UNSPECIFIED"
      ) {
        throw new PolicyRefusalError();
      }

      const candidate = response.candidates?.[0];
      if (!candidate) {
        throw new Error("GEMINI_NO_CANDIDATES");
      }

      const finishReason = candidate.finishReason;
      const upperReason = finishReason ? String(finishReason).toUpperCase() : "";

      if (upperReason && POLICY_REFUSAL_REASONS.has(upperReason)) {
        throw new PolicyRefusalError();
      }

      if (upperReason === "MAX_TOKENS") {
        throw new Error("GEMINI_MAX_TOKENS_INCOMPLETE");
      }

      // Missing, empty, or non-STOP finish reason indicates incomplete generation
      if (upperReason !== "STOP") {
        throw new Error("GEMINI_INCOMPLETE_RESPONSE");
      }

      const text = response.text();
      if (!text || text.trim().length === 0) {
        throw new Error("Gemini returned empty response");
      }
      return text;
    } catch (err) {
      if (err instanceof PolicyRefusalError) {
        throw err;
      }

      lastError = err instanceof Error ? err : new Error(String(err));
      const message = lastError.message;
      const lowerMessage = message.toLowerCase();

      // Check message for explicit policy and safety refusal terms
      if (
        lowerMessage.includes("safety") ||
        lowerMessage.includes("recitation") ||
        lowerMessage.includes("blocklist") ||
        lowerMessage.includes("prohibited_content") ||
        lowerMessage.includes("spii") ||
        lowerMessage.includes("malicious") ||
        lowerMessage.includes("escalation") ||
        lowerMessage.includes("blocked due to") ||
        lowerMessage.includes("policy")
      ) {
        throw new PolicyRefusalError();
      }

      // Check SDK errorDetails if present
      const errObj = err as {
        status?: number;
        errorDetails?: unknown[];
      };

      if (Array.isArray(errObj.errorDetails)) {
        const detailsStr = JSON.stringify(errObj.errorDetails).toLowerCase();
        if (
          detailsStr.includes("safety") ||
          detailsStr.includes("recitation") ||
          detailsStr.includes("blocklist") ||
          detailsStr.includes("prohibited_content") ||
          detailsStr.includes("spii") ||
          detailsStr.includes("malicious") ||
          detailsStr.includes("escalation") ||
          detailsStr.includes("policy")
        ) {
          throw new PolicyRefusalError();
        }
      }

      // Classify retryable status using numeric HTTP status
      let numericStatus: number | undefined =
        typeof errObj.status === "number" ? errObj.status : undefined;

      if (numericStatus === undefined) {
        const statusMatch = message.match(/\[(\d{3})\s+[^\]]*\]/);
        if (statusMatch) {
          numericStatus = parseInt(statusMatch[1], 10);
        }
      }

      // 429 RESOURCE_EXHAUSTED must never be retried, even if '500' appears in message text
      if (numericStatus === 429 || message.includes("RESOURCE_EXHAUSTED")) {
        throw lastError;
      }

      // Other 4xx client errors are non-retryable
      if (numericStatus !== undefined && numericStatus >= 400 && numericStatus < 500) {
        throw lastError;
      }

      // Only 500, 502, 503, 504 or transient network overload are retryable
      const isRetryableServerStatus =
        numericStatus === 500 ||
        numericStatus === 502 ||
        numericStatus === 503 ||
        numericStatus === 504;

      const isRetryableNetworkError =
        numericStatus === undefined &&
        (lowerMessage.includes("overloaded") ||
          lowerMessage.includes("high demand") ||
          lowerMessage.includes("unavailable") ||
          lowerMessage.includes("econnreset"));

      const isRetryable = isRetryableServerStatus || isRetryableNetworkError;

      if (!isRetryable || attempt >= 1) {
        throw lastError;
      }

      await sleep(delays[attempt]);
    }
  }

  throw lastError;
}

async function callGemini(
  prompt: string,
  apiKey: string
): Promise<CombinedAtsResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel(
    {
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ATS_RESPONSE_SCHEMA,
      },
    },
    {
      timeout: GEMINI_REQUEST_TIMEOUT_MS,
    }
  );

  const rawText = await callGeminiWithRetry(model, prompt);
  return requireValidResult(rawText);
}

async function callGroqModel(
  model: string,
  prompt: string,
  apiKey: string
): Promise<CombinedAtsResponse> {
  const systemMessage =
    "You are an ATS scoring system. You must respond with ONLY a valid JSON object — no markdown fences, no explanation, no text before or after the JSON. Follow the scoring instructions exactly as provided.";

  let response: Response;
  try {
    response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(GROQ_REQUEST_TIMEOUT_MS),
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt },
          ],
          temperature: 0.6,
          max_completion_tokens: GROQ_MAX_COMPLETION_TOKENS,
          reasoning_effort: "low",
          include_reasoning: false,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "ats_analysis",
              strict: true,
              schema: GROQ_RESPONSE_SCHEMA,
            },
          },
        }),
      }
    );
  } catch (err) {
    throw new Error(
      `Groq request failed: ${err instanceof Error ? err.message : "network error"}`
    );
  }

  if (!response.ok) {
    let errorJson: { error?: { message?: string; type?: string; code?: string } } | null = null;
    try {
      const raw: unknown = await response.json();
      if (raw && typeof raw === "object") {
        errorJson = raw as {
          error?: { message?: string; type?: string; code?: string };
        };
      }
    } catch {
      // Body is not JSON
    }

    const errCode = errorJson?.error?.code ? String(errorJson.error.code).toLowerCase() : "";
    const errType = errorJson?.error?.type ? String(errorJson.error.type).toLowerCase() : "";
    const errMsg = errorJson?.error?.message ? String(errorJson.error.message).toLowerCase() : "";

    const isPolicyRefusal =
      errCode.includes("content_filter") ||
      errCode.includes("policy") ||
      errType.includes("content_filter") ||
      errType.includes("policy") ||
      errMsg.includes("content filter") ||
      errMsg.includes("safety") ||
      errMsg.includes("policy") ||
      errMsg.includes("prohibited") ||
      errMsg.includes("spii") ||
      errMsg.includes("escalation");

    if (isPolicyRefusal) {
      throw new PolicyRefusalError("Content blocked by Groq policy filters");
    }

    throw new Error(`Groq HTTP error ${response.status}`);
  }

  let data: {
    choices?: Array<{
      message?: { content?: string | null; refusal?: string | null };
      finish_reason?: string | null;
    }>;
  };

  try {
    data = (await response.json()) as typeof data;
  } catch {
    throw new Error("Groq returned invalid JSON envelope");
  }

  const choice = data?.choices?.[0];
  if (!choice) {
    throw new Error("Groq returned no choices");
  }

  const groqReason = choice.finish_reason ? String(choice.finish_reason).toUpperCase() : "";

  if (groqReason === "CONTENT_FILTER" || choice.message?.refusal) {
    throw new PolicyRefusalError();
  }

  if (groqReason === "LENGTH") {
    throw new Error("Groq response was truncated due to token limit");
  }

  if (groqReason !== "STOP") {
    throw new Error("Groq response incomplete");
  }

  const content = choice.message?.content?.trim();
  if (!content) {
    throw new Error("Groq returned empty response");
  }

  return requireValidResult(content);
}

async function callGroqWithFallback(
  prompt: string,
  apiKey: string
): Promise<CombinedAtsResponse> {
  let lastError: Error = new Error("All Groq models failed");

  for (const model of GROQ_MODELS) {
    try {
      return await callGroqModel(model, prompt, apiKey);
    } catch (err) {
      if (err instanceof PolicyRefusalError) {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError;
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
      error:
        "Resume text is too short to analyze. Please upload a complete resume.",
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

  const prompt = buildCombinedPrompt(trimmedText, jobDescription);
  let validResult: CombinedAtsResponse | null = null;

  // 1. Primary: Google Gemini
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      validResult = await callGemini(prompt, geminiApiKey);
    } catch (geminiErr) {
      if (geminiErr instanceof PolicyRefusalError) {
        return {
          success: false,
          error:
            "The resume content was flagged by safety filters. Please check the document.",
        };
      }
      validResult = null;
    }
  }

  // 2. Fallbacks: Groq (openai/gpt-oss-120b -> openai/gpt-oss-20b)
  if (!validResult) {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return {
        success: false,
        error:
          "Our analysis engines are temporarily unavailable. Please try again in a moment.",
      };
    }

    try {
      validResult = await callGroqWithFallback(prompt, groqApiKey);
    } catch (groqErr) {
      if (groqErr instanceof PolicyRefusalError) {
        return {
          success: false,
          error:
            "The resume content was flagged by safety filters. Please check the document.",
        };
      }
      return {
        success: false,
        error:
          "Our analysis engines are temporarily unavailable. Please try again in a moment.",
      };
    }
  }

  if (!validResult) {
    return {
      success: false,
      error:
        "Our analysis engines are temporarily unavailable. Please try again in a moment.",
    };
  }

  if (!validResult.isResume) {
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
      atsScore: Math.min(
        100,
        Math.max(0, Math.round(validResult.legacy.atsScore))
      ),
      summary: validResult.legacy.summary,
      strengths: validResult.legacy.strengths,
      weaknesses: validResult.legacy.weaknesses,
      actionableSteps: validResult.legacy.actionableSteps,
    },
    modern: {
      isResume: true,
      atsScore: Math.min(
        100,
        Math.max(0, Math.round(validResult.modern.atsScore))
      ),
      summary: validResult.modern.summary,
      strengths: validResult.modern.strengths,
      weaknesses: validResult.modern.weaknesses,
      actionableSteps: validResult.modern.actionableSteps,
    },
  };

  void setCachedResult(cacheKey, finalResult);

  return finalResult;
}
