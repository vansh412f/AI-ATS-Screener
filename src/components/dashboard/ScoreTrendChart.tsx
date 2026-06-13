"use client";

import type { ScanRecord } from "@/types/ats";
import { BarChart3 } from "lucide-react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ScoreTrendChartProps {
  scans: ScanRecord[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-xl">
      <p className="text-zinc-400 text-xs mb-2">{payload[0].payload.date}</p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-zinc-300 text-xs">Legacy:</span>
          <span className="text-orange-500 font-bold text-xs">
            {payload[0].value}
          </span>
        </div>
        <div className="w-px h-3 bg-zinc-700" />
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-zinc-300 text-xs">Modern:</span>
          <span className="text-indigo-400 font-bold text-xs">
            {payload[1].value}
          </span>
        </div>
      </div>
    </div>
  );
}

function CustomLegend() {
  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-orange-500" />
        <span className="text-zinc-400 text-xs">Legacy Engine</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-indigo-400" />
        <span className="text-zinc-400 text-xs">Modern Engine</span>
      </div>
    </div>
  );
}

export function ScoreTrendChart({ scans }: ScoreTrendChartProps) {
  if (scans.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center h-[300px]">
        <BarChart3 size={32} className="text-zinc-700" />
        <p className="text-zinc-500 text-sm">
          Run at least 2 scans to see your score trend.
        </p>
      </div>
    );
  }

  const chartData = [...scans]
    .reverse()
    .map((scan) => ({
      date: new Date(scan.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      legacy: scan.legacyScore,
      modern: scan.modernScore,
    }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="legacyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="modernGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            stroke="#52525b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#52525b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Area
            type="monotone"
            dataKey="legacy"
            fill="url(#legacyGradient)"
            stroke="none"
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="modern"
            fill="url(#modernGradient)"
            stroke="none"
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="legacy"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: "#f97316", r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="modern"
            stroke="#818cf8"
            strokeWidth={2}
            dot={{ fill: "#818cf8", r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}