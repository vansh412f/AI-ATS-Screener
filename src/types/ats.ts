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

export type ScanRecord = {
  id: string;
  jobTitle: string;
  legacyScore: number;
  modernScore: number;
  createdAt: Date;
};

export type DashboardStats = {
  totalScans: number;
  totalUsers: number;
};