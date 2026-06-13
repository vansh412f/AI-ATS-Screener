"use client";

import type { ScanRecord } from "@/types/ats";
import {
  FileSearch,
  Trophy,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface DashboardStatsProps {
  scans: ScanRecord[];
}

export function DashboardStats({ scans }: DashboardStatsProps) {
  if (scans.length === 0) return null;

  const totalScans = scans.length;

  const bestScan = scans.reduce((best, scan) =>
    scan.modernScore > best.modernScore ? scan : best
  );
  const bestScore = bestScan.modernScore;
  const bestJobTitle = bestScan.jobTitle;

  const avgDelta = Math.round(
    scans.reduce((sum, scan) => sum + (scan.modernScore - scan.legacyScore), 0) /
      scans.length
  );

  const improvement =
    scans.length >= 2
      ? scans[0].modernScore - scans[1].modernScore
      : null;

  const improvementColor =
    improvement === null || improvement === 0
      ? {
          text: "text-zinc-400",
          bg: "bg-zinc-500/10",
          ring: "ring-zinc-400/20",
          glow: "rgba(161, 161, 170, 0.06)",
        }
      : improvement > 0
        ? {
            text: "text-emerald-400",
            bg: "bg-emerald-500/10",
            ring: "ring-emerald-400/20",
            glow: "rgba(52, 211, 153, 0.06)",
          }
        : {
            text: "text-red-400",
            bg: "bg-red-500/10",
            ring: "ring-red-400/20",
            glow: "rgba(248, 113, 113, 0.06)",
          };

  const ImprovementIcon =
    improvement === null || improvement === 0
      ? Minus
      : improvement > 0
        ? ArrowUpRight
        : ArrowDownRight;

  const improvementLabel =
    improvement === null
      ? "N/A"
      : improvement > 0
        ? `+${improvement}`
        : improvement === 0
          ? "0"
          : `${improvement}`;

  const improvementValueClass =
    improvement === null
      ? "text-zinc-500"
      : improvementColor.text;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1 — Total Scans */}
      <div className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all duration-200 relative overflow-hidden">
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(129, 140, 248, 0.06), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col gap-3">
          <div className="bg-indigo-500/10 rounded-xl p-2 w-fit ring-1 ring-indigo-400/20">
            <FileSearch size={18} className="text-indigo-400" />
          </div>
          <p className="text-white text-2xl font-bold tabular-nums">
            {totalScans}
          </p>
          <p className="text-zinc-500 text-xs font-medium">Total Scans</p>
        </div>
      </div>

      {/* Card 2 — Best Score */}
      <div className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all duration-200 relative overflow-hidden">
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.06), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col gap-3">
          <div className="bg-emerald-500/10 rounded-xl p-2 w-fit ring-1 ring-emerald-400/20">
            <Trophy size={18} className="text-emerald-400" />
          </div>
          <p className="text-white text-2xl font-bold tabular-nums">
            {bestScore}
          </p>
          <p
            className="text-zinc-500 text-xs font-medium truncate max-w-full"
            title={bestJobTitle}
          >
            {bestJobTitle}
          </p>
        </div>
      </div>

      {/* Card 3 — Avg Delta */}
      <div className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all duration-200 relative overflow-hidden">
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.06), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col gap-3">
          <div className="bg-sky-500/10 rounded-xl p-2 w-fit ring-1 ring-sky-400/20">
            <TrendingUp size={18} className="text-sky-400" />
          </div>
          <p
            className={`text-2xl font-bold tabular-nums ${
              avgDelta > 0
                ? "text-emerald-400"
                : avgDelta < 0
                  ? "text-red-400"
                  : "text-zinc-400"
            }`}
          >
            {avgDelta > 0 ? `+${avgDelta}` : `${avgDelta}`}
          </p>
          <p className="text-zinc-500 text-xs font-medium">
            Avg Modern vs Legacy
          </p>
        </div>
      </div>

      {/* Card 4 — Improvement */}
      <div className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all duration-200 relative overflow-hidden">
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${improvementColor.glow}, transparent 70%)`,
          }}
        />
        <div className="relative flex flex-col gap-3">
          <div
            className={`${improvementColor.bg} rounded-xl p-2 w-fit ring-1 ${improvementColor.ring}`}
          >
            <ImprovementIcon size={18} className={improvementColor.text} />
          </div>
          <p
            className={`text-2xl font-bold tabular-nums ${improvementValueClass}`}
          >
            {improvementLabel}
          </p>
          <p className="text-zinc-500 text-xs font-medium">vs Previous Scan</p>
        </div>
      </div>
    </div>
  );
}