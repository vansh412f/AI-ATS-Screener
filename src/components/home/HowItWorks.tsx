"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Zap, Brain, BarChart3, ChevronDown } from "lucide-react";

const KEYWORD_ROWS: { label: string; found: boolean }[] = [
  { label: '"React.js"', found: true },
  { label: '"TypeScript"', found: true },
  { label: '"GraphQL"', found: false },
  { label: '"AWS Lambda"', found: false },
  { label: '"CI/CD"', found: true },
];

const CONCEPT_ROWS: { label: string; dots: number }[] = [
  { label: "Impact Metrics", dots: 4 },
  { label: "Skill Alignment", dots: 5 },
  { label: "Career Growth", dots: 3 },
  { label: "Role Fit", dots: 4 },
  { label: "Evidence Quality", dots: 3 },
];

function animStyle(
  visible: boolean,
  animation: string,
  duration: number,
  delay: number
): React.CSSProperties {
  return visible
    ? {
        animation: `${animation} ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both`,
      }
    : { opacity: 0 };
}

function rowRevealStyle(visible: boolean, delay: number): React.CSSProperties {
  return visible
    ? { animation: `rowReveal 350ms ease-out ${delay}ms both` }
    : { opacity: 0 };
}

const floatStyle = (delay: number): React.CSSProperties => ({
  animation: `float 3s ease-in-out ${delay}s infinite`,
});

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: translateY(20px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes panelInLeft {
          from { opacity: 0; transform: translateX(-40px) scale(0.94); filter: blur(6px); }
          to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
        }
        @keyframes panelInRight {
          from { opacity: 0; transform: translateX(40px) scale(0.94); filter: blur(6px); }
          to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0px); }
        }
        @keyframes rowReveal {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes connectorGrow {
          from { opacity: 0; transform: scaleY(0); }
          to { opacity: 1; transform: scaleY(1); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
        @keyframes scanLine {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes badgePop {
          from { opacity: 0; transform: scale(0.5); }
          50% { transform: scale(1.15); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes statusBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <section ref={sectionRef} className="bg-black px-4 sm:px-6 pb-20 overflow-hidden">
        <div className="max-w-4xl mx-auto">

          {/* ── Section Header ── */}
          <div
            className="pt-16 pb-10 text-center"
            style={animStyle(visible, "fadeInUp", 600, 0)}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 mb-5 backdrop-blur-sm">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                style={{ animation: "statusBlink 2s ease-in-out infinite" }}
              />
              <span className="text-zinc-400 text-[11px] uppercase tracking-[0.2em] font-medium">
                How It Works
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">
              From Upload to{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, #38bdf8, #818cf8, #38bdf8)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s linear infinite",
                }}
              >
                Insight
              </span>{" "}
              in Seconds
            </h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-md mx-auto">
              Four steps. Two engines. One complete picture.
            </p>
          </div>

          {/* ── Step Badge ── */}
          <div
            className="flex justify-center mb-3"
            style={animStyle(visible, "badgePop", 400, 80)}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
              Step 1
            </span>
          </div>

          {/* ── Row 1 — Upload & Target ── */}
          <div
            className="relative bg-gradient-to-br from-zinc-900/80 via-zinc-900/50 to-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 text-center max-w-sm mx-auto group hover:border-zinc-700 hover:scale-[1.02] transition-all duration-400 cursor-default overflow-hidden"
            style={animStyle(visible, "scaleIn", 600, 120)}
          >
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(56,189,248,0.06), transparent 70%)",
              }}
            />
            <div className="relative flex items-center justify-center gap-3">
              <div
                className="bg-gradient-to-br from-orange-500/15 to-orange-500/5 rounded-xl p-2.5 ring-1 ring-orange-500/10"
                style={floatStyle(0)}
              >
                <Upload size={20} className="text-orange-500" />
              </div>
              <div
                className="bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 rounded-xl p-2.5 ring-1 ring-indigo-400/10"
                style={floatStyle(0.5)}
              >
                <FileText size={20} className="text-indigo-400" />
              </div>
            </div>
            <p className="relative text-white font-semibold text-sm mt-3">
              Upload & Target
            </p>
            <p className="relative text-zinc-400 text-xs mt-1">
              Drop your resume and paste a job description
            </p>
          </div>

          {/* ── Connector 1 → 2 ── */}
          <div
            className="flex flex-col items-center my-3 origin-top"
            style={
              visible
                ? { animation: "connectorGrow 500ms ease-out 450ms both" }
                : { opacity: 0 }
            }
          >
            <div
              className="w-2 h-2 rounded-full bg-sky-500/60"
              style={{ animation: visible ? "dotPulse 2s ease-in-out 500ms infinite" : undefined }}
            />
            <div className="w-px h-8 bg-gradient-to-b from-sky-500/30 via-zinc-800 to-sky-500/30" />
            <ChevronDown size={14} className="text-zinc-600 -mt-1" />
          </div>

          {/* ── Step Badge ── */}
          <div
            className="flex justify-center mb-3"
            style={animStyle(visible, "badgePop", 400, 350)}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
              Step 2 & 3
            </span>
          </div>

          {/* ── Row 2 — Split Brain ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Left — Legacy Engine */}
            <div
              className="relative bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-orange-950/20 border border-orange-500/15 rounded-2xl p-5 group hover:border-orange-500/35 hover:scale-[1.01] transition-all duration-400 cursor-default overflow-hidden"
              style={animStyle(visible, "panelInLeft", 700, 300)}
            >
              {/* Scan line effect */}
              <div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent pointer-events-none"
                style={
                  visible
                    ? { animation: "scanLine 2.5s ease-in-out 900ms both", position: "absolute" }
                    : { opacity: 0 }
                }
              />
              {/* Glow */}
              <div
                className="absolute -top-20 -left-20 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)",
                  animation: "glowPulse 4s ease-in-out infinite",
                }}
              />

              <div className="relative flex items-center gap-2 mb-1">
                <div className="bg-orange-500/10 rounded-lg p-1.5 ring-1 ring-orange-500/10">
                  <Zap size={14} className="text-orange-500" />
                </div>
                <span className="text-orange-500 font-semibold text-sm">
                  Legacy Engine
                </span>
              </div>
              <p className="relative text-zinc-500 text-xs mb-3">Keyword Scanner</p>
              <div className="relative flex flex-col gap-2">
                {KEYWORD_ROWS.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-zinc-900/50 border border-zinc-800/50 px-3 py-1.5 font-mono text-xs group/row hover:bg-zinc-800/40 hover:border-zinc-700/60 transition-all duration-200"
                    style={rowRevealStyle(visible, 500 + i * 120)}
                  >
                    <span className="text-zinc-300">{row.label}</span>
                    <span
                      className={`flex items-center gap-1 font-semibold ${
                        row.found ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          row.found ? "bg-emerald-400" : "bg-red-400"
                        }`}
                      />
                      {row.found ? "found" : "missing"}
                    </span>
                  </div>
                ))}
              </div>
              {/* Score badge */}
              <div
                className="relative mt-4 flex justify-end"
                style={animStyle(visible, "badgePop", 400, 1100)}
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-[11px] font-bold text-orange-400 tabular-nums">
                  3/5 matched
                </span>
              </div>
            </div>

            {/* Right — Modern Engine */}
            <div
              className="relative bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-indigo-950/20 border border-indigo-400/15 rounded-2xl p-5 group hover:border-indigo-400/35 hover:scale-[1.01] transition-all duration-400 cursor-default overflow-hidden"
              style={animStyle(visible, "panelInRight", 700, 300)}
            >
              {/* Scan line effect */}
              <div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent pointer-events-none"
                style={
                  visible
                    ? { animation: "scanLine 2.5s ease-in-out 1000ms both", position: "absolute" }
                    : { opacity: 0 }
                }
              />
              {/* Glow */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(129,140,248,0.12), transparent 70%)",
                  animation: "glowPulse 4s ease-in-out 1s infinite",
                }}
              />

              <div className="relative flex items-center gap-2 mb-1">
                <div className="bg-indigo-500/10 rounded-lg p-1.5 ring-1 ring-indigo-400/10">
                  <Brain size={14} className="text-indigo-400" />
                </div>
                <span className="text-indigo-400 font-semibold text-sm">
                  Modern Engine
                </span>
              </div>
              <p className="relative text-zinc-500 text-xs mb-3">Semantic Evaluator</p>
              <div className="relative flex flex-col gap-2">
                {CONCEPT_ROWS.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-zinc-900/50 border border-zinc-800/50 px-3 py-1.5 text-xs group/row hover:bg-zinc-800/40 hover:border-zinc-700/60 transition-all duration-200"
                    style={rowRevealStyle(visible, 500 + i * 120)}
                  >
                    <span className="text-zinc-300">{row.label}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div
                          key={j}
                          className={`h-2 w-2 rounded-full transition-all duration-300 ${
                            j < row.dots
                              ? "bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.5)]"
                              : "bg-zinc-700/60"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Score badge */}
              <div
                className="relative mt-4 flex justify-end"
                style={animStyle(visible, "badgePop", 400, 1200)}
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 px-2.5 py-1 text-[11px] font-bold text-indigo-300 tabular-nums">
                  19/25 score
                </span>
              </div>
            </div>
          </div>

          {/* ── Connector 2 → 3 ── */}
          <div
            className="flex flex-col items-center my-3 origin-top"
            style={
              visible
                ? { animation: "connectorGrow 500ms ease-out 800ms both" }
                : { opacity: 0 }
            }
          >
            <div
              className="w-2 h-2 rounded-full bg-emerald-500/60"
              style={{ animation: visible ? "dotPulse 2s ease-in-out 900ms infinite" : undefined }}
            />
            <div className="w-px h-8 bg-gradient-to-b from-emerald-500/30 via-zinc-800 to-emerald-500/30" />
            <ChevronDown size={14} className="text-zinc-600 -mt-1" />
          </div>

          {/* ── Step Badge ── */}
          <div
            className="flex justify-center mb-3"
            style={animStyle(visible, "badgePop", 400, 750)}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              Step 4
            </span>
          </div>

          {/* ── Row 3 — Results ── */}
          <div
            className="relative bg-gradient-to-br from-zinc-900/80 via-zinc-900/50 to-emerald-950/20 border border-zinc-800/80 rounded-2xl p-5 text-center max-w-sm mx-auto group hover:border-emerald-500/25 hover:scale-[1.02] transition-all duration-400 cursor-default overflow-hidden"
            style={animStyle(visible, "scaleIn", 600, 800)}
          >
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(52,211,153,0.06), transparent 70%)",
              }}
            />
            <div className="relative flex items-center justify-center gap-3">
              <div
                className="bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 rounded-xl p-2.5 ring-1 ring-emerald-500/10"
                style={floatStyle(1)}
              >
                <BarChart3 size={20} className="text-emerald-400" />
              </div>
            </div>
            <p className="relative text-white font-semibold text-sm mt-3">
              See Your True Score
            </p>
            <p className="relative text-zinc-400 text-xs mt-1">
              Side-by-side comparison with actionable insights
            </p>

            {/* Mini score preview */}
            <div
              className="relative mt-4 flex items-center justify-center gap-4"
              style={animStyle(visible, "fadeInUp", 500, 1000)}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Legacy</span>
                <span className="text-lg font-bold tabular-nums text-orange-500">68</span>
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Modern</span>
                <span className="text-lg font-bold tabular-nums text-indigo-400">84</span>
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Overall</span>
                <span className="text-lg font-bold tabular-nums text-emerald-400">76</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}