"use client";

import React, { useState, useCallback } from "react";
import { FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  ScanSearch,
  BrainCircuit,
} from "lucide-react";
import { parsePdf, ParsePdfResult } from "@/actions/parse-pdf";
import {
  analyzeResumeAction,
  AtsAnalysisResult,
} from "@/actions/analyze-resume";
import {
  ScreenerDropzone,
  UploadedFile,
} from "@/app/screener/ScreenerDropzone";
import {
  ResultDashboard,
  DashboardResults,
} from "@/app/screener/ResultDashboard";
import { cn } from "@/lib/utils";

type LoadingPhase = "idle" | "parsing" | "analyzing";

// ─── Small local components ───────────────────────────────────────────────────

function PipelineStep({
  label,
  status,
}: {
  label: string;
  status: "pending" | "active" | "done";
}) {
  return (
    <div className="flex items-center gap-2.5">
      {status === "done" ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      ) : status === "active" ? (
        <Loader2 className="w-3.5 h-3.5 text-white animate-spin shrink-0" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border border-zinc-800 shrink-0" />
      )}
      <span
        className={cn(
          "text-xs",
          status === "done"
            ? "text-emerald-400"
            : status === "active"
            ? "text-zinc-300"
            : "text-zinc-700"
        )}
      >
        {label}
      </span>
    </div>
  );
}

