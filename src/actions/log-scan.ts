"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface LogScanInput {
  jobTitle: string | null;
  legacyScore: number;
  modernScore: number;
}

function extractJobTitle(jobDescription: string | null): string {
  if (!jobDescription?.trim()) return "General";
  const firstLine = jobDescription.trim().split("\n")[0].trim();
  return firstLine.slice(0, 100) || "General";
}

export async function logScanAction(input: LogScanInput): Promise<void> {
  const t0 = Date.now();
  console.log(`[TIMING] logScanAction: start`);

  const { userId } = await auth();
  if (!userId) return;

  try {
    await prisma.resumeScan.create({
      data: {
        clerkUserId: userId,
        jobTitle: extractJobTitle(input.jobTitle),
        legacyScore: input.legacyScore,
        modernScore: input.modernScore,
      },
    });
    console.log(`[TIMING] logScanAction: db write => ${Date.now() - t0}ms`);
  } catch {
    console.error(`[TIMING] logScanAction: FAILED after ${Date.now() - t0}ms`);
  }
}