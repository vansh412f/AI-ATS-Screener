"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ScanSearch,
  BrainCircuit,
  Building2,
  Info,
} from "lucide-react";
import type { AtsAnalysisResult } from "@/types/ats";
import { cn } from "@/lib/utils";

export interface DashboardResults {
  legacy: AtsAnalysisResult;
  modern: AtsAnalysisResult;
}

interface ResultDashboardProps {
  results: DashboardResults;
  onReset: () => void;
}

const LEGACY_THEME = {
  accent: "#f97316",
  accentMuted: "#f9731620",
  accentBorder: "#f9731630",
  scoreHigh: "text-orange-400",
  scoreMid: "text-amber-400",
  scoreLow: "text-red-400",
  headerGradient: "from-orange-950/40 via-zinc-900/0",
  badgeBg: "bg-orange-500/10",
  badgeBorder: "border-orange-500/25",
  badgeText: "text-orange-400",
  cardBorder: "border-orange-500/15",
  cardBg: "bg-orange-950/10",
  icon: ScanSearch,
  columnLabel: "Legacy ATS Score",
  columnSub: "Strict keyword-parsing simulation",
  tooltipBody:
    "Legacy ATS platforms like Taleo, Workday, and SuccessFactors parse resumes as plain text and count exact keyword matches. They cannot infer meaning, synonyms, or context — a missing keyword is a missed point, even if you clearly have the skill.",
  systemNames: "Taleo · Workday · SuccessFactors",
} as const;

const MODERN_THEME = {
  accent: "#818cf8",
  accentMuted: "#818cf820",
  accentBorder: "#818cf830",
  scoreHigh: "text-indigo-400",
  scoreMid: "text-violet-400",
  scoreLow: "text-red-400",
  headerGradient: "from-indigo-950/40 via-zinc-900/0",
  badgeBg: "bg-indigo-500/10",
  badgeBorder: "border-indigo-500/25",
  badgeText: "text-indigo-400",
  cardBorder: "border-indigo-500/15",
  cardBg: "bg-indigo-950/10",
  icon: BrainCircuit,
  columnLabel: "Modern Semantic Score",
  columnSub: "AI-driven semantic alignment",
  tooltipBody:
    "Modern AI platforms like Greenhouse, Lever, and Eightfold use natural language processing to understand the meaning behind your resume. They evaluate conceptual skill alignment, career trajectory, and quantified impact — not just keyword frequency.",
  systemNames: "Greenhouse · Lever · Eightfold",
} as const;

type ColumnTheme = typeof LEGACY_THEME;

function getScoreTextClass(score: number, theme: ColumnTheme): string {
  if (score >= 80) return theme.scoreHigh;
  if (score >= 60) return theme.scoreMid;
  return theme.scoreLow;
}

