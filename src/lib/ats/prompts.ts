import type { AtsMode } from "@/types/ats";

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

export function buildPrompt(
  resumeText: string,
  jobDescription: string | null,
  atsMode: AtsMode
): string {
  const config = ATS_MODE_CONFIGS[atsMode];

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