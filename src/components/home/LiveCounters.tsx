// src/components/home/LiveCounters.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Users, FileSearch } from "lucide-react";
import type { ScanRecord } from "@/types/ats";

interface LiveCountersProps {
  totalScans: number;
  totalUsers: number;
  lastScan: ScanRecord | null;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function getRelativeTime(date: Date): string {
  const ms = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute\({minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `\){hours} hour\({hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `\){days} day${days === 1 ? "" : "s"} ago`;
  return `${weeks} week\({weeks === 1 ? "" : "s"} ago`;
}

const DURATION = 1800;

export function LiveCounters({
  totalScans,
  totalUsers,
  lastScan,
}: LiveCountersProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const hasAnimated = useRef(false);
  const [displayUsers, setDisplayUsers] = useState(0);
  const [displayScans, setDisplayScans] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting || hasAnimated.current) return;

        setIsVisible(true);
        hasAnimated.current = true;

        if (totalUsers === 0 && totalScans === 0) return;

        const startTime = performance.now();

        function tick(now: number) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / DURATION, 1);
          const eased = easeOutQuart(progress);

          setDisplayUsers(Math.round(eased * totalUsers));
          setDisplayScans(Math.round(eased * totalScans));

          if (progress < 1) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            setDisplayUsers(totalUsers);
            setDisplayScans(totalScans);
          }
        }

        rafRef.current = requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.3 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [totalUsers, totalScans]);

  const fmt = (n: number) => Intl.NumberFormat("en-US").format(n);

  const animStyle = (delay: number): React.CSSProperties =>
    isVisible
      ? {
          animation: `fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1) \){delay}ms both`,
        }
      : { opacity: 0 };

  const cardClass =
    "bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 md:p-5 transition-all duration-200";

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section ref={sectionRef} className="bg-black px-6 pt-1 pb-14">
        <div className="max-w-4xl mx-auto">
          <div
            className={
              lastScan
                ? "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
                : "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
            }
          >
            <div className={cardClass} style={animStyle(0)}>
              {/* Mobile: Icon Left | Desktop: Icon Top */}
              <div className="flex md:block items-center gap-3 md:gap-0">
                <div className="bg-orange-500/10 rounded-xl p-2 w-fit shrink-0">
                  <Users size={20} className="text-orange-500" />
                </div>
                <div className="md:mt-2.5">
                  <p className="text-zinc-400 text-xs md:text-sm font-medium">
                    Resume Warriors
                  </p>
                  <p className="text-white text-3xl md:text-4xl font-bold tabular-nums mt-0.5">
                    {fmt(displayUsers)}
                  </p>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    users trust ATS Screener
                  </p>
                </div>
              </div>
            </div>

            <div className={cardClass} style={animStyle(120)}>
              {/* Mobile: Icon Left | Desktop: Icon Top */}
              <div className="flex md:block items-center gap-3 md:gap-0">
                <div className="bg-indigo-500/10 rounded-xl p-2 w-fit shrink-0">
                  <FileSearch size={20} className="text-indigo-400" />
                </div>
                <div className="md:mt-2.5">
                  <p className="text-zinc-400 text-xs md:text-sm font-medium">
                    Resumes Analyzed
                  </p>
                  <p className="text-white text-3xl md:text-4xl font-bold tabular-nums mt-0.5">
                    {fmt(displayScans)}
                  </p>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    scans completed and counting
                  </p>
                </div>
              </div>
            </div>

            {lastScan && (
              <div className={cardClass} style={animStyle(240)}>
                <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">
                  Your Last Scan
                </p>
                <p className="text-white font-semibold text-sm truncate mt-2">
                  {lastScan.jobTitle}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-500 text-[11px]">Legacy</span>
                    <span className="text-orange-500 text-xl md:text-2xl font-bold tabular-nums">
                      {lastScan.legacyScore}
                    </span>
                  </div>
                  <div className="w-px h-5 bg-zinc-800" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-500 text-[11px]">Modern</span>
                    <span className="text-indigo-400 text-xl md:text-2xl font-bold tabular-nums">
                      {lastScan.modernScore}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-zinc-600 text-[11px] md:text-xs">
                    {getRelativeTime(lastScan.createdAt)}
                  </span>
                  <Link
                    href="/dashboard"
                    className="text-indigo-400 text-[11px] md:text-xs hover:text-indigo-300 transition-colors duration-200"
                  >
                    View History →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}