function getScoreStroke(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function getScoreTierLabel(score: number): string {
  if (score >= 80) return "Strong candidate profile";
  if (score >= 60) return "Competitive with improvements";
  if (score >= 40) return "Significant gaps to address";
  return "High rejection risk";
}

function ScoreRing({
  score,
  theme,
}: {
  score: number;
  theme: ColumnTheme;
}) {
  const radius = 42;
  const svgSize = 100;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const stroke = getScoreStroke(score);
  const textClass = getScoreTextClass(score, theme);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg
          className="w-full h-full -rotate-90"
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          fill="none"
        >
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="#18181b"
            strokeLinecap="round"
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
              filter: `drop-shadow(0 0 6px ${stroke}70)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-bold tabular-nums", textClass)}>
            {score}
          </span>
          <span className="text-[9px] text-zinc-600 uppercase tracking-widest">
            / 100
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className={cn("text-xs font-semibold", textClass)}>
          {getScoreLabel(score)}
        </span>
        <span className="text-[10px] text-zinc-600">ATS Score</span>
      </div>
    </div>
  );
}

function EngineInfoTooltip({ body }: { body: string }) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center w-4 h-4 rounded-full text-zinc-700 hover:text-zinc-400 transition-colors duration-150 shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600"
          aria-label="Learn more about this ATS engine"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        sideOffset={8}
        className="max-w-[260px] rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 shadow-xl shadow-black/50 px-3.5 py-3 text-xs leading-relaxed"
      >
        {body}
      </TooltipContent>
    </Tooltip>
  );
}

// ScoreCard renders ONLY the header, ring, tier badge, and summary.
// Insights are in the unified section below.
function ScoreCard({
  data,
  theme,
}: {
  data: AtsAnalysisResult;
  theme: ColumnTheme;
}) {
  const Icon = theme.icon;

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border overflow-hidden",
        theme.cardBorder,
        theme.cardBg
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-4 px-5 pt-5 pb-5 bg-gradient-to-b",
          theme.headerGradient
        )}
      >
        {/* Engine label row */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg border shrink-0"
            style={{
              backgroundColor: theme.accentMuted,
              borderColor: theme.accentBorder,
            }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-200 leading-tight">
                {theme.columnLabel}
              </span>
              <EngineInfoTooltip body={theme.tooltipBody} />
            </div>
            <span className="text-[10px] text-zinc-600 leading-tight mt-0.5">
              {theme.columnSub}
            </span>
          </div>
        </div>

        {/* System names */}
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3 h-3 text-zinc-700 shrink-0" />
          <span className="text-[10px] text-zinc-600 font-medium">
            {theme.systemNames}
          </span>
        </div>

        {/* Score ring — centrepiece of this card */}
        <div className="flex flex-col items-center gap-3 py-3">
          <ScoreRing score={data.atsScore} theme={theme} />

          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              theme.badgeBg,
              theme.badgeBorder,
              theme.badgeText
            )}
          >
            <CheckCircle2 className="w-3 h-3" />
            {getScoreTierLabel(data.atsScore)}
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-zinc-500 leading-relaxed">
          {data.summary}
        </p>
      </div>
    </div>
  );
}

// Modern is more holistic, so its strengths/weaknesses/actions are the most useful for actual candidate improvement.
function UnifiedInsights({ data }: { data: AtsAnalysisResult }) {
  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center gap-2.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700">
          <BrainCircuit className="w-3 h-3 text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-200">
            Detailed Insights
          </span>
          <span className="text-[10px] text-zinc-600">
            Sourced from modern semantic analysis · most actionable signal
          </span>
        </div>
      </div>

      {/* Accordions closed by default — user opens what they need */}
      <Accordion
        type="multiple"
        defaultValue={[]}
        className="flex flex-col divide-y divide-zinc-800/50"
      >
        {/* Strengths */}
        <AccordionItem value="strengths" className="border-0 px-0">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-zinc-800/20 transition-colors [&>svg]:text-zinc-600 [&>svg]:w-3.5 [&>svg]:h-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">
                Strengths
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/25 text-[9px] px-1.5 h-4 border">
                {data.strengths.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4 pt-1">
            <ul className="flex flex-col gap-2">
              {data.strengths.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-[7px]" />
                  <span className="text-xs text-zinc-400 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Weaknesses */}
        <AccordionItem value="weaknesses" className="border-0 px-0">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-zinc-800/20 transition-colors [&>svg]:text-zinc-600 [&>svg]:w-3.5 [&>svg]:h-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-3 h-3 text-red-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">
                Weaknesses
              </span>
              <Badge className="bg-red-500/10 text-red-400 border-red-500/25 text-[9px] px-1.5 h-4 border">
                {data.weaknesses.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4 pt-1">
            <ul className="flex flex-col gap-2">
              {data.weaknesses.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-red-500/15 bg-red-500/5 p-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-[7px]" />
                  <span className="text-xs text-zinc-400 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Action Plan */}
        <AccordionItem value="actions" className="border-0 px-0">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-zinc-800/20 transition-colors [&>svg]:text-zinc-600 [&>svg]:w-3.5 [&>svg]:h-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Zap className="w-3 h-3 text-indigo-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">
                Action Plan
              </span>
              <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/25 text-[9px] px-1.5 h-4 border">
                {data.actionableSteps.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4 pt-1">
            <ul className="flex flex-col gap-2">
              {data.actionableSteps.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-indigo-500/15 bg-indigo-500/5 p-3"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 border bg-indigo-400/10 text-indigo-400 border-indigo-400/25">
                    {i + 1}
                  </span>
                  <span className="text-xs text-zinc-400 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function ScoreDelta({ legacy, modern }: { legacy: number; modern: number }) {
  const delta = modern - legacy;
  const abs = Math.abs(delta);

  if (abs < 2) {
    return (
      <span className="text-[11px] text-zinc-600 font-medium">
        Scores within margin
      </span>
    );
  }

  return (
    <span className="text-[11px] text-zinc-600">
      Modern scores{" "}
      <span
        className={cn(
          "font-semibold",
          delta > 0 ? "text-indigo-400" : "text-orange-400"
        )}
      >
        {delta > 0 ? "+" : "−"}
        {abs} pts
      </span>{" "}
      {delta > 0 ? "higher" : "lower"}
    </span>
  );
}

export function ResultDashboard({ results, onReset }: ResultDashboardProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Dashboard header row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-200">
                Dual ATS Comparison
              </span>
              <ScoreDelta
                legacy={results.legacy.atsScore}
                modern={results.modern.atsScore}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Top section — two score cards side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ScoreCard data={results.legacy} theme={LEGACY_THEME} />
          <ScoreCard data={results.modern} theme={MODERN_THEME} />
        </div>

        {/* Bottom section — unified insights from modern result */}
        <UnifiedInsights data={results.modern} />
      </div>
    </TooltipProvider>
  );
}