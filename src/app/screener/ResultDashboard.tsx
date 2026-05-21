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
  TrendingUp,
  TrendingDown,
  Zap,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ScanSearch,
  BrainCircuit,
  Building2,
} from "lucide-react";
import { AtsAnalysisResult } from "@/actions/analyze-resume";
import { cn } from "@/lib/utils";

// The two result shapes the dashboard can receive.
// generalResult is used when no JD was provided.
export type DashboardResults =
  | {
      mode: "comparison";
      legacy: AtsAnalysisResult;
      modern: AtsAnalysisResult;
    }
  | {
      mode: "general";
      general: AtsAnalysisResult;
    };

interface ResultDashboardProps {
  results: DashboardResults;
  onReset: () => void;
}

// ─── Design tokens per column ────────────────────────────────────────────────

const LEGACY_THEME = {
  accent: "#f97316",         // orange-500
  accentMuted: "#f9731620",
  accentBorder: "#f9731630",
  scoreText: "text-orange-400",
  scoreLow: "text-red-400",
  scoreMid: "text-amber-400",
  scoreHigh: "text-orange-400",
  headerGradient: "from-orange-950/40 via-zinc-900/0",
  badgeBg: "bg-orange-500/10",
  badgeBorder: "border-orange-500/25",
  badgeText: "text-orange-400",
  cardBorder: "border-orange-500/15",
  cardBg: "bg-orange-950/10",
  strengthBorder: "border-orange-500/20",
  strengthBg: "bg-orange-500/5",
  dot: "bg-orange-400",
  weaknessBorder: "border-red-500/20",
  weaknessBg: "bg-red-500/5",
  weaknessDot: "bg-red-400",
  actionBorder: "border-amber-500/20",
  actionBg: "bg-amber-500/5",
  numberBg: "bg-amber-400/10 text-amber-400 border-amber-400/25",
  icon: ScanSearch,
  columnLabel: "Legacy ATS Score",
  columnSub: "Simulating strict keyword-parsing systems",
  systemNames: "Taleo · Workday · SuccessFactors",
  accordionTriggerHover: "hover:bg-orange-950/30",
} as const;

const MODERN_THEME = {
  accent: "#818cf8",         // indigo-400
  accentMuted: "#818cf820",
  accentBorder: "#818cf830",
  scoreText: "text-indigo-400",
  scoreLow: "text-red-400",
  scoreMid: "text-violet-400",
  scoreHigh: "text-indigo-400",
  headerGradient: "from-indigo-950/40 via-zinc-900/0",
  badgeBg: "bg-indigo-500/10",
  badgeBorder: "border-indigo-500/25",
  badgeText: "text-indigo-400",
  cardBorder: "border-indigo-500/15",
  cardBg: "bg-indigo-950/10",
  strengthBorder: "border-emerald-500/20",
  strengthBg: "bg-emerald-500/5",
  dot: "bg-emerald-400",
  weaknessBorder: "border-red-500/20",
  weaknessBg: "bg-red-500/5",
  weaknessDot: "bg-red-400",
  actionBorder: "border-indigo-500/20",
  actionBg: "bg-indigo-500/5",
  numberBg: "bg-indigo-400/10 text-indigo-400 border-indigo-400/25",
  icon: BrainCircuit,
  columnLabel: "Modern Semantic Score",
  columnSub: "Simulating AI-driven semantic platforms",
  systemNames: "Greenhouse · Lever · Eightfold",
  accordionTriggerHover: "hover:bg-indigo-950/30",
} as const;

const GENERAL_THEME = {
  accent: "#a1a1aa",
  accentMuted: "#a1a1aa15",
  accentBorder: "#a1a1aa25",
  scoreText: "text-zinc-300",
  scoreLow: "text-red-400",
  scoreMid: "text-yellow-400",
  scoreHigh: "text-emerald-400",
  headerGradient: "from-zinc-800/40 via-zinc-900/0",
  badgeBg: "bg-zinc-700/30",
  badgeBorder: "border-zinc-600/30",
  badgeText: "text-zinc-400",
  cardBorder: "border-zinc-700/30",
  cardBg: "bg-zinc-900/30",
  strengthBorder: "border-emerald-500/20",
  strengthBg: "bg-emerald-500/5",
  dot: "bg-emerald-400",
  weaknessBorder: "border-red-500/20",
  weaknessBg: "bg-red-500/5",
  weaknessDot: "bg-red-400",
  actionBorder: "border-yellow-500/20",
  actionBg: "bg-yellow-500/5",
  numberBg: "bg-yellow-400/10 text-yellow-400 border-yellow-400/25",
  icon: Sparkles,
  columnLabel: "General ATS Analysis",
  columnSub: "Evaluated against universal resume best practices",
  systemNames: "",
  accordionTriggerHover: "hover:bg-zinc-800/40",
} as const;

