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
import { analyzeResumeAction } from "@/actions/analyze-resume";
import { logScanAction } from "@/actions/log-scan";
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


function ErrorPanel({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6 animate-in fade-in duration-300">
      <div className="flex items-start gap-3 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
          <AlertCircle className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-300 mb-1.5">
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
  const steps: {
    label: string;
    sub: string;
    status: "pending" | "active" | "done";
  }[] = [
    {
      label: "Extracting PDF text",
      sub: "Parsing document structure in memory",
      status:
        phase === "parsing"
          ? "active"
          : phase === "analyzing"
          ? "done"
          : "pending",
    },
    {
      label: "Legacy ATS scoring",
      sub: "Strict keyword & formatting analysis",
      status: phase === "analyzing" ? "active" : "pending",
    },
    {
      label: "Modern AI ATS scoring",
      sub: "Semantic alignment & impact evaluation",
      status: phase === "analyzing" ? "active" : "pending",
    },
  ];

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950/50 overflow-hidden animate-in fade-in duration-300">
      <div className="px-5 py-4 border-b border-zinc-900">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          ATS Report
        </span>
      </div>

      <div className="flex flex-col items-center gap-8 px-8 py-14">
        {/* Spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-zinc-800" />
          <div className="absolute inset-0 rounded-full border border-t-zinc-400 animate-spin" />
          <Sparkles className="w-5 h-5 text-zinc-600" />
        </div>

        {/* Status copy */}
        <div className="text-center">
          <p className="text-sm text-zinc-300 font-medium">
            {phase === "parsing"
              ? "Reading your resume…"
              : "Running dual ATS analysis…"}
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            {phase === "parsing"
              ? "Extracting text in memory"
              : "Scoring against both engines simultaneously"}
          </p>
        </div>

        {/* Pipeline steps — moved here from the left column */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          {steps.map((step) => (
            <div
              key={step.label}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3.5 transition-colors duration-300",
                step.status === "active"
                  ? "border-zinc-700 bg-zinc-900/60"
                  : step.status === "done"
                  ? "border-zinc-800/60 bg-zinc-900/30"
                  : "border-zinc-900 bg-transparent"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {step.status === "done" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : step.status === "active" ? (
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-zinc-800" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    "text-xs font-medium",
                    step.status === "done"
                      ? "text-emerald-400"
                      : step.status === "active"
                      ? "text-zinc-200"
                      : "text-zinc-700"
                  )}
                >
                  {step.label}
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-relaxed",
                    step.status === "active"
                      ? "text-zinc-500"
                      : "text-zinc-700"
                  )}
                >
                  {step.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


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
        err instanceof Error
          ? err.message
          : "A network error occurred during PDF parsing."
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
    // Pass null when no JD — the backend handles both modes gracefully with
    // null, falling back to general best-practices scoring internally.
    const jdText = parseResult.jobDescription ?? null;

    // Always fire both engines in parallel regardless of JD presence.
    let legacyResult: Awaited<ReturnType<typeof analyzeResumeAction>>;
    let modernResult: Awaited<ReturnType<typeof analyzeResumeAction>>;

    try {
      [legacyResult, modernResult] = await Promise.all([
        analyzeResumeAction(resumeText, jdText, "legacy"),
        analyzeResumeAction(resumeText, jdText, "modern"),
      ]);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "A network error occurred during analysis."
      );
      setLoadingPhase("idle");
      return;
    }

    setLoadingPhase("idle");

    // Surface whichever call failed — prefer legacy error arbitrarily if both fail.
    if (!legacyResult.success) {
      setErrorMessage(legacyResult.error);
      return;
    }
    if (!modernResult.success) {
      setErrorMessage(modernResult.error);
      return;
    }

        // Log once with both real scores now that Promise.all has settled
    logScanAction({
      jobTitle: trimmedJd,
      legacyScore: legacyResult.data.atsScore,
      modernScore: modernResult.data.atsScore,
    }).catch(() => {
      console.error("[handleSubmit] Failed to log scan — non-blocking.");
    });

    setDashboardResults({
      legacy: legacyResult.data,
      modern: modernResult.data,
    });
  }, [uploadedFile, jobDescription, isLoading]);

  const showEmptyState = !isLoading && !dashboardResults && !errorMessage;
  const showResult = !isLoading && Boolean(dashboardResults);
  const showError = !isLoading && Boolean(errorMessage);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* ── Hero heading ── */}
        <div className="flex flex-col items-center text-center gap-3 mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              AI-Powered ATS Simulator
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Resume Screener
          </h1>

          <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
            Upload your resume to receive a simultaneous score from both a{" "}
            <span className="text-orange-400/80 font-medium">
              legacy keyword-based ATS
            </span>{" "}
            and a{" "}
            <span className="text-indigo-400/80 font-medium">
              modern AI semantic engine
            </span>
            .
          </p>

          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
              <ScanSearch className="w-3 h-3 text-orange-500/50" />
              Taleo · Workday · SuccessFactors
            </div>
            <span className="text-zinc-800">·</span>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
              <BrainCircuit className="w-3 h-3 text-indigo-500/50" />
              Greenhouse · Lever · Eightfold
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start">

          {/* Left column — sticky input panel */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-8">
            <ScreenerDropzone
              uploadedFile={uploadedFile}
              jobDescription={jobDescription}
              dropError={dropError}
              isLoading={isLoading}
              onDrop={handleDrop}
              onRemoveFile={handleRemoveFile}
              onJobDescriptionChange={setJobDescription}
            />

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
                  Run Dual ATS Analysis
                </span>
              )}
            </Button>
          </div>

          {/* Right column — results / loading / empty */}
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