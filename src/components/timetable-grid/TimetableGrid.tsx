"use client";

import React, { useRef, useState } from "react";
import { Day, Section } from "@/lib/types";
import { formatTimeRange, minutesToTime } from "@/lib/time";
import { DAY_LABELS } from "@/lib/days";
import { doSectionsClash, getClashReason } from "@/lib/planner/clash";
import { Download, Printer, AlertTriangle, Building2, MapPin } from "lucide-react";
import { toPng } from "html-to-image";

interface TimetableGridProps {
  sections: Section[];
  onSwapSection?: (oldSection: Section, newSection: Section) => void;
  availableSectionsByCourse?: Record<string, Section[]>;
  title?: string;
  subtitle?: string;
}

// Visual palette aligned with portal.ewubd.edu styles
const COURSE_COLORS = [
  { bg: "bg-[#eaf2f8] dark:bg-[#143154]/90", border: "border-[#1C4370]/40 dark:border-[#3186a4]", text: "text-[#1C4370] dark:text-[#dbe5f1]", chip: "bg-[#1C4370]" },
  { bg: "bg-[#e8f8f5] dark:bg-[#0f3d36]/90", border: "border-[#1CAF9A]/50 dark:border-[#1CAF9A]", text: "text-[#0d6256] dark:text-[#b0e8dc]", chip: "bg-[#1CAF9A]" },
  { bg: "bg-[#f4f6f7] dark:bg-slate-800", border: "border-[#3186a4]/50 dark:border-[#4ca5c4]", text: "text-[#245269] dark:text-[#c4e3f3]", chip: "bg-[#3186a4]" },
  { bg: "bg-[#fef9e7] dark:bg-[#4d3a08]/80", border: "border-[#F0AD4E]/50 dark:border-[#F0AD4E]", text: "text-[#935d08] dark:text-[#fdebd0]", chip: "bg-[#F0AD4E]" },
  { bg: "bg-[#f9ebea] dark:bg-[#4d1616]/80", border: "border-[#D9534F]/50 dark:border-[#D9534F]", text: "text-[#922b21] dark:text-[#f2d7d5]", chip: "bg-[#D9534F]" },
  { bg: "bg-[#eafaf1] dark:bg-[#143d22]/80", border: "border-[#5cb85c]/50 dark:border-[#5cb85c]", text: "text-[#196f3d] dark:text-[#d4efdf]", chip: "bg-[#5cb85c]" },
  { bg: "bg-[#f5eef8] dark:bg-[#341842]/80", border: "border-purple-300 dark:border-purple-600", text: "text-purple-900 dark:text-purple-200", chip: "bg-purple-600" },
];

