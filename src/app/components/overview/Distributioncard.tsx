"use client";
import { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Panel, PanelHeader } from "../Panel";
import { C, fmt, pct } from "@/app/lib/data";
import type { StatsData } from "@/lib/api";

export default function DistributionCard({ stats }: { stats: StatsData | null }) {
  const [activeIdx, setActiveIdx] = useState<number | undefined>(undefined);

  const fullGear = stats?.full_gear ?? 0;
  const halfGear = stats?.half_gear ?? 0;
  const noPPE    = stats?.no_ppe ?? 0;
  const valid    = fullGear + halfGear + noPPE;
  const hasData  = valid > 0;

  const SEG = [
    { name: "Fully compliant",     n: fullGear, def: "All 3 items detected",           c: C.green   },
    { name: "Partially compliant", n: halfGear, def: "Exactly 2 detected (1 missing)",  c: "#F59E0B" },
    { name: "Non-compliant",       n: noPPE,    def: "0 or 1 detected (2–3 missing)",   c: "#DC2626" },
  ];

  const active      = activeIdx !== undefined ? SEG[activeIdx] : SEG[0];
  const centerPct   = pct(active.n, valid).toFixed(1);
  const centerLabel = activeIdx === 1 ? "Partial-compliant" : activeIdx === 2 ? "Non-compliant" : "Fully-compliant";

  const config = Object.fromEntries(
    SEG.map((s) => [s.name, { label: s.name, color: s.c }])
  ) as ChartConfig;

  return (
    <Panel className="h-full">
      <PanelHeader
        title="Compliance Distribution"
        sub={hasData ? `${fmt(valid)} valid assessments · site-wide` : "No data for this period"}
      />
      {!hasData ? (
        <div className="flex flex-col items-center justify-center gap-2 p-10 text-sm text-gray-500">
          <span className="text-2xl">—</span>
          <span>No assessment data available</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row lg:flex-col xl:flex-row">
          {/* Donut chart wrapper — label sits below SVG in z-order */}
          <div className="relative h-[180px] w-[180px] shrink-0">
            {/* Center label: z-0 keeps it behind the SVG (z-auto / higher) */}
            <div
              className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center gap-0.5"
              aria-hidden
            >
              <span
                className="text-3xl font-bold tabular-nums leading-none text-[#12343B]"
              >
                {centerPct}%
              </span>
              <span className="text-[9px] font-medium uppercase tracking-widest text-gray-500 transition-all duration-150">
                {centerLabel}
              </span>
            </div>

            {/* SVG chart: z-10 sits above the label div */}
            <div className="relative z-10 h-full w-full">
              <ChartContainer config={config} className="h-full w-full aspect-square">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                  <Pie
                    data={SEG}
                    dataKey="n"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={86}
                    paddingAngle={2}
                    strokeWidth={0}
                    isAnimationActive={false}
                    onMouseEnter={(_, idx) => setActiveIdx(idx)}
                    onMouseLeave={() => setActiveIdx(undefined)}
                  >
                    {SEG.map((s) => (
                      <Cell key={s.name} fill={s.c} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </div>

          <ul className="w-full space-y-3.5">
            {SEG.map((s, i) => (
              <li
                key={s.name}
                className="flex items-start gap-3 text-sm transition-opacity duration-150"
                style={{ opacity: activeIdx !== undefined && i !== activeIdx ? 0.4 : 1 }}
              >
                <span className="mt-1.5 h-3 w-3 shrink-0 rounded" style={{ background: s.c }} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold leading-tight text-[#12343B]">{s.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.def}</div>
                </div>
                <div className="text-right tabular-nums shrink-0">
                  <div className="text-lg font-bold text-[#12343B]">{pct(s.n, valid).toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">{fmt(s.n)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
