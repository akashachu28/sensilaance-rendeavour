"use client";
import { useState, useEffect } from "react";
import { Footprints, HardHat, Shirt, Inbox } from "lucide-react";
import { fmt, rateColor } from "@/app/lib/data";
import { getStatsDetections, type DetectionsData } from "@/lib/api";
import { Panel, PanelHeader, Meter } from "../Panel";

interface PpeItem {
  id: string;
  name: string;
  icon: typeof HardHat;
  detected: number;
  missing: number;
  total: number;
  pct: number;
}

export default function PpeItemCard({
  onSelect,
  camera,
  range,
  customDateFrom,
  customDateTo,
}: {
  onSelect: (item: string) => void;
  camera: string;
  range: string;
  customDateFrom?: string;
  customDateTo?: string;
}) {
  const [items, setItems] = useState<PpeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getDateRange = () => {
    const today = new Date();
    const toISO = (d: Date) => d.toISOString().split("T")[0];
    if (range === "custom" && customDateFrom && customDateTo)
      return { startDate: customDateFrom, endDate: customDateTo };
    if (range === "7d") {
      const d = new Date(today);
      d.setDate(today.getDate() - 7);
      return { startDate: toISO(d), endDate: toISO(today) };
    }
    if (range === "30d") {
      const d = new Date(today);
      d.setDate(today.getDate() - 30);
      return { startDate: toISO(d), endDate: toISO(today) };
    }
    return { startDate: toISO(today), endDate: toISO(today) };
  };

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        setLoading(true);
        const { startDate, endDate } = getDateRange();

        const params: { start_date: string; end_date: string; camera_id?: number } = {
          start_date: startDate,
          end_date: endDate,
        };

        if (camera && camera !== "All Cameras") {
          const idMatch = camera.match(/(\d+)/);
          if (idMatch) {
            const id = parseInt(idMatch[1]);
            if (!isNaN(id) && id >= 0) params.camera_id = id;
          }
        }

        const data: DetectionsData = await getStatsDetections(params);
        const total = data.total_logs_evaluated;

        if (!total) {
          setItems([]);
          setLoading(false);
          return;
        }

        const makePct = (n: number) => Math.round((n / total) * 1000) / 10;
        const vestDetected = data.vest_detected ?? data.reflector_detected ?? 0;

        const sorted: PpeItem[] = [
          {
            id: "helmet",
            name: "Hard Hat / Helmet",
            icon: HardHat,
            detected: data.helmet_detected,
            missing: total - data.helmet_detected,
            total,
            pct: makePct(data.helmet_detected),
          },
          {
            id: "vest",
            name: "Safety Vest",
            icon: Shirt,
            detected: vestDetected,
            missing: total - vestDetected,
            total,
            pct: makePct(vestDetected),
          },
          {
            id: "boots",
            name: "Safety Boots",
            icon: Footprints,
            detected: data.boot_detected,
            missing: total - data.boot_detected,
            total,
            pct: makePct(data.boot_detected),
          },
        ].sort((a, b) => a.pct - b.pct);

        setItems(sorted);
      } catch (error) {
        console.error("Failed to fetch PPE detections:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDetections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, range, customDateFrom, customDateTo]);

  return (
    <Panel className="h-full">
      <PanelHeader
        title="Compliance by PPE Item"
        sub={
          loading
            ? "Loading…"
            : items.length === 0
            ? "No data for this period"
            : "Sorted by lowest compliance"
        }
        // right={
        //   <button
        //     onClick={() => onSelect("Any missing item")}
        //     className="shrink-0 text-xs font-semibold text-gray-500 transition-colors hover:text-[#7B1D4E] whitespace-nowrap"
        //   >
        //     View Details →
        //   </button>
        // }
      />

      {loading ? (
        <div className="flex flex-1 items-center justify-center p-10 text-sm text-gray-400">
          Loading PPE data…
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-sm text-gray-400">
          <Inbox className="h-6 w-6 text-gray-300" />
          <span>No PPE data for this period</span>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((it) => {
            const color = rateColor(it.pct);

            // Subtle tinted background per compliance tier
            const tileBg =
              it.pct >= 90
                ? "hover:bg-green-50/50"
                : it.pct >= 75
                ? "hover:bg-amber-50/50"
                : "hover:bg-red-50/50";

            return (
              <li key={it.id}>
                <button
                  onClick={() => onSelect(it.name)}
                  className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors focus-visible:outline-none ${tileBg}`}
                >
                  {/* Icon badge — background tinted to match compliance color */}
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-opacity group-hover:opacity-90"
                    style={{ backgroundColor: `${color}18` }} /* ~10% opacity fill */
                  >
                    <it.icon className="h-5 w-5" style={{ color }} strokeWidth={1.5} />
                  </span>

                  {/* Label + sub + bar */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <span className="text-sm font-semibold text-gray-900 leading-tight">
                      {it.name}
                    </span>
                    <div className="text-xs text-gray-500">
                      {fmt(it.detected)} detected · {fmt(it.total)} total assessments
                    </div>
                    <Meter value={it.pct} color={color} className="h-2" />
                  </div>

                  {/* % value — right-aligned, colored by compliance */}
                  <div className="shrink-0 text-right">
                    <div
                      className="text-2xl font-bold tabular-nums leading-none"
                      style={{ color }}
                    >
                      {it.pct}%
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-400">compliance</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Colour legend */}
      {!loading && items.length > 0 && (
        <div className="flex items-center gap-4 border-t border-gray-100 px-5 py-2.5 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#168A4A]" />
            ≥ 90% Good
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#C77700]" />
            75–89% Warning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#D92D20]" />
            &lt; 75% Critical
          </span>
        </div>
      )}
    </Panel>
  );
}
