"use client";
import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, ShieldX, Users } from "lucide-react";
import Header from "./components/Header";
import { KpiGrid, type Kpi } from "./components/overview/Kpis";
import PpeItemCard from "./components/overview/Ppeitemcard";
import DistributionCard from "./components/overview/Distributioncard";
import { ZONES, TARGET, fmt } from "./lib/data";
import { RANGES } from "./lib/ranges";
import EventsTable from "./components/overview/Eventstable";
import { getStats, type StatsData } from "@/lib/api";

export default function OverviewPage() {
  const [range, setRange] = useState("today");
  const [zone, setZone] = useState("All zones");
  const [camera, setCamera] = useState("All Cameras");
  const [shift, setShift] = useState("All shifts");
  const [itemFilter, setItemFilter] = useState("Any missing item");
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [customDateFrom, setCustomDateFrom] = useState<string>("");
  const [customDateTo, setCustomDateTo] = useState<string>("");

  const getDateRange = (r: string, from: string, to: string) => {
    const today = new Date();
    const toISO = (d: Date) => d.toISOString().split('T')[0];
    if (r === "custom" && from && to) return { startDate: from, endDate: to };
    if (r === "7d") { const d = new Date(today); d.setDate(today.getDate() - 7); return { startDate: toISO(d), endDate: toISO(today) }; }
    if (r === "30d") { const d = new Date(today); d.setDate(today.getDate() - 30); return { startDate: toISO(d), endDate: toISO(today) }; }
    return { startDate: toISO(today), endDate: toISO(today) };
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const { startDate, endDate } = getDateRange(range, customDateFrom, customDateTo);
        const statsData = await getStats({ start_date: startDate, end_date: endDate });
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, customDateFrom, customDateTo]);

  const handleCustomDateChange = (from: string, to: string) => {
    setCustomDateFrom(from);
    setCustomDateTo(to);
  };

  const R = RANGES.find((r) => r.id === range)!;

  // Only use real API data — no mock fallback
  const hasData = stats !== null && stats.total_logs > 0;
  const totalLogs = stats?.total_logs ?? 0;
  const fullGear = stats?.full_gear ?? 0;
  const halfGear = stats?.half_gear ?? 0;
  const noPPE = stats?.no_ppe ?? 0;

  const fullComplianceRate  = hasData ? (fullGear / totalLogs) * 100 : 0;
  const partialComplianceRate = hasData ? (halfGear / totalLogs) * 100 : 0;
  const nonCompliantRate    = hasData ? (noPPE / totalLogs) * 100 : 0;

  const noDataSub = "No data available for this period";

  const kpis: Kpi[] = [
    {
      label: "Full Compliance Rate",
      value: hasData ? `${fullComplianceRate.toFixed(1)}%` : "—",
      icon: ShieldCheck,
      tone: hasData ? (fullComplianceRate >= TARGET ? "green" : "amber") : "neutral",
      gauge: hasData ? fullComplianceRate : undefined,
      sub: hasData ? `Target ${TARGET}% · ${Math.abs(fullComplianceRate - TARGET).toFixed(1)} pts ${fullComplianceRate >= TARGET ? "above" : "below"} target` : noDataSub,
    },
    {
      label: "Partial Compliance Rate",
      value: hasData ? `${partialComplianceRate.toFixed(1)}%` : "—",
      icon: ShieldAlert,
      tone: hasData ? "amber" : "neutral",
      gauge: hasData ? partialComplianceRate : undefined,
      showTarget: false,
      sub: hasData ? `${fmt(halfGear)} half-gear assessments from ${fmt(totalLogs)} total` : noDataSub,
    },
    {
      label: "Non-Compliant Rate",
      value: hasData ? `${nonCompliantRate.toFixed(1)}%` : "—",
      icon: ShieldX,
      tone: hasData ? "red" : "neutral",
      gauge: hasData ? nonCompliantRate : undefined,
      showTarget: false,
      sub: hasData ? `${fmt(noPPE)} no-PPE assessments from ${fmt(totalLogs)} total` : noDataSub,
    },
    {
      label: "Person Assessments",
      value: hasData ? fmt(totalLogs) : "—",
      icon: Users,
      tone: "neutral",
      sub: hasData ? `Valid assessments. Not unique workers.` : noDataSub,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header title="Overview" subtitle="Site-wide PPE compliance and safety monitoring"
        range={range} onRangeChange={setRange}
        onCustomDateChange={handleCustomDateChange}
        zone={zone} onZoneChange={setZone} zoneOptions={ZONES.map((z) => z.id)}
        camera={camera} onCameraChange={setCamera}
        shift={shift} onShiftChange={setShift} />

      <main className="mx-auto max-w-[1600px] space-y-4 p-4 lg:p-6">
        <KpiGrid kpis={kpis} loading={statsLoading} />

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <PpeItemCard onSelect={(i) => { setItemFilter(i); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }} camera={camera} range={range} customDateFrom={customDateFrom} customDateTo={customDateTo} />
          </div>
          <div className="lg:col-span-2"><DistributionCard stats={stats} /></div>
        </div>

        <EventsTable zone={zone} itemFilter={itemFilter} onItemFilter={setItemFilter} camera={camera} range={range} customDateFrom={customDateFrom} customDateTo={customDateTo} />
      </main>
    </div>
  );
}