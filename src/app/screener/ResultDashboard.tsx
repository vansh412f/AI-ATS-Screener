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
  Sparkles,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Zap,
  RotateCcw,
  Cpu,
  ScanSearch,
  LayoutDashboard,
} from "lucide-react";
import { AtsAnalysisResult, AtsMode } from "@/actions/analyze-resume";
import { cn } from "@/lib/utils";

interface ResultDashboardProps {
  data: AtsAnalysisResult;
  atsMode: AtsMode;
  onReset: () => void;
}

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

function ScoreRing({ score }: { score: number }) {
  const { stroke, text, label } = getScoreColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="64"
            cy="64"
            r={radius}
            strokeWidth="10"
            stroke="#27272a"
            strokeLinecap="round"
          />
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

function InsightList({
  items,
  variant,
}: {
  items: string[];
  variant: "strength" | "weakness" | "action";
}) {
  const config = {
    strength: {
      dotClass: "bg-emerald-500",
      borderClass: "border-emerald-500/20",
      bgClass: "bg-emerald-500/5",
    },
    weakness: {
      dotClass: "bg-red-500",
      borderClass: "border-red-500/20",
      bgClass: "bg-red-500/5",
    },
    action: {
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
            <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
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

// Maps each mode to the badge's visual treatment and copy.
const ATS_MODE_BADGE_CONFIG: Record<
  AtsMode,
  {
    icon: React.ElementType;
    label: string;
    className: string;
  }
> = {
  legacy: {
    icon: ScanSearch,
    label: "Legacy ATS — Strict Keyword Match",
    className:
      "bg-orange-500/10 text-orange-400 border-orange-500/30",
  },
  modern: {
    icon: Cpu,
    label: "Modern AI ATS — Semantic Match",
    className:
      "bg-violet-500/10 text-violet-400 border-violet-500/30",
  },
  general: {
    icon: LayoutDashboard,
    label: "General Best Practices",
    className:
      "bg-zinc-700/40 text-zinc-400 border-zinc-600/40",
  },
};

function AtsModeIndicator({ mode }: { mode: AtsMode }) {
  const { icon: Icon, label, className } = ATS_MODE_BADGE_CONFIG[mode];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-[11px] font-medium",
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
}

export function ResultDashboard({
  data,
  atsMode,
  onReset,
}: ResultDashboardProps) {
  const { bg } = getScoreColor(data.atsScore);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Score header + summary */}
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

            {/* Score tier pill */}
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

            {/* Which ATS engine produced this score */}
            <AtsModeIndicator mode={atsMode} />
          </div>
        </div>
      </div>

      {/* Detail accordion */}
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