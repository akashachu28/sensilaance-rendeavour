import { ChevronDown } from "lucide-react";

export default function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-md border border-[#D0D7E0] bg-white pl-3 pr-8 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6FEB]">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-[#667085]" />
    </label>
  );
}