function ErrorPanel({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-5 animate-in fade-in duration-300">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-300 mb-1">
            Analysis Failed
          </p>
          <p className="text-xs text-red-400/70 leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-900">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          ATS Report
        </span>
      </div>
      <div className="flex flex-col items-center gap-5 text-center px-8 py-14">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-zinc-700" />
        </div>
        <div>
          <p className="text-sm text-zinc-500 font-medium">
            Your ATS comparison report will appear here
          </p>
          <p className="text-xs text-zinc-700 mt-1.5">
            Upload a resume and click Analyze to begin
          </p>
        </div>

        {/* Feature preview */}
        <div className="grid grid-cols-2 gap-3 mt-1 w-full max-w-sm">
          <div className="flex flex-col gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-3 text-left">
            <ScanSearch className="w-4 h-4 text-orange-500/60" />
            <p className="text-[11px] font-semibold text-zinc-500">
              Legacy ATS
            </p>
            <p className="text-[10px] text-zinc-700 leading-relaxed">
              Taleo · Workday · SuccessFactors
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-3 text-left">
            <BrainCircuit className="w-4 h-4 text-indigo-500/60" />
            <p className="text-[11px] font-semibold text-zinc-500">
              Modern AI ATS
            </p>
            <p className="text-[10px] text-zinc-700 leading-relaxed">
              Greenhouse · Lever · Eightfold
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 w-full max-w-xs">
          {[
            "Side-by-side ATS score comparison",
            "Keyword gap analysis per engine",
            "Prioritized action plan",
          ].map((feat) => (
            <div
              key={feat}
              className="flex items-center gap-2 text-xs text-zinc-700"
            >
              <ChevronRight className="w-3 h-3 shrink-0" />
              {feat}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingState({ phase }: { phase: LoadingPhase }) {
  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-900">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          ATS Report
        </span>
      </div>
      <div className="flex flex-col items-center gap-6 px-8 py-14">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-zinc-800" />
          <div className="absolute inset-0 rounded-full border border-t-zinc-400 animate-spin" />
          <Sparkles className="w-5 h-5 text-zinc-600" />
        </div>
        <div className="text-center">
          <p className="text-sm text-zinc-300 font-medium">
            {phase === "parsing" ? "Reading your resume…" : "Running dual ATS analysis…"}
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            {phase === "parsing"
              ? "Extracting text in memory"
              : "Scoring against legacy & modern engines simultaneously"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page orchestrator ────────────────────────────────────────────────────────

export default function ScreenerPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("idle");
  const [dropError, setDropError] = useState<string | null>(null);
  const [dashboardResults, setDashboardResults] =
    useState<DashboardResults | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading = loadingPhase !== "idle";
  const canSubmit = Boolean(uploadedFile) && !isLoading;

  const handleDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setDropError(null);
      setDashboardResults(null);
      setErrorMessage(null);

      if (rejectedFiles.length > 0) {
        const reason = rejectedFiles[0].errors[0];
        const msg =
          reason.code === "file-too-large"
            ? "File exceeds 5 MB limit. Please use a smaller PDF."
            : reason.code === "file-invalid-type"
            ? "Only PDF files are accepted."
            : reason.message;
        setDropError(msg);
        return;
      }

      if (acceptedFiles.length > 0) {
        setUploadedFile({ file: acceptedFiles[0] });
      }
    },
    []
  );

  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setDashboardResults(null);
    setErrorMessage(null);
    setDropError(null);
  }, []);

  const handleReset = useCallback(() => {
    setDashboardResults(null);
    setErrorMessage(null);
    setUploadedFile(null);
    setDropError(null);
    setJobDescription("");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!uploadedFile || isLoading) return;

    setDashboardResults(null);
    setErrorMessage(null);
    setLoadingPhase("parsing");

    const formData = new FormData();
    formData.append("resume", uploadedFile.file);

    const trimmedJd = jobDescription.trim();
    if (trimmedJd) {
      formData.append("jobDescription", trimmedJd);
    }

    let parseResult: ParsePdfResult;
    try {
      parseResult = await parsePdf(formData);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "A network error occurred during PDF parsing."
      );
      setLoadingPhase("idle");
      return;
    }

    if (!parseResult.success) {
      setErrorMessage(parseResult.error);
      setLoadingPhase("idle");
      return;
    }

    setLoadingPhase("analyzing");

    const resumeText = parseResult.text;
    const jdText = parseResult.jobDescription ?? null;

    if (!trimmedJd) {
      // No JD provided — a dual comparison makes no sense without a target role.
      // Fall back to a single general analysis.
      let result: Awaited<ReturnType<typeof analyzeResumeAction>>;
      try {
        result = await analyzeResumeAction(resumeText, null, "general");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "A network error occurred during analysis."
        );
        setLoadingPhase("idle");
        return;
      }

      setLoadingPhase("idle");

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setDashboardResults({ mode: "general", general: result.data });
      return;
    }

    // JD is present — fire both engines in parallel.
    let legacyResult: Awaited<ReturnType<typeof analyzeResumeAction>>;
    let modernResult: Awaited<ReturnType<typeof analyzeResumeAction>>;

    try {
      [legacyResult, modernResult] = await Promise.all([
        analyzeResumeAction(resumeText, jdText, "legacy"),
        analyzeResumeAction(resumeText, jdText, "modern"),
      ]);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "A network error occurred during analysis."
      );
      setLoadingPhase("idle");
      return;
    }

    setLoadingPhase("idle");

    // Surface whichever call failed, preferring legacy arbitrarily.
    if (!legacyResult.success) {
      setErrorMessage(legacyResult.error);
      return;
    }
    if (!modernResult.success) {
      setErrorMessage(modernResult.error);
      return;
    }

    setDashboardResults({
      mode: "comparison",
      legacy: legacyResult.data,
      modern: modernResult.data,
    });
  }, [uploadedFile, jobDescription, isLoading]);

  const showEmptyState = !isLoading && !dashboardResults && !errorMessage;
  const showResult = !isLoading && Boolean(dashboardResults);
  const showError = !isLoading && Boolean(errorMessage);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Page header */}
      <div className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shrink-0">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                Resume Screener
              </h1>
              <p className="text-[11px] text-zinc-600 leading-tight">
                Dual ATS engine comparison — Legacy & Modern AI systems
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start">

          {/* ── Left: Inputs ── */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <ScreenerDropzone
              uploadedFile={uploadedFile}
              jobDescription={jobDescription}
              dropError={dropError}
              isLoading={isLoading}
              onDrop={handleDrop}
              onRemoveFile={handleRemoveFile}
              onJobDescriptionChange={setJobDescription}
            />

            {/* Analyze button */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "w-full h-12 font-semibold text-sm rounded-xl transition-all duration-200",
                canSubmit
                  ? "bg-white text-black hover:bg-zinc-100 active:scale-[0.99] shadow-lg shadow-white/5"
                  : "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {loadingPhase === "parsing"
                    ? "Parsing Document…"
                    : "Analyzing…"}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {jobDescription.trim()
                    ? "Run Dual ATS Analysis"
                    : "Analyze Resume"}
                </span>
              )}
            </Button>

            {/* Pipeline status */}
            {isLoading && (
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-4">
                <div className="flex flex-col gap-2.5">
                  <PipelineStep
                    label="Extracting PDF text"
                    status={
                      loadingPhase === "parsing"
                        ? "active"
                        : loadingPhase === "analyzing"
                        ? "done"
                        : "pending"
                    }
                  />
                  <PipelineStep
                    label="Legacy ATS scoring"
                    status={loadingPhase === "analyzing" ? "active" : "pending"}
                  />
                  <PipelineStep
                    label="Modern AI ATS scoring"
                    status={loadingPhase === "analyzing" ? "active" : "pending"}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Results ── */}
          <div>
            {showEmptyState && <EmptyState />}
            {isLoading && <LoadingState phase={loadingPhase} />}
            {showResult && dashboardResults && (
              <ResultDashboard
                results={dashboardResults}
                onReset={handleReset}
              />
            )}
            {showError && errorMessage && (
              <ErrorPanel message={errorMessage} onReset={handleReset} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}