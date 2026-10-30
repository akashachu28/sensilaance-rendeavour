"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FilterSelect({ value, onChange, options, label, className = "", contentClassName = "" }: { value: string; onChange: (v: string) => void; options: string[]; label: string; className?: string; contentClassName?: string }) {
  const handleChange = (v: string | null) => {
    if (v) onChange(v);
  };
  
  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger aria-label={label} className={`h-9 w-auto min-w-32 max-w-64 bg-white border-gray-300 text-gray-700 hover:bg-[#3F2042]/10 **:data-[slot=select-value]:whitespace-normal **:data-[slot=select-value]:line-clamp-none ${className}`}><SelectValue /></SelectTrigger>
      <SelectContent className={`bg-white border-gray-300 w-auto! min-w-(--anchor-width) max-w-sm ${contentClassName}`}>{options.map((o) => <SelectItem key={o} value={o} className="text-gray-700 hover:bg-[#3F2042]/10 whitespace-nowrap">{o}</SelectItem>)}</SelectContent>
    </Select>
  );
}