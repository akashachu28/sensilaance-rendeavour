import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Camera, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Panel } from "../Panel";
import { TARGET, STATUS_STYLE } from "@/app/lib/data";

type Tone = "green" | "amber" | "red" | "neutral";
export type Kpi = { label: string; value: string; sub: string; icon: LucideIcon; tone: Tone; gauge?: number };
const TONE: Record<Tone, { chip: string; val: string; bar: string }> = {
  green: { chip: "bg-[#12343B]/5 text-[#12343B]", val: "text-[#12343B]", bar: "bg-green-600" },
  amber: { chip: "bg-green-600/10 text-[#12343B]", val: "text-[#12343B]", bar: "bg-green-600" },
  red: { chip: "bg-red-50 text-red-700", val: "text-red-700", bar: "bg-red-600" },
  neutral: { chip: "bg-gray-100 text-gray-600", val: "text-[#12343B]", bar: "bg-gray-400" },
};

export function KpiGrid({ kpis, loading }: { kpis: Kpi[]; loading: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k) => {
        const t = TONE[k.tone];
        return (
          <Panel key={k.label} className="p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-600">{k.label}</span>
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${t.chip}`}><k.icon className="h-5 w-5" /></span>
            </div>
            {loading ? <><Skeleton className="mt-3 h-8 w-28" /><Skeleton className="mt-3 h-3 w-full" /></> : (
              <>
                <div className={`mt-3 text-3xl font-semibold tabular-nums tracking-tight ${t.val}`}>{k.value}</div>
                {k.gauge !== undefined && (
                  <div className="relative mt-3 h-2 rounded-full bg-gray-200" role="img" aria-label={`${k.gauge.toFixed(1)}% against target ${TARGET}%`}>
                    <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${k.gauge}%` }} />
                    <div className="absolute -top-1 h-4 w-0.5 rounded bg-gray-400" style={{ left: `${TARGET}%` }} />
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-600">{k.sub}</p>
              </>
            )}
          </Panel>
        );
      })}
    </div>
  );
}

export function CameraHealthCard({ online, total, stale }: { online: number; total: number; stale: number }) {
  const offline = total - online;
  const cams = Array.from({ length: total }, (_, i) => (i < online - stale ? "ok" : i < online ? "stale" : "off"));
  const dot = { ok: "bg-green-600", stale: "bg-amber-500", off: "bg-red-600" } as const;
  return (
    <Panel className="p-5 relative overflow-hidden bg-gradient-to-br from-[#12343B]/[0.02] via-white to-[#D3A966]/[0.03]">
      <Link href="/cameras" className="group block rounded-md focus-visible:outline-2 focus-visible:outline-ring">
        <div className="relative z-10">
          <div className="flex items-center justify-between text-sm font-medium text-gray-700">
            <span className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#12343B]/5">
                <Camera className="h-5 w-5 text-[#12343B]" />
              </span>
              Camera Health
            </span>
            <div className={`h-2 w-2 rounded-full ${online === total ? 'bg-[#D3A966]' : offline > 0 ? 'bg-red-500' : 'bg-amber-500'} animate-pulse`} />
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-semibold tabular-nums text-[#12343B]">{online} <span className="text-xl text-gray-400">/</span> {total}<span className="ml-2 text-sm font-normal text-gray-600">online</span></span>
            {offline > 0 && <Badge variant="outline" className={STATUS_STYLE.Critical}>{offline} offline</Badge>}
            {stale > 0 && <Badge variant="outline" className={STATUS_STYLE.Warning}>{stale} stale</Badge>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1" aria-hidden>{cams.map((c, i) => <span key={i} className={`h-2.5 w-5 rounded-sm ${dot[c as keyof typeof dot]}`} />)}</div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D3A966]" />
              Last frame 15:10:22 IST
            </span>
            <span>AI latency 340 ms</span>
            {offline > 0 && <span className="text-amber-700 font-medium">⚠ Offline zones show as Unknown</span>}
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-[#12343B] group-hover:text-[#D3A966] transition-colors">
            Open camera monitoring 
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </Panel>
  );
}

export function ResolvedCard({ value, rangeText }: { value: string; rangeText: string }) {
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between text-sm font-medium text-gray-600">Alerts Resolved<CheckCircle2 className="h-4 w-4 text-[#D3A966]" /></div>
      <div className="mt-2 text-3xl font-semibold tabular-nums text-[#12343B]">{value}</div>
      <p className="mt-2 text-xs text-gray-600">Resolved {rangeText}. Previous-period comparison not available yet.</p>
    </Panel>
  );
}