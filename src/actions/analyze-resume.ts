"use server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export interface AtsAnalysisResult {
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actionableSteps: string[];
}

export type AnalyzeResumeResult =
  | { success: true; data: AtsAnalysisResult }
  | { success: false; error: string };

export type AtsMode = "legacy" | "modern" | "general";

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
  required: [
    "atsScore",
    "summary",
    "strengths",
    "weaknesses",
    "actionableSteps",
  ],
};

// Each mode gets its own persona and scoring lens. The persona primes the
// model's "character" before it sees the resume, and the criteria section
// tells it exactly what to reward or punish.
const ATS_MODE_CONFIGS: Record<
  AtsMode,
  { persona: string; criteria: string; scoringGuide: string }
> = {
  legacy: {
    persona: `You are simulating a ruthless, legacy ATS engine (think Taleo or early Workday).
You operate purely as a keyword-counting and formatting-parsing algorithm.
You have zero ability to infer meaning, synonyms, or context.
If a required keyword from the job description is not present as a literal string match, it does not exist.`,

    criteria: `Scoring criteria — apply these rules mechanically:
- EXACT keyword match from the JD is mandatory. "Led" does not satisfy "Leadership". "React.js" does not satisfy "ReactJS".
- Heavily penalize any missing required skill, technology, or certification listed in the JD.
- Penalize non-standard section headers (e.g., "Where I've Worked" instead of "Experience").
- Penalize tables, columns, graphics, or any layout that a basic text parser would mangle.
- Penalize missing contact fields (phone, email, LinkedIn).
- Do NOT give credit for demonstrated competency that lacks the literal keyword.
- Do NOT reward soft skills unless they appear verbatim in the JD.`,

    scoringGuide: `Scoring guide (apply harshly):
90-100: Near-perfect keyword mirror of the JD, clean single-column format, all required terms present
70-89: Most required keywords present, minor formatting issues or 1-2 missing terms
50-69: Several required keywords missing, or structural issues that would cause parsing failures
30-49: Significant keyword gaps or format problems that would cause auto-rejection
0-29: Resume would be rejected before a human ever sees it`,
  },

  modern: {
    persona: `You are simulating a modern, AI-powered semantic recruiting platform (think Greenhouse or Eightfold.ai).
You understand conceptual meaning, skill adjacency, and career trajectory.
You evaluate the depth of a candidate's qualifications, not just surface-level keyword presence.
You reward demonstrated impact with metrics and penalize vague claims.`,

    criteria: `Scoring criteria — evaluate holistically:
- Prioritize quantified impact statements (e.g., "reduced latency by 40%") over keyword density.
- Award credit for semantically equivalent skills (e.g., "Kubernetes" satisfies "container orchestration").
- Evaluate career progression and scope of responsibility over time.
- Penalize heavily for claims without evidence (e.g., "strong communicator" with no proof).
- Reward clear alignment between past work and the role's core problems.
- Minor formatting issues are irrelevant if the content is strong.
- Treat missing exact keywords as a minor issue if the underlying competency is clearly demonstrated.`,

    scoringGuide: `Scoring guide (evaluate with nuance):
85-100: Demonstrated impact, clear skill alignment, strong trajectory, metrics throughout
65-84: Solid experience and alignment, but thin on quantified achievements or a few conceptual gaps
45-64: Relevant background but heavy on responsibilities, light on outcomes — hard to assess actual impact
25-44: Weak alignment to role requirements or resume reads as a job description, not an achievement record
0-24: Fundamental mismatch or resume is too vague to evaluate meaningfully`,
  },

  general: {
    persona: `You are a senior technical recruiter and ATS specialist evaluating a resume against
general industry best practices for software engineering roles.
No specific job description has been provided, so assess the resume on its own merits.`,

    criteria: `Scoring criteria — evaluate against universal best practices:
- Reward quantified impact statements and strong action verbs (built, shipped, reduced, led).
- Penalize vague language, passive voice, and responsibility-only bullet points.
- Check for appropriate keyword density for the candidate's apparent target role.
- Evaluate ATS parseability: clean format, standard section headers, no tables or graphics.
- Assess skill relevance and recency — older technologies should not dominate.
- Check that each role tells a story of growth, not just a list of tasks.`,

    scoringGuide: `Scoring guide:
80-100: Excellent — quantified achievements, clean format, strong keyword density, clear trajectory
60-79: Good — solid experience but gaps in impact statements or keyword optimization
40-59: Fair — relevant experience but significant ATS or content issues holding it back
0-39: Poor — vague content, weak structure, or major formatting problems`,
  },
};

function buildPrompt(
  resumeText: string,
  jobDescription: string | null,
  atsMode: AtsMode
): string {
  const config = ATS_MODE_CONFIGS[atsMode];

  // The JD section is only injected for modes where it's meaningful.
  // A "general" analysis with no JD skips this block entirely.
  const jdSection =
    jobDescription && atsMode !== "general"
      ? `--- Target Job Description ---
${jobDescription}

`
      : "";

  return `${config.persona}

${jdSection}--- Resume ---
${resumeText}

--- Your Instructions ---
${config.criteria}

${config.scoringGuide}

Respond ONLY with a valid JSON object. No markdown fences, no preamble, no explanation.

{
  "atsScore": <integer 0-100>,
  "summary": "<2-3 sentence professional summary of the candidate and their fit>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "actionableSteps": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"]
}`;
}

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
      error:
        "Resume text is too short to analyze. Please upload a complete resume.",
    };
  }

  // Warn callers at runtime if they pass a JD with "general" mode — it'll be
  // silently ignored by buildPrompt and that can cause confusing results.
  if (atsMode === "general" && jobDescription) {
    console.warn(
      '[analyzeResumeAction] atsMode is "general" but a jobDescription was provided. The JD will be ignored.'
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: ATS_RESPONSE_SCHEMA,
      // Slightly higher temp for modern/general so the semantic analysis feels
      // less mechanical. Legacy stays cold and algorithmic.
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
      error: "Gemini returned an unexpected response format. Please try again.",
    };
  }

  if (!isValidAtsResult(parsed)) {
    return {
      success: false,
      error: "Gemini response was missing required fields. Please try again.",
    };
  }

  const safeResult: AtsAnalysisResult = {
    ...parsed,
    atsScore: Math.min(100, Math.max(0, Math.round(parsed.atsScore))),
  };

  return { success: true, data: safeResult };
}