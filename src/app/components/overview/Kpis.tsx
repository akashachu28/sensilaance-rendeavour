import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Camera, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Panel } from "../Panel";
import { TARGET, STATUS_STYLE } from "@/app/lib/data";

type Tone = "green" | "amber" | "red" | "neutral";
export type Kpi = { label: string; value: string; sub: string; icon: LucideIcon; tone: Tone; gauge?: number; showTarget?: boolean };

const TONE: Record<Tone, {
  bg: string; iconBg: string; iconColor: string; val: string; bar: string; badge: string;
}> = {
  green:   { bg: "from-green-50/60 to-white",  iconBg: "bg-green-100",  iconColor: "text-green-700",  val: "text-green-700",  bar: "bg-green-500",  badge: "bg-green-100 text-green-700 border-green-200" },
  amber:   { bg: "from-amber-50/60 to-white",  iconBg: "bg-amber-100",  iconColor: "text-amber-700",  val: "text-amber-700",  bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-700 border-amber-200" },
  red:     { bg: "from-red-50/60 to-white",    iconBg: "bg-red-100",    iconColor: "text-red-600",    val: "text-red-600",    bar: "bg-red-500",    badge: "bg-red-100 text-red-600 border-red-200" },
  neutral: { bg: "from-gray-50/80 to-white",   iconBg: "bg-gray-100",   iconColor: "text-gray-600",   val: "text-[#12343B]",  bar: "bg-gray-400",   badge: "bg-gray-100 text-gray-600 border-gray-200" },
};

export function KpiGrid({ kpis, loading }: { kpis: Kpi[]; loading: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k) => {
        const t = TONE[k.tone];
        return (
          <Panel key={k.label} className={`relative flex flex-col overflow-hidden p-0 bg-linear-to-br ${t.bg}`}>
            <div className="flex flex-1 flex-col justify-between p-5 min-h-44">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.iconBg}`}>
                  <k.icon className={`h-5 w-5 ${t.iconColor}`} />
                </div>
                <span className="text-right text-xs font-medium leading-tight text-gray-500">{k.label}</span>
              </div>

              {/* Value + bar + sub — always rendered, bar row reserved even when absent */}
              {loading ? (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <div className={`text-4xl font-bold tabular-nums tracking-tight ${t.val}`}>
                    {k.value}
                  </div>

                  {/* Always reserve the same vertical space for gauge row */}
                  <div className="space-y-1.5">
                    {k.gauge !== undefined ? (
                      <>
                        <div
                          className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200"
                          role="img"
                          aria-label={`${k.gauge.toFixed(1)}%${k.showTarget !== false ? ` — target ${TARGET}%` : ''}`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${t.bar}`}
                            style={{ width: `${Math.min(k.gauge, 100)}%` }}
                          />
                          {k.showTarget !== false && (
                            <div
                              className="absolute top-0 h-full w-0.5 bg-gray-500/60"
                              style={{ left: `${TARGET}%` }}
                            />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>0%</span>
                          {k.showTarget !== false && <span>Target {TARGET}%</span>}
                          <span>100%</span>
                        </div>
                      </>
                    ) : (
                      /* Invisible placeholder keeps height consistent */
                      <div className="h-2 w-full" aria-hidden />
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-gray-500">{k.sub}</p>
                </div>
              )}
            </div>

            {/* Bottom accent line — always at card bottom via mt-auto */}
            <div className={`mt-auto h-1 w-full ${t.bar} opacity-60`} />
          </Panel>
        );
      })}
    </div>
  );
}

export function CameraHealthCard({ online, total, stale }: { online: number; total: number; stale: number }) {
  const offline = total - online;
  const cams = Array.from({ length: total }, (_, i) =>
    i < online - stale ? "ok" : i < online ? "stale" : "off"
  );
  const dot = { ok: "bg-green-500", stale: "bg-amber-400", off: "bg-red-500" } as const;

  return (
    <Panel className="p-5 relative overflow-hidden">
      <Link href="/cameras" className="group block rounded-md focus-visible:outline-2 focus-visible:outline-ring">
        <div className="flex items-center justify-between text-sm font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#12343B]/5">
              <Camera className="h-5 w-5 text-[#12343B]" />
            </span>
            Camera Health
          </span>
          <div className={`h-2 w-2 rounded-full ${online === total ? "bg-green-500" : offline > 0 ? "bg-red-500" : "bg-amber-400"} animate-pulse`} />
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-bold tabular-nums text-[#12343B]">
            {online} <span className="text-xl text-gray-400">/</span> {total}
            <span className="ml-2 text-sm font-normal text-gray-500">online</span>
          </span>
          {offline > 0 && <Badge variant="outline" className={STATUS_STYLE.Critical}>{offline} offline</Badge>}
          {stale > 0 && <Badge variant="outline" className={STATUS_STYLE.Warning}>{stale} stale</Badge>}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5" aria-hidden>
          {cams.map((c, i) => (
            <span key={i} className={`h-2.5 w-5 rounded-sm ${dot[c as keyof typeof dot]}`} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D3A966]" />
            Last frame 15:10:22 IST
          </span>
          <span>AI latency 340 ms</span>
          {offline > 0 && <span className="font-medium text-amber-700">⚠ Offline zones show as Unknown</span>}
        </div>
        <div className="mt-3 flex items-center text-xs font-medium text-[#12343B] transition-colors group-hover:text-[#D3A966]">
          Open camera monitoring
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </Panel>
  );
}

export function ResolvedCard({ value, rangeText }: { value: string; rangeText: string }) {
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between text-sm font-medium text-gray-700">
        Alerts Resolved
        <CheckCircle2 className="h-4 w-4 text-[#D3A966]" />
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums text-[#12343B]">{value}</div>
      <p className="mt-2 text-xs text-gray-500">Resolved {rangeText}. Previous-period comparison not available yet.</p>
    </Panel>
  );
}
