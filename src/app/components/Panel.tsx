import { Card } from "@/components/ui/card";

export const Panel = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <Card id={id} className={`gap-0 overflow-hidden py-0 shadow-xs ${className}`}>{children}</Card>
);
export const PanelHeader = ({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3">
    <div className="min-w-0"><h2 className="text-[15px] font-semibold leading-tight text-gray-900">{title}</h2>{sub && <p className="mt-0.5 text-xs text-gray-600">{sub}</p>}</div>
    {right}
  </div>
);
export const Meter = ({ value, color, className = "h-1.5" }: { value: number; color: string; className?: string }) => (
  <div className={`${className} w-full overflow-hidden rounded-full bg-gray-200`}><div className="h-full rounded-full" style={{ width: `${Math.min(value, 100)}%`, background: color }} /></div>
);