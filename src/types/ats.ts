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