"use client";
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader } from "../Panel";
import { C, TARGET, TREND, fmt } from "@/app/lib/data";

type Pt = { l: string; v: number; n: number };
const config = {
  v: { label: "Full compliance", color: "#D3A966" },
  n: { label: "Valid assessments", color: "#3F2042" },
} satisfies ChartConfig;

function Tip({ active, payload }: { active?: boolean; payload?: { payload: Pt }[] }) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  return (
    <div className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-semibold text-gray-900">{d.l}</div>
      <div className="flex justify-between gap-6"><span className="text-gray-600">Full compliance</span><b className="tabular-nums text-gray-900">{d.v}%</b></div>
      <div className="flex justify-between gap-6"><span className="text-gray-600">Valid assessments</span><span className="tabular-nums text-gray-900">{fmt(d.n)}</span></div>
      <div className="flex justify-between gap-6"><span className="text-gray-600">Not fully compliant</span><span className="tabular-nums text-gray-900">{fmt(d.n * (1 - d.v / 100))}</span></div>
    </div>
  );
}

export default function TrendCard({ range }: { range: string }) {
  const grain = range === "today" ? "hourly" : range === "7d" ? "daily" : range === "custom" ? "weekly" : "short intervals";
  return (
    <Panel className="h-full">
      <PanelHeader title="Full Compliance Trend" sub={`Each ${grain} point uses only that interval's assessments. Bars show assessment volume.`}
        right={<Badge variant="outline" className="shrink-0 border-[#D3A966]/30 bg-[#D3A966]/5 text-[#12343B]">Target {TARGET}%</Badge>} />
      <div className="p-4 pb-2">
        <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
          <ComposedChart data={TREND[range]} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="l" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis yAxisId="v" domain={[60, 100]} ticks={[60, 70, 80, 90, 100]} tickFormatter={(t) => `${t}%`} tickLine={false} axisLine={false} width={44} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis yAxisId="n" orientation="right" hide domain={[0, (max: number) => max * 3.2]} />
            <ChartTooltip cursor={{ fill: "rgba(100,116,139,0.08)" }} content={<Tip />} />
            <Bar yAxisId="n" dataKey="n" fill="var(--color-n)" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <ReferenceLine yAxisId="v" y={TARGET} stroke="#D3A966" strokeDasharray="5 4" strokeWidth={1.5} />
            <Line yAxisId="v" dataKey="v" type="monotone" stroke="var(--color-v)" strokeWidth={2.5} dot={{ r: 3, fill: "#fff", strokeWidth: 2, stroke: "#D3A966" }} activeDot={{ r: 5, fill: "#D3A966" }} />
          </ComposedChart>
        </ChartContainer>
      </div>
    </Panel>
  );
}