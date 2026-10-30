"use client";
import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type DateRangeOption = "today" | "7d" | "30d" | "custom";

interface DateRangeFilterProps {
  value: string;
  onRangeChange: (range: string) => void;
  onCustomDateChange?: (from: string, to: string) => void;
}

const DATE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
];

export default function DateRangeFilter({
  value,
  onRangeChange,
  onCustomDateChange,
}: DateRangeFilterProps) {
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleValueChange = (newValue: string) => {
    onRangeChange(newValue);
    if (newValue === "custom") {
      setShowCustomDates(true);
    } else {
      setShowCustomDates(false);
    }
  };

  const handleApplyCustomRange = () => {
    if (fromDate && toDate && onCustomDateChange) {
      onCustomDateChange(fromDate, toDate);
      setShowCustomDates(false);
    }
  };

  const getDisplayValue = () => {
    const option = DATE_OPTIONS.find((opt) => opt.value === value);
    if (value === "custom" && fromDate && toDate) {
      return `${fromDate} to ${toDate}`;
    }
    return option?.label || "Select Range";
  };

  return (
    <div className="flex flex-col gap-2">
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger
          aria-label="Date range"
          className="h-9 w-auto min-w-48 bg-white border-gray-300 text-gray-700 hover:bg-[#3F2042]/10"
        >
          <Calendar className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Select Range">
            {getDisplayValue()}
          </SelectValue>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-300">
          {DATE_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-gray-700 hover:bg-[#3F2042]/10"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCustomDates && value === "custom" && (
        <div className="flex items-center gap-2 p-3 bg-white border border-gray-300 rounded-md shadow-sm">
          <div className="flex flex-col gap-1">
            <label htmlFor="from-date" className="text-xs text-gray-600">
              From
            </label>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 w-auto border-gray-300"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="to-date" className="text-xs text-gray-600">
              To
            </label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
              className="h-9 w-auto border-gray-300"
            />
          </div>
          <Button
            size="sm"
            onClick={handleApplyCustomRange}
            disabled={!fromDate || !toDate}
            className="mt-5 h-9 bg-[#12343B] hover:bg-[#12343B]/90 text-white"
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
