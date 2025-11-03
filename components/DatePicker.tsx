"use client";

import { Calendar } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  className?: string;
}

export default function DatePicker({ value, onChange, label, className = "" }: DatePickerProps) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold mb-2">{label}</label>}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input w-full pl-10"
          max={new Date().toISOString().split('T')[0]}
        />
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
      </div>
    </div>
  );
}
