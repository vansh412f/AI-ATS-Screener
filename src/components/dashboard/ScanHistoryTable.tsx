"use client";

import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ScanRecord } from "@/types/ats";

interface ScanHistoryTableProps {
  scans: ScanRecord[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDelta(
  legacy: number,
  modern: number
): { label: string; badgeClass: string } {
  const delta = modern - legacy;
  if (delta > 0)
    return {
      label: `+${delta}`,
      badgeClass:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10",
    };
  if (delta < 0)
    return {
      label: `${delta}`,
      badgeClass:
        "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/10",
    };
  return {
    label: "=",
    badgeClass:
      "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 hover:bg-zinc-500/10",
  };
}

export function ScanHistoryTable({ scans }: ScanHistoryTableProps) {
  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <FileSearch size={32} className="text-zinc-700" />
        <p className="text-zinc-500 text-sm">No scans yet.</p>
        <Link
          href="/screener"
          className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors duration-200"
        >
          Run your first scan →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-sm border-collapse min-w-[520px]">
        <thead>
          <tr>
            <th className="text-zinc-400 text-xs uppercase tracking-wider font-medium text-left py-2 px-3">
              Date
            </th>
            <th className="text-zinc-400 text-xs uppercase tracking-wider font-medium text-left py-2 px-3">
              Job Title
            </th>
            <th className="text-zinc-400 text-xs uppercase tracking-wider font-medium text-right py-2 px-3">
              Legacy
            </th>
            <th className="text-zinc-400 text-xs uppercase tracking-wider font-medium text-right py-2 px-3">
              Modern
            </th>
            <th className="text-zinc-400 text-xs uppercase tracking-wider font-medium text-right py-2 px-3">
              Delta
            </th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan, index) => {
            const delta = getDelta(scan.legacyScore, scan.modernScore);

            return (
              <tr
                key={scan.id}
                className={`${
                  index % 2 === 0 ? "bg-zinc-900/60" : "bg-zinc-950/60"
                } hover:bg-zinc-800/40 transition-colors duration-150`}
              >
                <td className="py-2.5 px-3 text-zinc-400 text-xs whitespace-nowrap">
                  {formatDate(scan.createdAt)}
                </td>
                <td
                  className="py-2.5 px-3 text-zinc-200 font-medium max-w-[200px] truncate"
                  title={scan.jobTitle}
                >
                  {scan.jobTitle}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <Badge
                    variant="outline"
                    className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/10 font-bold tabular-nums text-xs"
                  >
                    {scan.legacyScore}
                  </Badge>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <Badge
                    variant="outline"
                    className="bg-indigo-500/10 text-indigo-400 border-indigo-400/20 hover:bg-indigo-500/10 font-bold tabular-nums text-xs"
                  >
                    {scan.modernScore}
                  </Badge>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <Badge
                    variant="outline"
                    className={`${delta.badgeClass} font-bold tabular-nums text-xs`}
                  >
                    {delta.label}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}