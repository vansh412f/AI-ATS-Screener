"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Zap,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { parsePdf, ParsePdfResult } from "@/actions/parse-pdf";
import {
  analyzeResumeAction,
  AtsAnalysisResult,
} from "@/actions/analyze-resume";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedFile {
  file: File;
}

type LoadingPhase = "idle" | "parsing" | "analyzing";

// ─── Score Utilities ──────────────────────────────────────────────────────────

function getScoreColor(score: number): {
  stroke: string;
  text: string;
  bg: string;
  label: string;
} {
  if (score >= 80)
    return {
      stroke: "#22c55e",
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      label: "Excellent",
    };
  if (score >= 60)
    return {
      stroke: "#eab308",
      text: "text-yellow-400",
      bg: "bg-yellow-500/10",
      label: "Good",
    };
  return {
    stroke: "#ef4444",
    text: "text-red-400",
    bg: "bg-red-500/10",
    label: "Needs Work",
  };
}

// ─── Score Ring Component ─────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const { stroke, text, label } = getScoreColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            strokeWidth="10"
            stroke="#27272a"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            strokeWidth="10"
            stroke={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)",
              filter: `drop-shadow(0 0 8px ${stroke}80)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold tabular-nums", text)}>
            {score}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
            / 100
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className={cn("text-sm font-semibold", text)}>{label}</span>
        <span className="text-xs text-zinc-600">ATS Score</span>
      </div>
    </div>
  );
}

// ─── Section List Component ───────────────────────────────────────────────────

function InsightList({
  items,
  variant,
}: {
  items: string[];
  variant: "strength" | "weakness" | "action";
}) {
  const config = {
    strength: {
      icon: TrendingUp,
      iconClass: "text-emerald-400",
      dotClass: "bg-emerald-500",
      borderClass: "border-emerald-500/20",
      bgClass: "bg-emerald-500/5",
    },
    weakness: {
      icon: TrendingDown,
      iconClass: "text-red-400",
      dotClass: "bg-red-500",
      borderClass: "border-red-500/20",
      bgClass: "bg-red-500/5",
    },
    action: {
      icon: Zap,
      iconClass: "text-yellow-400",
      dotClass: "bg-yellow-400",
      borderClass: "border-yellow-500/20",
      bgClass: "bg-yellow-500/5",
    },
  }[variant];

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li
          key={i}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-3.5 transition-colors",
            config.borderClass,
            config.bgClass
          )}
        >
          {variant === "action" ? (
            <span
              className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5",
                "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
              )}
            >
              {i + 1}
            </span>
          ) : (
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0 mt-2",
                config.dotClass
              )}
            />
          )}
          <span className="text-sm text-zinc-300 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Result Dashboard ─────────────────────────────────────────────────────────

function ResultDashboard({
  data,
  onReset,
}: {
  data: AtsAnalysisResult;
  onReset: () => void;
}) {
  const { bg } = getScoreColor(data.atsScore);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header row: score + summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing score={data.atsScore} />
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  AI Analysis
                </span>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {data.summary}
            </p>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[11px] font-medium",
                bg,
                data.atsScore >= 80
                  ? "text-emerald-400"
                  : data.atsScore >= 60
                  ? "text-yellow-400"
                  : "text-red-400"
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              {data.atsScore >= 80
                ? "Strong candidate profile"
                : data.atsScore >= 60
                ? "Competitive with improvements"
                : "Significant improvements needed"}
            </div>
          </div>
        </div>
      </div>

      {/* Accordion sections */}
      <Accordion
        type="multiple"
        defaultValue={["strengths", "weaknesses", "actions"]}
        className="flex flex-col gap-3"
      >
        <AccordionItem
          value="strengths"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden px-0"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-zinc-800/30 transition-colors [&>svg]:text-zinc-500">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-200">
                Strengths
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 h-4">
                {data.strengths.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5 pt-1">
            <InsightList items={data.strengths} variant="strength" />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="weaknesses"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden px-0"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-zinc-800/30 transition-colors [&>svg]:text-zinc-500">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-200">
                Weaknesses & Gaps
              </span>
              <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px] px-1.5 h-4">
                {data.weaknesses.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5 pt-1">
            <InsightList items={data.weaknesses} variant="weakness" />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="actions"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden px-0"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-zinc-800/30 transition-colors [&>svg]:text-zinc-500">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-200">
                Action Plan
              </span>
              <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px] px-1.5 h-4">
                {data.actionableSteps.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5 pt-1">
            <InsightList items={data.actionableSteps} variant="action" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ─── Error Panel ──────────────────────────────────────────────────────────────

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

// ─── Drop Zone Sub-components ─────────────────────────────────────────────────

function SectionLabel({
  icon: Icon,
  label,
  optional = false,
}: {
  icon: React.ElementType;
  label: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700">
        <Icon className="w-3.5 h-3.5 text-zinc-300" />
      </div>
      <span className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
        {label}
      </span>
      {optional && (
        <Badge
          variant="outline"
          className="text-[10px] text-zinc-500 border-zinc-700 bg-transparent px-1.5 py-0 h-4"
        >
          Optional
        </Badge>
      )}
    </div>
  );
}

function DropZoneContent({
  isDragActive,
  uploadedFile,
  onRemove,
}: {
  isDragActive: boolean;
  uploadedFile: UploadedFile | null;
  onRemove: (e: React.MouseEvent) => void;
}) {
  if (uploadedFile) {
    return (
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-600">
          <FileText className="w-6 h-6 text-white" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-white truncate max-w-[260px]">
            {uploadedFile.file.name}
          </p>
          <p className="text-xs text-zinc-500">
            {(uploadedFile.file.size / 1024).toFixed(1)} KB · PDF
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors duration-150 group"
        >
          <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
          Remove file
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-xl border transition-all duration-300",
          isDragActive
            ? "bg-white/10 border-white/40 scale-110"
            : "bg-zinc-800/80 border-zinc-700"
        )}
      >
        <UploadCloud
          className={cn(
            "w-6 h-6 transition-colors duration-300",
            isDragActive ? "text-white" : "text-zinc-400"
          )}
        />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-sm font-medium text-zinc-200">
          {isDragActive ? "Release to upload" : "Drop your resume here"}
        </p>
        <p className="text-xs text-zinc-500">
          or{" "}
          <span className="text-white underline underline-offset-2 cursor-pointer">
            click to browse
          </span>
        </p>
        <p className="text-[11px] text-zinc-600 mt-1">PDF · Max 5 MB</p>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ScreenerPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("idle");
  const [dropError, setDropError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<AtsAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading = loadingPhase !== "idle";

  // ── Drop zone handlers ──────────────────────────────────────────────────────

  const onDrop = useCallback(
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    multiple: false,
    disabled: isLoading,
  });

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
    setJobDescription("");
  }, []);

  // ── Submit: parse → analyze pipeline ───────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!uploadedFile || isLoading) return;

    setAnalysisResult(null);
    setErrorMessage(null);

    // ── Step 1: Parse PDF ──────────────────────────────────────────────────
    setLoadingPhase("parsing");

    let parseResult: ParsePdfResult;
    try {
      const formData = new FormData();
      formData.append("resume", uploadedFile.file);
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription.trim());
      }
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

    // ── Step 2: AI Analysis ────────────────────────────────────────────────
    setLoadingPhase("analyzing");

    let aiResult: Awaited<ReturnType<typeof analyzeResumeAction>>;
    try {
      aiResult = await analyzeResumeAction(
        parseResult.text,
        parseResult.jobDescription
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "A network error occurred during AI analysis."
      );
      setLoadingPhase("idle");
      return;
    }

    setLoadingPhase("idle");

    if (!aiResult.success) {
      setErrorMessage(aiResult.error);
      return;
    }

    setAnalysisResult(aiResult.data);
  }, [uploadedFile, jobDescription, isLoading]);

  const canSubmit = Boolean(uploadedFile) && !isLoading;

  // ── Loading button label ────────────────────────────────────────────────────

  const loadingLabel =
    loadingPhase === "parsing"
      ? "Parsing Document…"
      : loadingPhase === "analyzing"
      ? "Analyzing with AI…"
      : null;

  // ── Derive result panel state ───────────────────────────────────────────────

  const showEmptyState = !isLoading && !analysisResult && !errorMessage;
  const showResult = !isLoading && analysisResult;
  const showError = !isLoading && errorMessage;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Page Header */}
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
                Upload your resume and optionally a job description. Gemini AI
                will score your ATS compatibility and surface actionable
                improvements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* ── Left Column: Inputs ── */}
          <div className="flex flex-col gap-7">
            {/* Resume Drop Zone */}
            <div>
              <SectionLabel icon={FileText} label="Resume" />
              <div
                {...getRootProps()}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-300 outline-none",
                  isLoading
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer",
                  isDragActive
                    ? "border-white/60 bg-white/5 scale-[1.01]"
                    : uploadedFile
                    ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500/70"
                    : dropError
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/70"
                )}
              >
                <input {...getInputProps()} />
                <DropZoneContent
                  isDragActive={isDragActive}
                  uploadedFile={uploadedFile}
                  onRemove={handleRemoveFile}
                />
              </div>
              {dropError && (
                <div className="flex items-center gap-2 mt-3">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{dropError}</p>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div>
              <SectionLabel
                icon={ClipboardList}
                label="Job Description"
                optional
              />
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLoading}
                placeholder="Paste the job description for targeted ATS scoring…"
                rows={7}
                className={cn(
                  "resize-none bg-zinc-900/40 border-zinc-700 text-zinc-200 placeholder:text-zinc-600",
                  "text-sm leading-relaxed rounded-xl",
                  "focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-zinc-500",
                  "hover:border-zinc-600 transition-colors duration-150",
                  "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
              />
              {jobDescription.trim().length > 0 && !isLoading && (
                <p className="text-[11px] text-zinc-600 mt-1.5 text-right">
                  {jobDescription.trim().split(/\s+/).length} words
                </p>
              )}
            </div>

            {/* Submit Button */}
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

            {/* Pipeline status strip (visible during loading) */}
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
                    label="Gemini AI analysis"
                    status={
                      loadingPhase === "analyzing"
                        ? "active"
                        : "pending"
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Results ── */}
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
                        : "Gemini is analyzing…"}
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
              <ResultDashboard data={analysisResult} onReset={handleReset} />
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

// ─── Pipeline Step (small utility) ────────────────────────────────────────────

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