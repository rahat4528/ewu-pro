import React from "react";
import { Section } from "@/lib/types";
import { User, MapPin, Users } from "lucide-react";

interface SectionChipProps {
  section: Section;
  onClick?: () => void;
  selected?: boolean;
}

export function SectionChip({ section, onClick, selected }: SectionChipProps) {
  const seats = section.seats ?? 0;
  const isFull = seats <= 0;
  const isLow = seats > 0 && seats <= 5;

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col p-2.5 rounded-xl border transition-all text-xs cursor-pointer select-none ${
        selected
          ? "bg-primary-50 dark:bg-primary-950/60 border-primary-500 ring-2 ring-primary-500/20"
          : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between space-x-2">
        <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
          {section.courseCode}
        </span>
        <span className="font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
          Sec {section.sectionNo}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 gap-2">
        <span className="inline-flex items-center space-x-1 font-medium">
          <User className="w-3 h-3 text-slate-400" />
          <span>{section.faculty}</span>
        </span>

        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            isFull
              ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300"
              : isLow
              ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300"
              : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
          }`}
          title={`${seats} seats remaining`}
        >
          {isFull ? "Full" : `${seats} seats`}
        </span>
      </div>

      {section.room && (
        <div className="flex items-center space-x-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          <MapPin className="w-2.5 h-2.5" />
          <span>{section.room}</span>
        </div>
      )}
    </div>
  );
}
