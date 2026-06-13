import { auth } from "@clerk/nextjs/server";
import { getDashboardStats, getLastScan } from "@/actions/get-dashboard-data";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveCounters } from "@/components/home/LiveCounters";
import { HowItWorks } from "@/components/home/HowItWorks";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    const [stats, lastScan] = await Promise.all([
      getDashboardStats(),
      getLastScan(userId),
    ]);

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

  const stats = await getDashboardStats();

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