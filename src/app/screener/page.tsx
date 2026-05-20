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
} from "lucide-react";
import { parsePdf, ParsePdfResult } from "@/actions/parse-pdf";
import {
  analyzeResumeAction,
  AtsAnalysisResult,
  AtsMode,
} from "@/actions/analyze-resume";
import {
  ScreenerDropzone,
  UploadedFile,
} from "@/app/screener/ScreenerDropzone";
import { ResultDashboard } from "@/app/screener/ResultDashboard";
import { cn } from "@/lib/utils";

type LoadingPhase = "idle" | "parsing" | "analyzing";

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
        <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
      )}
      <span
        className={cn(
          "text-xs",
          status === "done"
            ? "text-emerald-400"
            : status === "active"
            ? "text-zinc-200"
            : "text-zinc-600"
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
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 animate-in fade-in duration-300">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-300 mb-1">
            Analysis Failed
          </p>
          <p className="text-xs text-red-400/80 leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Try again
      </button>
    </div>
  );
}

export default function ScreenerPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  // When no JD is present the action falls back to "general" automatically,
  // but we default the selector to "legacy" so there's a sensible pre-selection
  // the moment a user starts typing a JD.
  const [atsMode, setAtsMode] = useState<AtsMode>("legacy");
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("idle");
  const [dropError, setDropError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<AtsAnalysisResult | null>(null);
  const [usedAtsMode, setUsedAtsMode] = useState<AtsMode>("general");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading = loadingPhase !== "idle";
  const canSubmit = Boolean(uploadedFile) && !isLoading;

  const handleDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setDropError(null);
      setAnalysisResult(null);
      setErrorMessage(null);

      if (rejectedFiles.length > 0) {
        const reason = rejectedFiles[0].errors[0];
        if (reason.code === "file-too-large") {
          setDropError("File exceeds 5 MB limit. Please use a smaller PDF.");
        } else if (reason.code === "file-invalid-type") {
          setDropError("Only PDF files are accepted.");
        } else {
          setDropError(reason.message);
        }
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
    setAnalysisResult(null);
    setErrorMessage(null);
    setDropError(null);
  }, []);

  const handleReset = useCallback(() => {
    setAnalysisResult(null);
    setErrorMessage(null);
    setUploadedFile(null);
    setDropError(null);
    // setJobDescription("");
    // setAtsMode("legacy");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!uploadedFile || isLoading) return;

    setAnalysisResult(null);
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

    // Resolve the effective mode: if no JD was provided the backend defaults
    // to "general" — we mirror that here so the result badge is accurate.
    const effectiveMode: AtsMode = trimmedJd ? atsMode : "general";

    let aiResult: Awaited<ReturnType<typeof analyzeResumeAction>>;
    try {
      aiResult = await analyzeResumeAction(
        parseResult.text,
        parseResult.jobDescription ?? null,
        effectiveMode
      );
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

    if (!aiResult.success) {
      setErrorMessage(aiResult.error);
      return;
    }

    // Snapshot which mode produced this result so ResultDashboard
    // stays consistent even if the user changes the selector afterward.
    setUsedAtsMode(effectiveMode);
    setAnalysisResult(aiResult.data);
  }, [uploadedFile, jobDescription, atsMode, isLoading]);

  const showEmptyState = !isLoading && !analysisResult && !errorMessage;
  const showResult = !isLoading && Boolean(analysisResult);
  const showError = !isLoading && Boolean(errorMessage);

  const loadingLabel =
    loadingPhase === "parsing"
      ? "Parsing Document…"
      : "Analyzing Resume…";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Page header */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Resume Screener
              </h1>
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                Upload your resume and optionally a job description. We will
                score your ATS compatibility and surface actionable improvements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* Left column — inputs */}
          <div className="flex flex-col gap-7">
            <ScreenerDropzone
              uploadedFile={uploadedFile}
              jobDescription={jobDescription}
              atsMode={atsMode}
              dropError={dropError}
              isLoading={isLoading}
              onDrop={handleDrop}
              onRemoveFile={handleRemoveFile}
              onJobDescriptionChange={setJobDescription}
              onAtsModeChange={setAtsMode}
            />

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "w-full h-12 font-semibold text-sm rounded-xl transition-all duration-200",
                canSubmit
                  ? "bg-white text-black hover:bg-zinc-200 active:scale-[0.99]"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {loadingLabel}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Analyze Resume
                </span>
              )}
            </Button>

            {isLoading && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="flex flex-col gap-2">
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
                    label="AI analysis"
                    status={
                      loadingPhase === "analyzing" ? "active" : "pending"
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right column — results */}
          <div>
            {showEmptyState && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    ATS Report
                  </span>
                </div>
                <div className="flex flex-col items-center gap-4 text-center px-8 py-16">
                  <div className="w-14 h-14 rounded-xl bg-zinc-800/60 border border-zinc-700 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">
                      Your AI-powered ATS report will appear here
                    </p>
                    <p className="text-xs text-zinc-700 mt-1.5">
                      Upload a resume and click Analyze Resume to begin
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 mt-2 text-left w-full max-w-xs">
                    {[
                      "ATS compatibility score",
                      "Strengths & weaknesses",
                      "Prioritized action plan",
                    ].map((feat) => (
                      <div
                        key={feat}
                        className="flex items-center gap-2 text-xs text-zinc-600"
                      >
                        <ChevronRight className="w-3 h-3 shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    ATS Report
                  </span>
                </div>
                <div className="flex flex-col items-center gap-5 px-8 py-16">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
                    <Sparkles className="w-6 h-6 text-zinc-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-zinc-300 font-medium">
                      {loadingPhase === "parsing"
                        ? "Reading your resume…"
                        : "Analyzing…"}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {loadingPhase === "parsing"
                        ? "Extracting text in memory"
                        : "Generating structured insights"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showResult && analysisResult && (
              <ResultDashboard
                data={analysisResult}
                atsMode={usedAtsMode}
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