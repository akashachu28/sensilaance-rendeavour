"use client";
// Sensilance Overview. All figures are ILLUSTRATIVE MOCK DATA, not real telemetry.
import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck, ShieldX, Users, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "./components/Header";
import { KpiGrid, CameraHealthCard, ResolvedCard, type Kpi } from "./components/overview/Kpis";
import PpeItemCard from "./components/overview/Ppeitemcard";
import DistributionCard from "./components/overview/Distributioncard";
import TrendCard from "./components/overview/Trendcard";
import AlertsCard from "./components/overview/Alertscard";
import ZoneTable from "./components/overview/Zonetable";
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [customDateFrom, setCustomDateFrom] = useState<string>("");
  const [customDateTo, setCustomDateTo] = useState<string>("");
  
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []); // demo loading state

  // Shared date-range computation (mirrors Eventstable logic)
  const getDateRange = (r: string, from: string, to: string) => {
    const today = new Date();
    const toISO = (d: Date) => d.toISOString().split('T')[0];
    if (r === "custom" && from && to) return { startDate: from, endDate: to };
    if (r === "7d") {
      const d = new Date(today); d.setDate(today.getDate() - 7);
      return { startDate: toISO(d), endDate: toISO(today) };
    }
    if (r === "30d") {
      const d = new Date(today); d.setDate(today.getDate() - 30);
      return { startDate: toISO(d), endDate: toISO(today) };
    }
    return { startDate: toISO(today), endDate: toISO(today) };
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { startDate, endDate } = getDateRange(range, customDateFrom, customDateTo);
        const statsData = await getStats({ start_date: startDate, end_date: endDate });
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, customDateFrom, customDateTo]);

  const handleCustomDateChange = (from: string, to: string) => {
    console.log('Custom date range selected:', { from, to });
    setCustomDateFrom(from);
    setCustomDateTo(to);
  };

  const R = RANGES.find((r) => r.id === range)!;
  const scale = R.scale;
  const zs = useMemo(() => (zone === "All zones" ? ZONES : ZONES.filter((z) => z.id === zone)), [zone]);
  const t = useMemo(() => ({
    assess: zs.reduce((a, z) => a + z.assess, 0), 
    full: zs.reduce((a, z) => a + z.full, 0),
    viol: zs.reduce((a, z) => a + z.viol, 0), 
    crit: zs.reduce((a, z) => a + z.crit, 0),
    on: zs.reduce((a, z) => a + z.on, 0), 
    cams: zs.reduce((a, z) => a + z.total, 0),
  }), [zs]);
  
  // Calculate compliance rates from API stats if available, otherwise use mock data
  const totalLogs = stats?.total_logs || t.assess;
  const fullGear = stats?.full_gear || t.full;
  const halfGear = stats?.half_gear || Math.floor((t.assess - t.full) * 0.6);
  const noPPE = stats?.no_ppe || (t.assess - t.full - halfGear);
  
  const fullComplianceRate = (fullGear / totalLogs) * 100;
  const partialComplianceRate = (halfGear / totalLogs) * 100;
  const nonCompliantRate = (noPPE / totalLogs) * 100;

  const kpis: Kpi[] = [
    { 
      label: "Full Compliance Rate", 
      value: `${fullComplianceRate.toFixed(1)}%`, 
      icon: ShieldCheck, 
      tone: fullComplianceRate >= TARGET ? "green" : "amber", 
      gauge: fullComplianceRate,
      sub: `Target ${TARGET}% · ${Math.abs(fullComplianceRate - TARGET).toFixed(1)} pts ${fullComplianceRate >= TARGET ? "above" : "below"} target` 
    },
    { 
      label: "Partial Compliance Rate", 
      value: `${partialComplianceRate.toFixed(1)}%`, 
      icon: ShieldAlert, 
      tone: "amber", 
      gauge: partialComplianceRate,
      sub: `${fmt(halfGear)} half-gear assessments from ${fmt(totalLogs)} total (${R.text})` 
    },
    { 
      label: "Non-Compliant Rate", 
      value: `${nonCompliantRate.toFixed(1)}%`, 
      icon: ShieldX, 
      tone: "red", 
      gauge: nonCompliantRate,
      sub: `${fmt(noPPE)} no-PPE assessments from ${fmt(totalLogs)} total (${R.text})` 
    },
    { 
      label: "Person Assessments", 
      value: fmt(totalLogs), 
      icon: Users, 
      tone: "neutral",
      sub: `Valid assessments, ${R.text}. Not unique workers.` 
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
        {/* <Alert className="border-[#D3A966] bg-[#D3A966]/10 text-amber-900">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Monitoring gap: Material Storage has 2 of 3 cameras offline</AlertTitle>
          <AlertDescription className="text-amber-800">Its status shows Unknown, not safe, until feeds are restored.</AlertDescription>
        </Alert> */}

        <KpiGrid kpis={kpis} loading={loading} />
        {/* <div className="grid gap-4 md:grid-cols-2">
          <CameraHealthCard online={t.on} total={t.cams} stale={zs.some((z) => z.id === "Loading Bay") ? 1 : 0} />
          <ResolvedCard value={fmt(84 * (range === "today" ? 1 : scale))} rangeText={R.text} />
        </div> */}

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3"><PpeItemCard onSelect={(i) => { setItemFilter(i); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }} camera={camera} range={range} customDateFrom={customDateFrom} customDateTo={customDateTo} /></div>
          <div className="lg:col-span-2"><DistributionCard stats={stats} /></div>
        </div>

        {/* <div className="grid gap-4 xl:grid-cols-5">
          <div className="xl:col-span-3"><TrendCard range={range} /></div>
          <div className="xl:col-span-2"><AlertsCard zone={zone} /></div>
        </div> */}

        {/* <ZoneTable zones={zs} scale={scale} /> */}
        <EventsTable zone={zone} itemFilter={itemFilter} onItemFilter={setItemFilter} camera={camera} range={range} customDateFrom={customDateFrom} customDateTo={customDateTo} />

        <p className="pb-4 text-center text-xs text-gray-600">All figures on this page are illustrative sample data, not real Sensilance telemetry.</p>
      </main>
    </div>
  );
}