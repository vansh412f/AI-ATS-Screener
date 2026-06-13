"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

export function AuthWall() {
  return (
    <div className="w-full px-6">
      <div className="max-w-md w-full mx-auto bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center gap-6">
        <div className="bg-indigo-500/10 rounded-2xl p-4 ring-1 ring-indigo-400/20">
          <Lock
            size={28}
            className="text-indigo-400"
            style={{ filter: "drop-shadow(0 0 12px rgba(129, 140, 248, 0.4))" }}
          />
        </div>

        <div className="flex flex-col gap-2 items-center">
          <h2 className="text-xl font-bold text-white">
            Your Analytics Are Waiting
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
            Sign in to view your scan history, score trends, and improvement over
            time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/sign-in?redirect_url=/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-zinc-100 transition-all duration-200 w-full sm:w-auto"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up?redirect_url=/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 hover:border-zinc-600 backdrop-blur-sm transition-all duration-200 w-full sm:w-auto"
          >
            Create Account
          </Link>
        </div>

        <p className="text-zinc-600 text-xs">
          Free to use. No credit card required.
        </p>
      </div>
    </div>
  );
}