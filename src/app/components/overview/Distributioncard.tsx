"use client";
import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Panel, PanelHeader } from "../Panel";
import { C, fmt, pct } from "@/app/lib/data";
import type { StatsData } from "@/lib/api";

export default function DistributionCard({ stats }: { stats: StatsData | null }) {
  // Use API data if available, otherwise use default values
  const fullGear = stats?.full_gear || 0;
  const halfGear = stats?.half_gear || 0;
  const noPPE = stats?.no_ppe || 0;
  
  const SEG = [
    { name: "Fully compliant", n: fullGear, def: "All 3 items detected", c: C.green },
    { name: "Partially compliant", n: halfGear, def: "Exactly 2 detected (1 missing)", c: "#F59E0B" },
    { name: "Non-compliant", n: noPPE, def: "0 or 1 detected (2-3 missing)", c: "#DC2626" },
  ];
  
  const config = Object.fromEntries(SEG.map((s) => [s.name, { label: s.name, color: s.c }])) as ChartConfig;
  const valid = fullGear + halfGear + noPPE;
  return (
    <Panel className="h-full">
      <PanelHeader title="Compliance Distribution" sub={`${fmt(valid)} valid assessments · site-wide`} />
      <div className="flex flex-col items-center gap-6 p-6 sm:flex-row lg:flex-col xl:flex-row">
        <div className="relative h-[180px] w-[180px] shrink-0">
          <ChartContainer config={config} className="h-full w-full aspect-square">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
              <Pie data={SEG} dataKey="n" nameKey="name" innerRadius={60} outerRadius={86} paddingAngle={2} strokeWidth={0}>
                {SEG.map((s) => <Cell key={s.name} fill={s.c} />)}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-[#12343B]">{valid > 0 ? pct(fullGear, valid).toFixed(1) : '0.0'}%</span>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Fully compliant</span>
          </div>
        </div>
        <ul className="w-full space-y-3.5">
          {SEG.map((s) => (
            <li key={s.name} className="flex items-start gap-3 text-sm">
              <span className="mt-1.5 h-3 w-3 shrink-0 rounded" style={{ background: s.c }} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold leading-tight text-[#12343B]">{s.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.def}</div>
              </div>
              <div className="text-right tabular-nums shrink-0">
                <div className="text-lg font-bold text-[#12343B]">{valid > 0 ? pct(s.n, valid).toFixed(1) : '0.0'}%</div>
                <div className="text-xs text-gray-500">{fmt(s.n)}</div>
              </div>
            </li>
          ))}
          <li className="flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs">
            <span className="h-2.5 w-2.5 rounded bg-gray-400" />
            <span className="text-gray-600">
              <span className="font-medium text-gray-700">Needs review:</span> 0 in this window
            </span>
          </li>
        </ul>
      </div>
    </Panel>
  );
}