import { auth } from "@clerk/nextjs/server";
import { getScanHistory } from "@/actions/get-dashboard-data";
import type { ScanRecord } from "@/types/ats";
import { AuthWall } from "@/components/dashboard/AuthWall";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { ScanHistoryTable } from "@/components/dashboard/ScanHistoryTable";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <AuthWall />
      </div>
    );
  }

  const scans = await getScanHistory(userId);

  return (
    <main className="bg-black min-h-screen">
      <div className="border-b border-zinc-800/60 bg-zinc-950/80">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-white">Your Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Track your resume scores and improvement over time.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-base mb-1">Score Trend</h2>
          <p className="text-zinc-500 text-xs mb-6">
            Legacy vs Modern scores across your last {scans.length} scan
            {scans.length === 1 ? "" : "s"}
          </p>
          <ScoreTrendChart scans={scans} />
        </section>

        <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-base mb-1">Scan History</h2>
          <p className="text-zinc-500 text-xs mb-6">
            Your last {scans.length} scan{scans.length === 1 ? "" : "s"},
            most recent first.
          </p>
          <ScanHistoryTable scans={scans} />
        </section>
      </div>
    </main>
  );
}