type ColumnTheme = typeof LEGACY_THEME;

// ─── Sub-components ───────────────────────────────────────────────────────────

function getScoreTextClass(score: number, theme: ColumnTheme): string {
  if (score >= 80) return theme.scoreHigh;
  if (score >= 60) return theme.scoreMid;
  return theme.scoreLow;
}

function getScoreStroke(score: number, theme: ColumnTheme): string {
  if (score >= 80) return theme.accent;
  if (score >= 60) return score >= 60 ? "#eab308" : theme.accent;
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function ScoreRing({
  score,
  theme,
  size = "md",
}: {
  score: number;
  theme: ColumnTheme;
  size?: "sm" | "md";
}) {
  const radius = size === "sm" ? 42 : 50;
  const svgSize = size === "sm" ? 100 : 116;
  const strokeWidth = size === "sm" ? 9 : 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const stroke = getScoreStroke(score, theme);
  const textClass = getScoreTextClass(score, theme);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative",
          size === "sm" ? "w-24 h-24" : "w-28 h-28"
        )}
      >
        <svg
          className="w-full h-full -rotate-90"
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          fill="none"
        >
          {/* Track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="#18181b"
            strokeLinecap="round"
          />
          {/* Progress */}
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
          <span className={cn("font-bold tabular-nums", textClass, size === "sm" ? "text-2xl" : "text-3xl")}>
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

function InsightList({
  items,
  variant,
  theme,
}: {
  items: string[];
  variant: "strength" | "weakness" | "action";
  theme: ColumnTheme;
}) {
  const config = {
    strength: {
      border: theme.strengthBorder,
      bg: theme.strengthBg,
      dot: theme.dot,
    },
    weakness: {
      border: theme.weaknessBorder,
      bg: theme.weaknessBg,
      dot: theme.weaknessDot,
    },
    action: {
      border: theme.actionBorder,
      bg: theme.actionBg,
      dot: "",
    },
  }[variant];

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li
          key={i}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-3 transition-colors",
            config.border,
            config.bg
          )}
        >
          {variant === "action" ? (
            <span
              className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 border",
                theme.numberBg
              )}
            >
              {i + 1}
            </span>
          ) : (
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0 mt-[7px]",
                config.dot
              )}
            />
          )}
          <span className="text-xs text-zinc-400 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// A single complete column — score ring + all three accordions.
