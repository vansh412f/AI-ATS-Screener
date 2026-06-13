"use server";

import { prisma } from "@/lib/prisma";
import type { DashboardStats, ScanRecord } from "@/types/ats";

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [totalScans, distinctUsers] = await Promise.all([
      prisma.resumeScan.count(),
      prisma.resumeScan.findMany({
        select: { clerkUserId: true },
        distinct: ["clerkUserId"],
      }),
    ]);

    return {
      totalScans,
      totalUsers: distinctUsers.length,
    };
  } catch {
    return { totalScans: 0, totalUsers: 0 };
  }
}

export async function getLastScan(userId: string): Promise<ScanRecord | null> {
  try {
    const row = await prisma.resumeScan.findFirst({
      where: { clerkUserId: userId },
      orderBy: { createdAt: "desc" },
    });

    if (!row) return null;

    return {
      id: row.id,
      jobTitle: row.jobTitle,
      legacyScore: row.legacyScore,
      modernScore: row.modernScore,
      createdAt: row.createdAt,
    };
  } catch {
    return null;
  }
}

export async function getScanHistory(userId: string): Promise<ScanRecord[]> {
  try {
    const rows = await prisma.resumeScan.findMany({
      where: { clerkUserId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return rows.map((row) => ({
      id: row.id,
      jobTitle: row.jobTitle,
      legacyScore: row.legacyScore,
      modernScore: row.modernScore,
      createdAt: row.createdAt,
    }));
  } catch {
    return [];
  }
}