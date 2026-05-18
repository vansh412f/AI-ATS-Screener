import React from 'react';
import { ArrowRight, Bot, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-sm font-medium text-blue-400">
          <Bot className="h-4 w-4" />
          <span>Next-Gen AI ATS Platform</span>
        </div>
        
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
          Analyze Resumes Against JDs with <span className="bg-gradient-to-r select-none bg-clip-text text-transparent from-blue-500 to-indigo-500">Precision AI</span>
        </h1>
        
        <p className="mt-6 text-lg leading-8 text-zinc-400">
          An elite, local-first platform designed to securely parse documents, compute gap analyses, and generate actionable upskilling roadmaps using Google Gemini.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-5xl sm:mt-24 lg:mt-32">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
          <div className="relative pl-16">
            <dt className="text-base font-semibold leading-7 text-white">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-blue-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              In-Memory Processing
            </dt>
            <dd className="mt-2 text-base leading-7 text-zinc-400">
              Resumes are securely parsed directly in-memory. Zero persistent storage of raw documents.
            </dd>
          </div>
          <div className="relative pl-16">
            <dt className="text-base font-semibold leading-7 text-white">
              <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-blue-500">
                <Zap className="h-6 w-6" />
              </div>
              Structured Gap Analysis
            </dt>
            <dd className="mt-2 text-base leading-7 text-zinc-400">
              Receive strict JSON metrics mapping domain breakdowns directly to visualization charts.
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}