function ResultColumn({
  data,
  theme,
  defaultOpen = true,
}: {
  data: AtsAnalysisResult;
  theme: ColumnTheme;
  defaultOpen?: boolean;
}) {
  const Icon = theme.icon;

  const scoreTierLabel =
    data.atsScore >= 80
      ? "Strong candidate profile"
      : data.atsScore >= 60
      ? "Competitive with improvements"
      : data.atsScore >= 40
      ? "Significant gaps to address"
      : "High rejection risk";

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border overflow-hidden",
        theme.cardBorder,
        theme.cardBg
      )}
    >
      {/* Column header */}
      <div
        className={cn(
          "flex flex-col gap-4 px-5 pt-5 pb-4 border-b bg-gradient-to-b",
          theme.headerGradient,
          theme.cardBorder
        )}
      >
        {/* Engine label row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg border"
              style={{
                backgroundColor: theme.accentMuted,
                borderColor: theme.accentBorder,
              }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: theme.accent }} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-200 leading-tight">
                {theme.columnLabel}
              </span>
              <span className="text-[10px] text-zinc-600 leading-tight mt-0.5">
                {theme.columnSub}
              </span>
            </div>
          </div>
        </div>

        {/* System names badge */}
        {theme.systemNames && (
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-zinc-700 shrink-0" />
            <span className="text-[10px] text-zinc-600 font-medium">
              {theme.systemNames}
            </span>
          </div>
        )}

        {/* Score ring + summary */}
        <div className="flex flex-col items-center gap-4 py-2">
          <ScoreRing score={data.atsScore} theme={theme} size="sm" />

          {/* Tier pill */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              theme.badgeBg,
              theme.badgeBorder,
              theme.badgeText
            )}
          >
            <CheckCircle2 className="w-3 h-3" />
            {scoreTierLabel}
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-zinc-500 leading-relaxed pb-1">
          {data.summary}
        </p>
      </div>

      {/* Accordions */}
      <Accordion
        type="multiple"
        defaultValue={
          defaultOpen ? ["strengths", "weaknesses", "actions"] : []
        }
        className="flex flex-col divide-y divide-zinc-800/60"
      >
        <AccordionItem value="strengths" className="border-0 px-0">
          <AccordionTrigger
            className={cn(
              "px-5 py-3.5 hover:no-underline transition-colors [&>svg]:text-zinc-600 [&>svg]:w-3.5 [&>svg]:h-3.5",
              theme.accordionTriggerHover
            )}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-semibold text-zinc-300">
                Strengths
              </span>
              <Badge
                className={cn(
                  "text-[9px] px-1.5 h-3.5 border",
                  "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                )}
              >
                {data.strengths.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4 pt-1">
            <InsightList items={data.strengths} variant="strength" theme={theme} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="weaknesses" className="border-0 px-0">
          <AccordionTrigger
            className={cn(
              "px-5 py-3.5 hover:no-underline transition-colors [&>svg]:text-zinc-600 [&>svg]:w-3.5 [&>svg]:h-3.5",
              theme.accordionTriggerHover
            )}
          >
            <div className="flex items-center gap-2">
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-semibold text-zinc-300">
                Weaknesses
              </span>
              <Badge
                className={cn(
                  "text-[9px] px-1.5 h-3.5 border",
                  "bg-red-500/10 text-red-500 border-red-500/25"
                )}
              >
                {data.weaknesses.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4 pt-1">
            <InsightList items={data.weaknesses} variant="weakness" theme={theme} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="actions" className="border-0 px-0">
          <AccordionTrigger
            className={cn(
              "px-5 py-3.5 hover:no-underline transition-colors [&>svg]:text-zinc-600 [&>svg]:w-3.5 [&>svg]:h-3.5",
              theme.accordionTriggerHover
            )}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              <span className="text-xs font-semibold text-zinc-300">
                Action Plan
              </span>
              <Badge
                className={cn(
                  "text-[9px] px-1.5 h-3.5 border",
                  theme.badgeBg,
                  theme.badgeText,
                  theme.badgeBorder
                )}
              >
                {data.actionableSteps.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-4 pt-1">
            <InsightList items={data.actionableSteps} variant="action" theme={theme} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// Delta badge shown in the comparison header when both scores exist.
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
    <div className="flex items-center gap-1.5">
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
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function ResultDashboard({ results, onReset }: ResultDashboardProps) {
  if (results.mode === "general") {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DashboardHeader onReset={onReset} isComparison={false} />
        <ResultColumn
          data={results.general}
          theme={GENERAL_THEME}
          defaultOpen
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DashboardHeader
        onReset={onReset}
        isComparison
        legacy={results.legacy.atsScore}
        modern={results.modern.atsScore}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ResultColumn data={results.legacy} theme={LEGACY_THEME} defaultOpen />
        <ResultColumn data={results.modern} theme={MODERN_THEME} defaultOpen />
      </div>
    </div>
  );
}

function DashboardHeader({
  onReset,
  isComparison,
  legacy,
  modern,
}: {
  onReset: () => void;
  isComparison: boolean;
  legacy?: number;
  modern?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-200">
            {isComparison ? "Dual ATS Comparison" : "ATS Analysis"}
          </span>
          {isComparison && legacy !== undefined && modern !== undefined && (
            <ScoreDelta legacy={legacy} modern={modern} />
          )}
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
  );
}