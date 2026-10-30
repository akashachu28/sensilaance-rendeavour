"use client";
import { useState, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight, Inbox, X, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Panel, PanelHeader } from "../Panel";
import FilterSelect from "../Filterselect";
import { getLogs, type LogEntry } from "@/lib/api";

const PER_PAGE_OPTIONS = [5, 10, 20, 50];
const ALL = "All statuses";

// Status to gear_status mapping — values must match what the API expects
const STATUS_TO_GEAR_STATUS: Record<string, string> = {
  "Compliant":           "Full gear",
  "Partially compliant": "Half gear",
  "Non-compliant":       "No PPE",
};

// Status style mapping — keyed on exact API gear_status values
const STATUS_STYLE: Record<string, string> = {
  "Full gear": "bg-green-50 text-green-700 border-green-200",
  "Half gear": "bg-amber-50 text-amber-700 border-amber-200",
  "No PPE":    "bg-red-50 text-red-700 border-red-200",
};

// Label mapping
const STATUS_LABEL: Record<string, string> = {
  "Full gear": "Compliant",
  "Half gear": "Partially compliant",
  "No PPE":    "Non-compliant",
};

// Helper to determine compliance status
const getComplianceStatus = (gearStatus: string): string => {
  return STATUS_LABEL[gearStatus] ?? "Unknown";
};

// Helper to get items detected count
const getItemsDetected = (metadata: LogEntry['metadata_json']): number => {
  let count = 0;
  if (metadata.helmet_present) count++;
  if (metadata.vest_present) count++;
  if (metadata.boot_present) count++;
  return count;
};