export function TimetableGrid({
  sections,
  onSwapSection,
  availableSectionsByCourse,
  title = "EWU Routine & Timetable",
  subtitle,
}: TimetableGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [swapTarget, setSwapTarget] = useState<Section | null>(null);

  const START_HOUR = 8;
  const END_HOUR = 18;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const START_MINS = START_HOUR * 60;

  const weekdays: Day[] = ["SUN", "MON", "TUE", "WED", "THU"];
  const hasFriday = sections.some((s) => s.days.includes("FRI"));
  const hasSaturday = sections.some((s) => s.days.includes("SAT"));
  if (hasFriday) weekdays.push("FRI");
  if (hasSaturday) weekdays.push("SAT");

  const courseCodes = Array.from(new Set(sections.map((s) => s.courseCode)));
  const colorMap = new Map<string, typeof COURSE_COLORS[0]>();
  courseCodes.forEach((code, idx) => {
    colorMap.set(code, COURSE_COLORS[idx % COURSE_COLORS.length]);
  });

  const clashingIds = new Set<string>();
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      if (doSectionsClash(sections[i], sections[j])) {
        clashingIds.add(sections[i].id);
        clashingIds.add(sections[j].id);
      }
    }
  }

  const handleExportPng = async () => {
    if (!gridRef.current) return;
    try {
      setExporting(true);
      const dataUrl = await toPng(gridRef.current, {
        backgroundColor: "#ffffff",
        quality: 0.95,
      });
      const link = document.createElement("a");
      link.download = `ewu-timetable-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export PNG failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3">
      {/* Action Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E7EA] dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="flex flex-wrap gap-1.5">
            {courseCodes.map((code) => {
              const theme = colorMap.get(code);
              return (
                <span
                  key={code}
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${theme?.bg} ${theme?.text} border ${theme?.border}`}
                >
                  <span className={`w-2 h-2 rounded-full ${theme?.chip}`} />
                  <span>{code}</span>
                </span>
              );
            })}
          </div>
          {clashingIds.size > 0 && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#D9534F]/10 text-[#D9534F] border border-[#D9534F]/30 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Time Clash Detected</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportPng}
            disabled={exporting}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#1C4370] hover:bg-[#143154] text-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#1CAF9A]" />
            <span>{exporting ? "Exporting..." : "PNG Image"}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-[#f0f4f5] dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Grid Card */}
      <div
        ref={gridRef}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E7EA] dark:border-slate-800 shadow-xs overflow-hidden p-4 sm:p-6"
      >
        <div className="mb-4 pb-3 border-b border-[#E4E7EA] dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-[#1C4370] dark:text-white">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-semibold">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-[#f0f4f5] dark:bg-slate-800">
              <Building2 className="w-3 h-3 text-[#1CAF9A]" />
              <span>AB1–AB4 Campus</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-[#1CAF9A]/10 text-[#1CAF9A] font-bold border border-[#1CAF9A]/20">
              {sections.length} Enrolled
            </span>
          </div>
        </div>

        {/* Timetable Scroll Area */}
        <div className="overflow-x-auto">
          <div className="min-w-[720px] relative">
            {/* Days Header */}
            <div
              className="grid gap-2 mb-2 pb-2 border-b border-[#E4E7EA] dark:border-slate-800"
              style={{
                gridTemplateColumns: `60px repeat(${weekdays.length}, minmax(0, 1fr))`,
              }}
            >
              <div className="text-[11px] font-black text-[#1C4370] dark:text-slate-400 uppercase tracking-wider text-center pt-1">
                Time
              </div>
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="text-center py-2 bg-[#f0f4f5] dark:bg-slate-800/80 rounded-2xl text-xs font-black text-[#1C4370] dark:text-[#1CAF9A]"
                >
                  <span>{DAY_LABELS[day]}</span>
                  <span className="text-[10px] block text-slate-400 font-normal">({day})</span>
                </div>
              ))}
            </div>

            {/* Time Slots Background & Placed Sections */}
            <div
              className="relative grid"
              style={{
                gridTemplateColumns: `60px repeat(${weekdays.length}, minmax(0, 1fr))`,
                height: `${TOTAL_HOURS * 60}px`,
              }}
            >
              {/* Left Time Column */}
              <div className="relative border-r border-[#E4E7EA] dark:border-slate-800 pr-2">
                {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => {
                  const hour = START_HOUR + i;
                  const mins = hour * 60;
                  return (
                    <div
                      key={hour}
                      className="absolute text-[10px] text-slate-500 dark:text-slate-400 font-bold -translate-y-2 w-full text-right"
                      style={{ top: `${(mins - START_MINS)}px` }}
                    >
                      {minutesToTime(mins)}
                    </div>
                  );
                })}
              </div>

              {/* Day Columns */}
              {weekdays.map((day) => {
                const daySections = sections.filter((s) => s.days.includes(day));

                return (
                  <div
                    key={day}
                    className="relative border-r last:border-r-0 border-[#E4E7EA]/60 dark:border-slate-800/80 px-1"
                  >
                    {/* Hour guide lines */}
                    {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full border-b border-dashed border-[#E4E7EA]/80 dark:border-slate-800/50"
                        style={{ top: `${(i + 1) * 60}px` }}
                      />
                    ))}

                    {/* Section Cards */}
                    {daySections.map((sec) => {
                      const topOffset = Math.max(0, sec.start - START_MINS);
                      const height = Math.max(35, sec.end - sec.start);
                      const color = colorMap.get(sec.courseCode) || COURSE_COLORS[0];
                      const isClashing = clashingIds.has(sec.id);

                      return (
                        <div
                          key={`${sec.id}-${day}`}
                          className={`absolute left-1 right-1 rounded-2xl p-2 border shadow-xs transition-all overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.01] ${
                            isClashing
                              ? "bg-rose-100 dark:bg-rose-950/80 border-[#D9534F] text-[#D9534F] ring-2 ring-[#D9534F]/40"
                              : `${color.bg} ${color.border} ${color.text}`
                          }`}
                          style={{
                            top: `${topOffset}px`,
                            height: `${height}px`,
                          }}
                          onClick={() => {
                            if (availableSectionsByCourse && onSwapSection) {
                              setSwapTarget(sec);
                            }
                          }}
                          title={`Click to swap section for ${sec.courseCode}`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-black text-xs tracking-tight">
                              {sec.courseCode}
                            </span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-lg bg-white/80 dark:bg-black/50 shadow-xs">
                              Sec {sec.sectionNo}
                            </span>
                          </div>

                          <div className="text-[10px] mt-1 space-y-0.5 leading-tight opacity-95 font-medium">
                            <div className="flex items-center justify-between">
                              <span>Room: {sec.room || "TBA"}</span>
                              <strong className="font-extrabold">{sec.faculty}</strong>
                            </div>
                            <div className="text-[9px] opacity-80">
                              {formatTimeRange(sec.start, sec.end)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section Swap Modal */}
      {swapTarget && availableSectionsByCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-[#E4E7EA] dark:border-slate-800 shadow-2xl">
            <h4 className="text-base font-extrabold text-[#1C4370] dark:text-white flex items-center justify-between">
              <span>Swap Section: {swapTarget.courseCode}</span>
              <button
                onClick={() => setSwapTarget(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Currently using <strong>Section {swapTarget.sectionNo}</strong> ({swapTarget.faculty}, {swapTarget.rawDays} {formatTimeRange(swapTarget.start, swapTarget.end)}). Choose an alternative section below:
            </p>

            <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
              {(availableSectionsByCourse[swapTarget.courseCode] || []).map((alt) => {
                const isCurrent = alt.id === swapTarget.id;
                const otherEnrolled = sections.filter((s) => s.id !== swapTarget.id);
                const clashCourse = otherEnrolled.find((other) => doSectionsClash(alt, other));

                return (
                  <div
                    key={alt.id}
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-colors ${
                      isCurrent
                        ? "bg-[#effaf7] dark:bg-[#072c29] border-[#1CAF9A]"
                        : "border-[#E4E7EA] dark:border-slate-800 hover:bg-[#f0f4f5] dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center space-x-1.5">
                        <span className="text-[#1C4370] dark:text-white">Section {alt.sectionNo}</span>
                        <span className="text-[10px] font-normal text-slate-500">
                          ({alt.faculty} • {alt.room || "TBA"})
                        </span>
                        {clashCourse && (
                          <span className="text-[9px] font-bold text-[#D9534F] bg-rose-50 px-1 rounded">
                            Clash w/ {clashCourse.courseCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {alt.rawDays} • {formatTimeRange(alt.start, alt.end)} • Seats: {alt.seats ?? "TBA"}
                      </div>
                    </div>

                    <button
                      disabled={isCurrent}
                      onClick={() => {
                        if (onSwapSection) {
                          onSwapSection(swapTarget, alt);
                        }
                        setSwapTarget(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        isCurrent
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-default"
                          : "bg-[#1CAF9A] hover:bg-[#168e7d] text-white shadow-xs"
                      }`}
                    >
                      {isCurrent ? "Active" : "Select"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
