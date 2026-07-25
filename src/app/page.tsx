import { auth } from "@clerk/nextjs/server";
import { getDashboardStats, getLastScan } from "@/actions/get-dashboard-data";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveCounters } from "@/components/home/LiveCounters";
import { HowItWorks } from "@/components/home/HowItWorks";

export default async function HomePage() {
  const t0 = Date.now();
  console.log(`[TIMING] homepage: start`);

  const tAuth = Date.now();
  const { userId } = await auth();
  console.log(`[TIMING] homepage: auth() => ${Date.now() - tAuth}ms`);

  if (userId) {
    const tData = Date.now();
    const [stats, lastScan] = await Promise.all([
      getDashboardStats(),
      getLastScan(userId),
    ]);
    console.log(`[TIMING] homepage: getDashboardStats + getLastScan (parallel) => ${Date.now() - tData}ms`);
    console.log(`[TIMING] homepage: total (signed-in path) => ${Date.now() - t0}ms`);

    return (
      <main className="bg-black min-h-screen">
        <HeroSection />
        <LiveCounters
          totalScans={stats.totalScans}
          totalUsers={stats.totalUsers}
          lastScan={lastScan}
        />
        <HowItWorks />
      </main>
    );
  }

  const tStats = Date.now();
  const stats = await getDashboardStats();
  console.log(`[TIMING] homepage: getDashboardStats (signed-out path) => ${Date.now() - tStats}ms`);
  console.log(`[TIMING] homepage: total (signed-out path) => ${Date.now() - t0}ms`);

  return (
    <main className="bg-black min-h-screen">
      <HeroSection />
      <LiveCounters
        totalScans={stats.totalScans}
        totalUsers={stats.totalUsers}
        lastScan={null}
      />
      <HowItWorks />
    </main>
  );
}