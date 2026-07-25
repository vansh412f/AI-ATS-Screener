"use server";

import { prisma } from "@/lib/prisma";
import type { DashboardStats, ScanRecord } from "@/types/ats";

export async function getDashboardStats(): Promise<DashboardStats> {
  const t0 = Date.now();
  console.log(`[TIMING] getDashboardStats: start`);

  try {
    const tCount = Date.now();
    const [totalScans, distinctUsers] = await Promise.all([
      prisma.resumeScan.count(),
      prisma.resumeScan.findMany({
        select: { clerkUserId: true },
        distinct: ["clerkUserId"],
      }),
    ]);
    console.log(`[TIMING] getDashboardStats: count + distinctUsers (parallel) => ${Date.now() - tCount}ms`);
    console.log(`[TIMING] getDashboardStats: total => ${Date.now() - t0}ms | totalScans=${totalScans} totalUsers=${distinctUsers.length}`);

    return {
      totalScans,
      totalUsers: distinctUsers.length,
    };
  } catch (err) {
    console.error(`[TIMING] getDashboardStats: FAILED after ${Date.now() - t0}ms`, err);
    return { totalScans: 0, totalUsers: 0 };
  }
}

export async function getLastScan(userId: string): Promise<ScanRecord | null> {
  const t0 = Date.now();
  console.log(`[TIMING] getLastScan: start`);

  try {
    const row = await prisma.resumeScan.findFirst({
      where: { clerkUserId: userId },
      orderBy: { createdAt: "desc" },
    });
    console.log(`[TIMING] getLastScan: query => ${Date.now() - t0}ms | found=${!!row}`);

    if (!row) return null;

    return {
      id: row.id,
      jobTitle: row.jobTitle,
      legacyScore: row.legacyScore,
      modernScore: row.modernScore,
      createdAt: row.createdAt,
    };
  } catch (err) {
    console.error(`[TIMING] getLastScan: FAILED after ${Date.now() - t0}ms`, err);
    return null;
  }
}

export async function getScanHistory(userId: string): Promise<ScanRecord[]> {
  const t0 = Date.now();
  console.log(`[TIMING] getScanHistory: start`);

  try {
    const rows = await prisma.resumeScan.findMany({
      where: { clerkUserId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    console.log(`[TIMING] getScanHistory: query => ${Date.now() - t0}ms | rows=${rows.length}`);

    return rows.map((row: {
      id: string;
      jobTitle: string;
      legacyScore: number;
      modernScore: number;
      createdAt: Date;
    }) => ({
      id: row.id,
      jobTitle: row.jobTitle,
      legacyScore: row.legacyScore,
      modernScore: row.modernScore,
      createdAt: row.createdAt,
    }));
  } catch (err) {
    console.error(`[TIMING] getScanHistory: FAILED after ${Date.now() - t0}ms`, err);
    return [];
  }
}