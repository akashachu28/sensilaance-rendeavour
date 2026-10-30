"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Panel, PanelHeader, Meter } from "../Panel";
import { STATUS_STYLE, ZONE_RULES, zoneStatus, pct, fmt, rateColor, type Status, type Zone } from "@/app/lib/data";

type Key = "risk" | "rate" | "assess" | "viol" | "crit";
const RANK: Record<Status, number> = { Critical: 0, Unknown: 1, Warning: 2, Good: 3 };
const DOT: Record<Status, string> = { Critical: "bg-red-600", Warning: "bg-amber-500", Good: "bg-[#D3A966]", Unknown: "bg-gray-400" };
const risk = (z: Zone) => RANK[zoneStatus(z)] * 1000 + pct(z.full, z.assess);

export default function ZoneTable({ zones, scale }: { zones: Zone[]; scale: number }) {
  const router = useRouter();
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "risk", dir: 1 });
  const rows = useMemo(() => {
    const val = (z: Zone) => (sort.key === "risk" ? risk(z) : sort.key === "rate" ? z.full / z.assess : z[sort.key as "assess" | "viol" | "crit"]);
    return [...zones].sort((a, b) => (val(a) - val(b)) * sort.dir);
  }, [zones, sort]);
  const top = [...zones].sort((a, b) => risk(a) - risk(b))[0];
  const head = (k: Key, label: string) => (
    <button className="inline-flex items-center gap-1.5 font-medium text-gray-600 hover:text-[#12343B] transition-colors" onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : k === "rate" || k === "risk" ? 1 : -1 }))}>
      {label}<ArrowUpDown className={`h-3.5 w-3.5 ${sort.key === k ? "text-[#12343B]" : "opacity-40"}`} />
    </button>
  );
  const H = "bg-[#12343B]/[0.02] text-xs font-medium text-gray-600 uppercase tracking-wide";
  return (
    <Panel>
      <PanelHeader title="Zone Safety Overview"
        sub={top ? `Highest risk now: ${top.id} (${pct(top.full, top.assess).toFixed(1)}% full compliance, ${top.crit} critical alerts). Status also weighs alerts and camera health.` : undefined} />
      <Table className="min-w-[920px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-gray-100">
            <TableHead className={`${H} pl-5`}>{head("risk", "Zone")}</TableHead><TableHead className={H}>{head("rate", "Full compliance")}</TableHead>
            <TableHead className={H}>{head("assess", "Person assessments")}</TableHead><TableHead className={H}>{head("viol", "Violation events")}</TableHead>
            <TableHead className={H}>{head("crit", "Active critical")}</TableHead><TableHead className={H}>Cameras</TableHead>
            <TableHead className={H}>Last violation</TableHead><TableHead className={`${H} pr-5`}>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((z) => {
            const st = zoneStatus(z), r = pct(z.full, z.assess), gap = z.on < z.total;
            return (
              <TableRow key={z.id} tabIndex={0} className="cursor-pointer hover:bg-[#12343B]/[0.01] border-b border-gray-50 transition-colors" onClick={() => router.push(`/zones/${encodeURIComponent(z.id)}`)}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/zones/${encodeURIComponent(z.id)}`)}>
                <TableCell className="py-4 pl-5">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${DOT[st]} shadow-sm`} />
                    <div>
                      <div className="font-semibold text-[#12343B]">{z.id}</div>
                      <div className="text-xs text-gray-500">{z.hazard} hazard</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {st === "Unknown" ? <span className="text-gray-500">Incomplete data ({r.toFixed(1)}%)</span> : 
                  <div className="flex items-center gap-3">
                    <div className="w-24"><Meter value={r} color={rateColor(r) === '#10b981' ? '#D3A966' : rateColor(r)} className="h-1.5" /></div>
                    <span className="tabular-nums font-medium text-[#12343B]">{r.toFixed(1)}%</span>
                  </div>}
                </TableCell>
                <TableCell className="tabular-nums text-gray-700">{fmt(z.assess * scale)}</TableCell>
                <TableCell className="tabular-nums text-gray-700">{fmt(z.viol * scale)}</TableCell>
                <TableCell className="tabular-nums">{z.crit > 0 ? <Badge variant="outline" className={STATUS_STYLE.Critical}>{z.crit}</Badge> : <span className="text-gray-500">0</span>}</TableCell>
                <TableCell className={`tabular-nums ${gap ? "font-semibold text-amber-700" : "text-gray-700"}`}>{z.on}/{z.total}{gap && <span className="ml-1 text-xs">gap</span>}</TableCell>
                <TableCell className="tabular-nums text-gray-500 text-xs">{z.last} IST</TableCell>
                <TableCell className="pr-5">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline" className={STATUS_STYLE[st]}>{st === "Unknown" ? "Unknown · monitoring gap" : st}</Badge>
                    <ChevronRight className="h-4 w-4 text-gray-400 opacity-60 group-hover:text-[#D3A966] group-hover:opacity-100 transition-all" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <p className="border-t border-gray-100 bg-gray-50/50 px-5 py-3 text-xs text-gray-600">
        <span className="font-medium text-gray-700">Sample thresholds (configurable):</span> Good at {ZONE_RULES.goodAtLeast}%+ with no critical alerts · Critical below {ZONE_RULES.criticalBelow}% or {ZONE_RULES.criticalAlerts}+ critical alerts · Unknown when under half of cameras are online. Sorted by risk by default.
      </p>
    </Panel>
  );
}