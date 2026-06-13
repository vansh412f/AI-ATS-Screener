"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileSearch, ArrowRight, Zap, Brain, BarChart3 } from "lucide-react";

export function EmptyDashboard() {
  return (
    <div className="flex items-center justify-center py-16 px-6">
      <div className="max-w-lg w-full">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 md:p-10 text-center relative overflow-hidden group">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(129, 140, 248, 0.08), transparent 60%)",
            }}
          />

          <div className="relative flex items-center justify-center gap-4 mb-8">
            <div className="bg-orange-500/10 rounded-xl p-3 ring-1 ring-orange-500/20">
              <Zap size={22} className="text-orange-500" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-px bg-zinc-700" />
              <div className="w-8 h-px bg-zinc-800" />
            </div>
            <div className="bg-indigo-500/10 rounded-xl p-3 ring-1 ring-indigo-400/20">
              <Brain size={22} className="text-indigo-400" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-px bg-zinc-700" />
              <div className="w-8 h-px bg-zinc-800" />
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-3 ring-1 ring-emerald-500/20">
              <BarChart3 size={22} className="text-emerald-400" />
            </div>
          </div>

          <h2 className="relative text-xl md:text-2xl font-bold text-white mb-3">
            Your Dashboard Is Ready
          </h2>

          <p className="relative text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto mb-8">
            Run your first resume scan to unlock score tracking, trend analysis,
            and side-by-side engine comparisons — all in one place.
          </p>

          <div className="relative">
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:bg-zinc-100 rounded-xl font-semibold transition-all duration-200 gap-2"
            >
              <Link href="/screener">
                <FileSearch size={18} />
                Run Your First Scan
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>

          <p className="relative text-zinc-600 text-xs mt-6">
            Takes less than 30 seconds. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="text-center">
            <p className="text-zinc-500 text-[11px] font-medium">Dual Engine</p>
            <p className="text-zinc-600 text-[10px]">Legacy + Modern</p>
          </div>
          <div className="text-center">
            <p className="text-zinc-500 text-[11px] font-medium">Score Trends</p>
            <p className="text-zinc-600 text-[10px]">Track over time</p>
          </div>
          <div className="text-center">
            <p className="text-zinc-500 text-[11px] font-medium">Actionable</p>
            <p className="text-zinc-600 text-[10px]">Clear next steps</p>
          </div>
        </div>
      </div>
    </div>
  );
}