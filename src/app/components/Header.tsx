"use client";
import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./Sidebar";
import FilterSelect from "./Filterselect";
import DateRangeFilter from "./DateRangeFilter";
import { getCameras, type Camera } from "@/lib/api";

type HeaderProps = {
  title: string; subtitle: string;
  range: string; onRangeChange: (id: string) => void;
  onCustomDateChange?: (from: string, to: string) => void;
  zone: string; onZoneChange: (zone: string) => void; zoneOptions: string[];
  camera: string; onCameraChange: (camera: string) => void;
  shift: string; onShiftChange: (shift: string) => void;
  lastUpdated?: string; timezone?: string;
};

export default function Header({ title, subtitle, range, onRangeChange, onCustomDateChange, zone, onZoneChange, zoneOptions, camera, onCameraChange, shift, onShiftChange, lastUpdated = "15:10:24 IST", timezone = "Asia/Kolkata (IST)" }: HeaderProps) {
  const { toggle } = useSidebar();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(true);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const camerasData = await getCameras();
        setCameras(camerasData);
      } catch (error) {
        console.error('Failed to fetch cameras:', error);
      } finally {
        setLoadingCameras(false);
      }
    };

    fetchCameras();
  }, []);
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden hover:bg-gray-100" onClick={toggle} aria-label="Open menu"><Menu className="h-5 w-5 text-gray-700" /></Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold leading-tight tracking-tight text-gray-900">{title}</h1>
          <p className="truncate text-xs text-gray-600">{subtitle}</p>
        </div>
        <Badge variant="outline" className="hidden gap-1.5 border-gray-300 bg-white font-normal text-gray-700 md:inline-flex">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-500 opacity-60 motion-reduce:hidden" /><span className="relative inline-flex h-2 w-2 rounded-full bg-gray-600" /></span>
          Live · updated {lastUpdated}
        </Badge>
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100" aria-label="Notifications">
          <Bell className="h-5 w-5 text-gray-700" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gray-600 ring-2 ring-white" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 bg-white px-4 py-2 lg:px-6">
        {/* <FilterSelect label="Site" value="North Construction Site" onChange={() => {}} options={["North Construction Site", "South Yard"]} /> */}
        <DateRangeFilter
          value={range}
          onRangeChange={onRangeChange}
          onCustomDateChange={onCustomDateChange}
        />
        <FilterSelect label="Zone" value={zone} onChange={onZoneChange} options={["All zones", ...zoneOptions]} />
        <FilterSelect 
          label="Camera" 
          value={camera} 
          onChange={onCameraChange} 
          options={["All Cameras", ...cameras.map(cam => cam.camera_name)]} 
        />
        {/* <FilterSelect label="Shift" value={shift} onChange={onShiftChange} options={["All shifts", "Day (06:00-14:00)", "Evening (14:00-22:00)", "Night (22:00-06:00)"]} /> */}
        <span className="ml-auto text-xs text-gray-600">Timezone: {timezone}</span>
      </div>
    </header>
  );
}