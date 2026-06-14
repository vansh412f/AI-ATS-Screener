import Link from "next/link";
import { Briefcase, ArrowRight, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JobBoardPage() {
  return (
    <main className="bg-black min-h-screen flex items-center justify-center px-6">
      
      <div className="max-w-md w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.06), transparent 60%)",
          }}
        />

        <div className="relative flex items-center justify-center gap-3 mb-6">
          <div className="bg-sky-500/10 rounded-xl p-3 ring-1 ring-sky-400/20">
            <Briefcase size={24} className="text-sky-400" />
          </div>
        </div>

        <div className="relative flex items-center justify-center gap-2 mb-3">
          <Wrench size={14} className="text-zinc-500" />
          <span className="text-zinc-500 text-xs uppercase tracking-widest font-medium">
            In Development
          </span>
        </div>

        <h1 className="relative text-xl font-bold text-white mb-3">
          Job Board Is Coming Soon
        </h1>

        <p className="relative text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto mb-8">
          We&apos;re building an AI-powered job board that matches your resume to
          the right opportunities. Stay tuned.
        </p>

        <div className="relative">
          <Button
            asChild
            size="lg"
            className="bg-white/10 hover:bg-white/15 border border-zinc-700 hover:border-zinc-600 text-white backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 gap-2"
          >
            <Link href="/screener">
              Scan Your Resume
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>

        <p className="relative text-zinc-600 text-xs mt-6">
          Get your ATS scores while you wait.
        </p>
      </div>
    </main>
  );
}