import React from "react";
import { Section } from "@/lib/types";
import { User, MapPin } from "lucide-react";

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
      className={`inline-flex flex-col p-2.5 rounded-2xl border transition-all text-xs cursor-pointer select-none ${
        selected
          ? "bg-[#effaf7] dark:bg-[#072c29] border-[#1CAF9A] ring-2 ring-[#1CAF9A]/30 shadow-xs"
          : "bg-white dark:bg-slate-800/90 border-[#E4E7EA] dark:border-slate-700/80 hover:border-[#1CAF9A] hover:shadow-xs"
      }`}
    >
      <div className="flex items-center justify-between space-x-2">
        <span className="font-black text-[#1C4370] dark:text-white tracking-tight">
          {section.courseCode}
        </span>
        <span className="font-bold px-1.5 py-0.5 rounded-lg bg-[#f0f4f5] dark:bg-slate-700 text-[#1C4370] dark:text-[#1CAF9A] text-[10px]">
          Sec {section.sectionNo}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 gap-2">
        <span className="inline-flex items-center space-x-1 font-semibold text-slate-700 dark:text-slate-300">
          <User className="w-3 h-3 text-[#1CAF9A]" />
          <span>{section.faculty}</span>
        </span>

        <span
          className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${
            isFull
              ? "bg-[#D9534F]/10 text-[#D9534F]"
              : isLow
              ? "bg-[#F0AD4E]/15 text-[#b07d12]"
              : "bg-[#5cb85c]/15 text-[#3d8b3d]"
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