export default function EventsTable({ zone, itemFilter, onItemFilter, camera, range, customDateFrom, customDateTo }: { 
  zone: string; 
  itemFilter: string; 
  onItemFilter: (v: string) => void; 
  camera: string;
  range: string;
  customDateFrom?: string;
  customDateTo?: string;
}) {
  const [st, setSt] = useState(ALL);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sel, setSel] = useState<LogEntry | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    // For "today" or default, use today's date for both

    return { startDate, endDate };
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const { startDate, endDate } = getDateRange();
        
        // Build params object
        const params: Record<string, string | number> = {
          page,
          limit: perPage,
          start_date: startDate,
          end_date: endDate,
        };

        // Add camera_id if not "All Cameras"
        if (camera && camera !== "All Cameras") {
          // Extract camera ID from camera name (format: "Camera 0 (Tatu City Site)", "Camera 1", etc.)
          const idMatch = camera.match(/(\d+)/);
          if (idMatch) {
            const cameraId = parseInt(idMatch[1]);
            // Explicitly check for valid number (including 0)
            if (!isNaN(cameraId) && cameraId >= 0) {
              params.camera_id = cameraId;
            }
          }
        }

        // Add gear_status if status filter is applied
        if (st !== ALL) {
          params.gear_status = STATUS_TO_GEAR_STATUS[st];
        }

        const response = await getLogs(params);
        setLogs(response.items);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, st, camera, range, customDateFrom, customDateTo]);

  const pages = Math.max(1, Math.ceil(total / perPage));
  const filtered = st !== ALL;
  const H = "bg-[#12343B]/[0.02] text-xs font-medium text-gray-600 uppercase tracking-wide";

  // Helper to format timestamp with date and time
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      timeZone: 'Asia/Kolkata' 
    });
  };

  const handleImageClick = (imageUrl: string) => {
    const base = (process.env.NEXT_PUBLIC_API_URL || '/api/proxy').replace(/\/?$/, '/');
    setSelectedImage(`${base}${imageUrl}`);
    setImageModalOpen(true);
  };

  // Get image URL from image_paths
  const getImageFromPaths = (imagePaths: string): string | null => {
    try {
      // Handle different formats of image_paths
      let filename = null;
      
      // Try parsing as JSON array first
      if (imagePaths.startsWith('[')) {
        const paths = JSON.parse(imagePaths.replace(/'/g, '"'));
        if (Array.isArray(paths) && paths.length > 0) {
          filename = paths[0];
        }
      } else {
        // If it's already a plain string, use it directly
        filename = imagePaths;
      }
      
      // Log for debugging
      console.log('Parsed filename from image_paths:', filename);
      return filename;
    } catch (e) {
      console.error('Failed to parse image paths:', imagePaths, e);
      return null;
    }
  };

  const getFullImageUrl = (filename: string | null): string | null => {
    if (!filename) return null;
    const base = (process.env.NEXT_PUBLIC_API_URL || '/api/proxy').replace(/\/?$/, '/');
    return `${base}api/images/${encodeURIComponent(filename)}`;
  };

  return (
    <Panel id="events">
      <PanelHeader title="Recent PPE Detection Events" sub="Model observations. An alert is created only when an actionable rule is met."
        right={<span className="shrink-0 text-xs font-medium text-[#12343B]">Recent Events</span>} />
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-4 bg-gray-50/50">
        <FilterSelect label="Status" value={st} onChange={(v) => { setSt(v); setPage(1); }} options={[ALL, "Compliant", "Partially compliant", "Non-compliant"]} />
        {filtered && <Button variant="ghost" size="sm" onClick={() => { setSt(ALL); }} className="hover:bg-white text-gray-600 hover:text-[#12343B]">Clear filters</Button>}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center p-10 text-sm text-gray-600">Loading events...</div>
      ) : (
        <>
          <Table className="min-w-215">
            <TableHeader><TableRow className="hover:bg-transparent">
              {["Event ID", "Date & Time (IST)", "Camera", "Detected PPE", "Items", "Violations", "Image", "Status"].map((h, i) => <TableHead key={i} className={`${H} ${i === 0 ? "pl-4" : ""}`}>{h}</TableHead>)}
            </TableRow></TableHeader>
            <TableBody>
              {logs.map((log) => {
                const itemsDetected = getItemsDetected(log.metadata_json);
                const complianceStatus = getComplianceStatus(log.gear_status);
                const imagePath = getImageFromPaths(log.image_paths);
                const imageUrl = getFullImageUrl(imagePath);
                
                return (
                  <TableRow key={log.id} className="hover:bg-[#12343B]/1 transition-colors">
                    <TableCell className="py-3 pl-4 font-medium text-[#12343B]">#{log.id}</TableCell>
                    <TableCell className="tabular-nums text-gray-600 text-xs">{formatDateTime(log.event_timestamp)}</TableCell>
                    
                    <TableCell className="text-gray-900">Camera {log.camera_id}</TableCell>
                    <TableCell className="text-gray-600">
                      <div className="flex flex-col gap-0.5 text-xs">
                        {(() => {
                          const detected = [];
                          if (log.metadata_json.helmet_present) detected.push(<span key="helmet" className="text-green-700">✓ Helmet</span>);
                          if (log.metadata_json.vest_present) detected.push(<span key="vest" className="text-green-700">✓ Vest</span>);
                          if (log.metadata_json.boot_present) detected.push(<span key="boots" className="text-green-700">✓ Boots</span>);
                          
                          return detected.length > 0 ? detected : <span className="text-gray-500">None</span>;
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums text-gray-900 font-medium">{itemsDetected}/3</TableCell>
                    <TableCell className="text-red-700 text-xs">
                      {log.violations && log.violations.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {log.violations.map((v, i) => (
                            <span key={i} className="capitalize">{v}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-green-700">None</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={`Event ${log.id}`}
                          className="h-16 w-24 object-cover rounded border border-gray-300 cursor-pointer hover:border-[#D3A966] transition-colors"
                          onClick={() => handleImageClick(`api/images/${imagePath}`)}
                          onError={(e) => {
                            console.error('Failed to load image:', imageUrl);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`h-16 w-24 flex items-center justify-center bg-gray-100 rounded border border-gray-300 text-xs text-gray-400 ${imageUrl ? 'hidden' : ''}`}>
                        No image
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className={STATUS_STYLE[log.gear_status] || "bg-gray-50 text-gray-700 border-gray-200"}>{complianceStatus}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {logs.length === 0 && <div className="flex flex-col items-center gap-2 p-10 text-sm text-gray-600"><Inbox className="h-6 w-6" />No events match these filters. Clear a filter or widen the time range.</div>}
        </>
      )}
      
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-3 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span className="font-medium text-[#12343B]">
            {total} events · <span className="text-gray-500">page {page} of {pages}</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Show:</span>
            <select 
              value={perPage} 
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="h-8 rounded border border-gray-300 bg-white px-2 text-gray-700 hover:border-[#12343B] focus:outline-none focus:ring-2 focus:ring-[#12343B]/20"
            >
              {PER_PAGE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span className="text-gray-600">per page</span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300 bg-[#3F2042] hover:bg-[#3F2042]/80 text-white hover:text-white hover:border-[#3F2042]/80 transition-colors disabled:opacity-50" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300 bg-[#3F2042] hover:bg-[#3F2042]/80 text-white hover:text-white hover:border-[#3F2042]/80 transition-colors disabled:opacity-50" disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Evidence Sheet */}
      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md bg-white border-l border-gray-200">
          {sel && (
            <>
              <SheetHeader>
                <SheetTitle className="text-[#12343B]">Event #{sel.id}</SheetTitle>
                <SheetDescription className="text-gray-600">{formatDateTime(sel.event_timestamp)} · Camera {sel.camera_id}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-6">
                {(() => {
                  const imagePath = getImageFromPaths(sel.image_paths);
                  const imageUrl = getFullImageUrl(imagePath);
                  return imageUrl ? (
                    <div className="relative group">
                      <img 
                        src={imageUrl} 
                        alt="Evidence snapshot" 
                        className="w-full rounded-lg border-2 border-gray-300 cursor-pointer hover:border-[#D3A966] transition-colors"
                        onClick={() => handleImageClick(`api/images/${imagePath}`)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg cursor-pointer" onClick={() => handleImageClick(`api/images/${imagePath}`)}>
                        <ZoomIn className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500">No image available</div>
                  );
                })()}
                <Badge variant="outline" className={STATUS_STYLE[sel.gear_status] || "bg-gray-50 text-gray-700 border-gray-200"}>{getComplianceStatus(sel.gear_status)} · {getItemsDetected(sel.metadata_json)}/3</Badge>
                <ul className="divide-y divide-gray-200 rounded-lg border border-gray-300 text-sm overflow-hidden">
                  <li className="flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50/50 transition-colors">
                    Helmet
                    <span className={`flex items-center gap-1.5 font-medium ${sel.metadata_json.helmet_present ? "text-[#D3A966]" : "text-red-700"}`}>
                      {sel.metadata_json.helmet_present ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      {sel.metadata_json.helmet_present ? "Detected" : "Not detected"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50/50 transition-colors">
                    Safety Vest
                    <span className={`flex items-center gap-1.5 font-medium ${sel.metadata_json.vest_present ? "text-[#D3A966]" : "text-red-700"}`}>
                      {sel.metadata_json.vest_present ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      {sel.metadata_json.vest_present ? "Detected" : "Not detected"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50/50 transition-colors">
                    Safety Boots
                    <span className={`flex items-center gap-1.5 font-medium ${sel.metadata_json.boot_present ? "text-[#D3A966]" : "text-red-700"}`}>
                      {sel.metadata_json.boot_present ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      {sel.metadata_json.boot_present ? "Detected" : "Not detected"}
                    </span>
                  </li>
                </ul>
                {sel.violations && sel.violations.length > 0 && (
                  <p className="text-sm text-gray-600 bg-red-50 rounded-lg px-4 py-3 border border-red-200">
                    <span className="font-medium text-red-700">Violations:</span>{" "}
                    {sel.violations.join(", ")}
                  </p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Image Modal - Centered with backdrop */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -top-12 right-0 h-10 w-10 text-white hover:bg-white/20 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setImageModalOpen(false);
              }}
            >
              <X className="h-6 w-6" />
            </Button>
            <img 
              src={selectedImage} 
              alt="Enlarged evidence" 
              className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </Panel>
  );
}
