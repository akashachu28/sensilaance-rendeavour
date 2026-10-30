"use client";
import { useState, useEffect } from "react";
import { ChevronRight, Footprints, HardHat, Shirt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHeader, Meter } from "../Panel";
import { fmt, rateColor } from "@/app/lib/data";
import { getLogs, type LogEntry } from "@/lib/api";

interface PpeItem {
  id: string;
  name: string;
  icon: typeof HardHat;
  pct: number;
  missing: number;
  total: number;
}

export default function PpeItemCard({ onSelect, camera, range, customDateFrom, customDateTo }: { 
  onSelect: (item: string) => void;
  camera: string;
  range: string;
  customDateFrom?: string;
  customDateTo?: string;
}) {
  const [items, setItems] = useState<PpeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper to calculate date range based on range selection
  const getDateRange = () => {
    const today = new Date();
    let startDate = getTodayDate();
    let endDate = getTodayDate();

    if (range === "custom" && customDateFrom && customDateTo) {
      startDate = customDateFrom;
      endDate = customDateTo;
    } else if (range === "7d") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      startDate = sevenDaysAgo.toISOString().split('T')[0];
    } else if (range === "30d") {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  useEffect(() => {
    const fetchPPEData = async () => {
      try {
        setLoading(true);
        const { startDate, endDate } = getDateRange();
        
        // Build params
        const params: Record<string, string | number> = {
          page: 1,
          // limit: 1000, // Get all records for calculation
          start_date: startDate,
          end_date: endDate,
        };

        // Add camera_id if selected and not "All Cameras"
        if (camera && camera !== "All Cameras") {
          // Try to extract camera_id from camera_name format
          // Camera names from API might be "Camera 0 (Tatu City Site)", "Camera 1", etc.
          const idMatch = camera.match(/(\d+)/);
          if (idMatch) {
            const cameraId = parseInt(idMatch[1]);
            // Explicitly check for valid number (including 0)
            if (!isNaN(cameraId) && cameraId >= 0) {
              params.camera_id = cameraId;
            }
          }
        }

        const response = await getLogs(params);
        
        // Handle empty response
        if (!response || !response.items || response.items.length === 0) {
          setItems([
            {
              id: "helmet",
              name: "Hard Hat / Helmet",
              icon: HardHat,
              pct: 0,
              missing: 0,
              total: 0,
            },
            {
              id: "vest",
              name: "Safety Vest",
              icon: Shirt,
              pct: 0,
              missing: 0,
              total: 0,
            },
            {
              id: "boots",
              name: "Safety Boots",
              icon: Footprints,
              pct: 0,
              missing: 0,
              total: 0,
            },
          ]);
          setLoading(false);
          return;
        }
        
        // Calculate PPE statistics
        let helmetPresent = 0;
        let helmetTotal = 0;
        let vestPresent = 0;
        let vestTotal = 0;
        let bootsPresent = 0;
        let bootsTotal = 0;

        response.items.forEach((log: LogEntry) => {
          const metadata = log.metadata_json;
          
          // Only count items that have PPE detection data (not null/undefined)
          if (metadata && typeof metadata.helmet_present === 'boolean') {
            helmetTotal++;
            if (metadata.helmet_present === true) {
              helmetPresent++;
            }
          }
          
          if (metadata && typeof metadata.vest_present === 'boolean') {
            vestTotal++;
            if (metadata.vest_present === true) {
              vestPresent++;
            }
          }
          
          if (metadata && typeof metadata.boot_present === 'boolean') {
            bootsTotal++;
            if (metadata.boot_present === true) {
              bootsPresent++;
            }
          }
        });

        // Calculate percentages and missing counts
        const helmetPct = helmetTotal > 0 ? (helmetPresent / helmetTotal) * 100 : 0;
        const vestPct = vestTotal > 0 ? (vestPresent / vestTotal) * 100 : 0;
        const bootsPct = bootsTotal > 0 ? (bootsPresent / bootsTotal) * 100 : 0;

        const ppeItems: PpeItem[] = [
          {
            id: "helmet",
            name: "Hard Hat / Helmet",
            icon: HardHat,
            pct: Math.round(helmetPct * 10) / 10,
            missing: helmetTotal - helmetPresent,
            total: helmetTotal,
          },
          {
            id: "vest",
            name: "Safety Vest",
            icon: Shirt,
            pct: Math.round(vestPct * 10) / 10,
            missing: vestTotal - vestPresent,
            total: vestTotal,
          },
          {
            id: "boots",
            name: "Safety Boots",
            icon: Footprints,
            pct: Math.round(bootsPct * 10) / 10,
            missing: bootsTotal - bootsPresent,
            total: bootsTotal,
          },
        ];

        // Sort by lowest compliance (lowest percentage first)
        ppeItems.sort((a, b) => a.pct - b.pct);

        setItems(ppeItems);
      } catch (error) {
        console.error('Failed to fetch PPE data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPPEData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, range, customDateFrom, customDateTo]);
  return (
    <Panel className="h-full">
      <PanelHeader title="Compliance by PPE Item" sub="Sorted by lowest compliance · site-wide" />
      {loading ? (
        <div className="flex items-center justify-center p-10 text-sm text-gray-600">Loading PPE data...</div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center p-10 text-sm text-gray-600">No PPE data available for the selected filters.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((it, idx) => (
            <button key={it.id} onClick={() => onSelect(it.name)}
              className="group block w-full px-5 py-4 text-left transition-all hover:bg-[#12343B]/[0.02] focus-visible:bg-[#12343B]/[0.02] focus-visible:outline-none">
              <div className="flex items-start justify-between gap-4">
                <span className="flex items-center gap-3 text-sm font-medium text-[#12343B]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 group-hover:border-[#D3A966]/30 transition-colors">
                    <it.icon className="h-5 w-5 text-gray-600 group-hover:text-[#12343B] transition-colors" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      {it.name}
                      {idx === 0 && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Weakest</Badge>}
                    </span>
                    <span className="text-xs text-gray-500 font-normal">
                      {fmt(it.missing)} missing · {it.total} total assessments
                    </span>
                  </div>
                </span>
                <span className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-2xl font-semibold tabular-nums" style={{ color: rateColor(it.pct) === '#10b981' ? '#D3A966' : rateColor(it.pct) }}>{it.pct}%</span>
                  <span className="text-xs font-medium text-gray-500">
                    compliance
                  </span>
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Meter value={it.pct} color={rateColor(it.pct) === '#10b981' ? '#D3A966' : rateColor(it.pct)} className="flex-1 h-2" />
                <span className="flex items-center text-xs font-medium text-[#12343B]/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      <p className="border-t border-gray-100 bg-gray-50/50 px-5 py-3 text-xs text-gray-600">Unknown or occluded items are excluded from each denominator, never counted as missing.</p>
    </Panel>
  );
}