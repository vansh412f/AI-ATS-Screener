import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getScanHistory } from "@/actions/get-dashboard-data";
import type { ScanRecord } from "@/types/ats";
import { AuthWall } from "@/components/dashboard/AuthWall";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { ScanHistoryTable } from "@/components/dashboard/ScanHistoryTable";

const ANIMATIONS = `
  @keyframes dashFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .dash-animate-1 { animation: dashFadeUp 600ms cubic-bezier(0.16,1,0.3,1) 0ms both; }
  .dash-animate-2 { animation: dashFadeUp 600ms cubic-bezier(0.16,1,0.3,1) 120ms both; }
  .dash-animate-3 { animation: dashFadeUp 600ms cubic-bezier(0.16,1,0.3,1) 240ms both; }
`;

function PageHeader({ scans }: { scans: ScanRecord[] }) {
  return (
    <div
      className="border-b border-zinc-800/60 relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle, #27272a 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 py-8 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white">Your Dashboard</h1>
          <p className="text-zinc-400 text-sm">
            {scans.length === 0
              ? "Run your first scan to start tracking your progress."
              : `Tracking ${scans.length} scan${scans.length === 1 ? "" : "s"} — keep improving.`}
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="shrink-0 bg-white/10 hover:bg-white/15 border border-zinc-700 hover:border-zinc-600 text-white backdrop-blur-sm rounded-xl transition-all duration-200 gap-2"
        >
          <Link href="/screener">
            <Plus size={15} />
            New Scan
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const t0 = Date.now();
  console.log(`[TIMING] dashboard: start`);

  const tAuth = Date.now();
  const { userId } = await auth();
  console.log(`[TIMING] dashboard: auth() => ${Date.now() - tAuth}ms`);

  if (!userId) {
    console.log(`[TIMING] dashboard: unauthenticated — total => ${Date.now() - t0}ms`);
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <AuthWall />
      </div>
    );
  }

  const tHistory = Date.now();
  const scans = await getScanHistory(userId);
  console.log(`[TIMING] dashboard: getScanHistory (${scans.length} rows) => ${Date.now() - tHistory}ms`);
  console.log(`[TIMING] dashboard: total => ${Date.now() - t0}ms`);

  const statsScans = scans;
  const chartScans = scans.slice(0, 10);
  const tableScans = scans.slice(0, 20);

  if (scans.length === 0) {
    return (
      <main className="bg-black min-h-screen">
        <style>{ANIMATIONS}</style>
        <PageHeader scans={[]} />
        <div className="dash-animate-1">
          <EmptyDashboard />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-black min-h-screen">
      <style>{ANIMATIONS}</style>
      <PageHeader scans={scans} />

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
        <div className="dash-animate-1">
          <DashboardStats scans={statsScans} />
        </div>

        <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-all duration-300 dash-animate-2">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          <h2 className="text-white font-semibold text-base mb-1">
            Score Trend
          </h2>
          <p className="text-zinc-500 text-xs mb-6">
            Legacy vs Modern scores across your last {chartScans.length} scan
            {chartScans.length === 1 ? "" : "s"}
          </p>
          <ScoreTrendChart scans={chartScans} />
        </section>

        <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-all duration-300 dash-animate-3">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
          <h2 className="text-white font-semibold text-base mb-1">
            Scan History
          </h2>
          <p className="text-zinc-500 text-xs mb-6">
            Your last {tableScans.length} scan
            {tableScans.length === 1 ? "" : "s"}, most recent first.
          </p>
          <ScanHistoryTable scans={tableScans} />
        </section>
      </div>
    </main>
  );
}