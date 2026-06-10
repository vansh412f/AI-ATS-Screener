"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const ANIMATION = {
  animation: "fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
} as const;

export function HeroSection() {
  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section
        className="bg-black pt-8 md:pt-12 pb-6 md:pb-8 flex flex-col items-center px-6 text-center"
        style={{
          backgroundImage: `radial-gradient(circle, #27272a 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      >
        <div className="flex flex-col items-center gap-4 max-w-3xl w-full">
          <div
            style={{ ...ANIMATION, animationDelay: "0ms" }}
            className="flex flex-col items-center gap-1"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Know Exactly Where Your
            </h1>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-200 bg-clip-text text-transparent">
                Resume
              </span>{" "}
              <span className="text-white">Stands</span>
            </h1>
          </div>

          <p
            style={{ ...ANIMATION, animationDelay: "100ms" }}
            className="text-sm md:text-base text-zinc-400 max-w-xl"
          >
            Two ATS Engines. One Truth About Your Resume.
          </p>

          <div
            style={{ ...ANIMATION, animationDelay: "200ms" }}
            className="w-full flex justify-center"
          >
            <Link
  href="/screener"
  className="inline-flex w-auto items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-blue-400/20 bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 px-4 md:px-5 py-2 md:py-2.5 text-sm md:text-base font-semibold text-white shadow-[0_12px_30px_-12px_rgba(37,99,235,0.6)] transition-all duration-300 hover:from-sky-600 hover:via-blue-600 hover:to-indigo-700 hover:shadow-[0_16px_36px_-14px_rgba(37,99,235,0.75)] active:scale-[0.98]"
>
  <span className="whitespace-nowrap">Scan Your Resume</span>
  <ArrowRight size={16} className="shrink-0" />
</Link>
          </div>
        </div>
      </section>
    </>
  );
}