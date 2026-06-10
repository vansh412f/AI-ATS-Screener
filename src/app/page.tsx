import { HeroSection } from "@/components/home/HeroSection";
import { LiveCounters } from "@/components/home/LiveCounters";
import { HowItWorks } from "@/components/home/HowItWorks";
import type { ScanRecord } from "@/types/ats";

const MOCK_LAST_SCAN: ScanRecord = {
  id: "mock-1",
  jobTitle: "Senior Frontend Engineer",
  legacyScore: 68,
  modernScore: 84,
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
};

const MOCK_STATS = {
  totalUsers: 1247,
  totalScans: 4832,
};

export default function HomePage() {
  return (
    <main className="bg-black min-h-screen">
      <HeroSection />
      <LiveCounters
        totalScans={MOCK_STATS.totalScans}
        totalUsers={MOCK_STATS.totalUsers}
        lastScan={MOCK_LAST_SCAN}
      />
      <HowItWorks />
    </main>
  );
}