"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FilterSelect({ value, onChange, options, label, className = "" }: { value: string; onChange: (v: string) => void; options: string[]; label: string; className?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className={`h-9 w-auto min-w-32 bg-white border-gray-300 text-gray-700 hover:bg-[#3F2042]/10 ${className}`}><SelectValue /></SelectTrigger>
      <SelectContent className="bg-white border-gray-300">{options.map((o) => <SelectItem key={o} value={o} className="text-gray-700 hover:bg-[#3F2042]/10">{o}</SelectItem>)}</SelectContent>
    </Select>
  );
}