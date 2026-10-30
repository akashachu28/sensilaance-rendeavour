import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader } from "../Panel";
import { ALERTS, SEV_STYLE } from "@/app/lib/data";

const EDGE: Record<string, string> = { Critical: "border-l-red-600", High: "border-l-amber-500", Medium: "border-l-sky-500" };

export default function AlertsCard({ zone }: { zone: string }) {
  const alerts = ALERTS.filter((a) => zone === "All zones" || a.zone === zone);
  return (
    <Panel className="h-full">
      <PanelHeader title="Active Alerts" sub="Open now · repeated detections grouped into one alert"
        right={<Link href="/alerts" className="shrink-0 text-xs font-medium text-gray-900 hover:underline">View all alerts</Link>} />
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-gray-600"><Inbox className="h-6 w-6" />No active alerts in this zone.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {alerts.map((a) => (
            <li key={a.id}>
              <Link href={`/alerts/${a.id}`} className={`flex items-start gap-3 border-l-[3px] px-4 py-3 transition-colors hover:bg-gray-50 ${EDGE[a.sev]}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className={SEV_STYLE[a.sev]}>{a.sev}</Badge><span className="text-sm font-medium text-gray-900">{a.zone}</span></div>
                  <p className="mt-1 text-sm text-gray-900">{a.text}</p>
                  <p className="mt-0.5 text-xs text-gray-600">{a.id} · {a.time} IST · <span className={a.state === "Unacknowledged" ? "font-medium text-red-700" : ""}>{a.state}</span></p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}   