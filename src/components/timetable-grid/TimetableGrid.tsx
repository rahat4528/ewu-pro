"use client";

import React, { useRef, useState } from "react";
import { Day, Section } from "@/lib/types";
import { formatTimeRange, minutesToTime } from "@/lib/time";
import { DAY_LABELS, DAY_ORDER } from "@/lib/days";
import { doSectionsClash } from "@/lib/planner/clash";
import { Download, RefreshCw, Printer, AlertTriangle } from "lucide-react";
import { toPng } from "html-to-image";

interface TimetableGridProps {
  sections: Section[];
  onSwapSection?: (oldSection: Section, newSection: Section) => void;
  availableSectionsByCourse?: Record<string, Section[]>;
  title?: string;
  subtitle?: string;
}

const COURSE_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-950/70", border: "border-blue-400 dark:border-blue-700", text: "text-blue-900 dark:text-blue-200", chip: "bg-blue-500" },
  { bg: "bg-emerald-100 dark:bg-emerald-950/70", border: "border-emerald-400 dark:border-emerald-700", text: "text-emerald-900 dark:text-emerald-200", chip: "bg-emerald-500" },
  { bg: "bg-purple-100 dark:bg-purple-950/70", border: "border-purple-400 dark:border-purple-700", text: "text-purple-900 dark:text-purple-200", chip: "bg-purple-500" },
  { bg: "bg-amber-100 dark:bg-amber-950/70", border: "border-amber-400 dark:border-amber-700", text: "text-amber-900 dark:text-amber-200", chip: "bg-amber-500" },
  { bg: "bg-rose-100 dark:bg-rose-950/70", border: "border-rose-400 dark:border-rose-700", text: "text-rose-900 dark:text-rose-200", chip: "bg-rose-500" },
  { bg: "bg-cyan-100 dark:bg-cyan-950/70", border: "border-cyan-400 dark:border-cyan-700", text: "text-cyan-900 dark:text-cyan-200", chip: "bg-cyan-500" },
  { bg: "bg-indigo-100 dark:bg-indigo-950/70", border: "border-indigo-400 dark:border-indigo-700", text: "text-indigo-900 dark:text-indigo-200", chip: "bg-indigo-500" },
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

  // Time boundaries
  const START_HOUR = 8; // 08:00 AM = 480 mins
  const END_HOUR = 18;  // 06:00 PM = 1080 mins
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const START_MINS = START_HOUR * 60;
  const END_MINS = END_HOUR * 60;

  // Weekdays for EWU (Sunday - Thursday default)
  const weekdays: Day[] = ["SUN", "MON", "TUE", "WED", "THU"];
  // Check if any section has Friday or Saturday
  const hasFriday = sections.some((s) => s.days.includes("FRI"));
  const hasSaturday = sections.some((s) => s.days.includes("SAT"));
  if (hasFriday) weekdays.push("FRI");
  if (hasSaturday) weekdays.push("SAT");

  // Distinct course codes mapped to colors
  const courseCodes = Array.from(new Set(sections.map((s) => s.courseCode)));
  const colorMap = new Map<string, typeof COURSE_COLORS[0]>();
  courseCodes.forEach((code, idx) => {
    colorMap.set(code, COURSE_COLORS[idx % COURSE_COLORS.length]);
  });

  // Clash detection for manual swaps
  const clashingIds = new Set<string>();
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      if (doSectionsClash(sections[i], sections[j])) {
        clashingIds.add(sections[i].id);
        clashingIds.add(sections[j].id);
      }
    }
  }

  // Export to PNG image
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
      <div className="no-print flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="flex flex-wrap gap-1.5">
            {courseCodes.map((code) => {
              const theme = colorMap.get(code);
              return (
                <span
                  key={code}
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${theme?.bg} ${theme?.text} border ${theme?.border}`}
                >
                  <span className={`w-2 h-2 rounded-full ${theme?.chip}`} />
                  <span>{code}</span>
                </span>
              );
            })}
          </div>
          {clashingIds.size > 0 && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-bounce">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Time Clash Detected!</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportPng}
            disabled={exporting}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? "Exporting..." : "PNG Image"}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Grid Card */}
      <div
        ref={gridRef}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-4 sm:p-6"
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>{title}</span>
            <span className="text-xs font-normal text-slate-500">
              {sections.length} Course{sections.length === 1 ? "" : "s"} Enrolled
            </span>
          </h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Timetable Scroll Area */}
        <div className="overflow-x-auto">
          <div className="min-w-[720px] relative">
            {/* Days Header */}
            <div
              className="grid gap-2 mb-2 pb-2 border-b border-slate-200 dark:border-slate-800"
              style={{
                gridTemplateColumns: `60px repeat(${weekdays.length}, minmax(0, 1fr))`,
              }}
            >
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center pt-1">
                Time
              </div>
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="text-center py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
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
                height: `${TOTAL_HOURS * 60}px`, // 1px per minute
              }}
            >
              {/* Left Time Column & Horizontal Grid Lines */}
              <div className="relative border-r border-slate-200 dark:border-slate-800 pr-2">
                {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => {
                  const hour = START_HOUR + i;
                  const mins = hour * 60;
                  return (
                    <div
                      key={hour}
                      className="absolute text-[10px] text-slate-400 font-medium -translate-y-2 w-full text-right"
                      style={{ top: `${(mins - START_MINS)}px` }}
                    >
                      {minutesToTime(mins)}
                    </div>
                  );
                })}
              </div>

              {/* Day Columns */}
              {weekdays.map((day, dayIndex) => {
                // Find all sections on this day
                const daySections = sections.filter((s) => s.days.includes(day));

                return (
                  <div
                    key={day}
                    className="relative border-r last:border-r-0 border-slate-100 dark:border-slate-800/80 px-1"
                  >
                    {/* Hour dividing guide lines */}
                    {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full border-b border-dashed border-slate-100 dark:border-slate-800/50"
                        style={{ top: `${(i + 1) * 60}px` }}
                      />
                    ))}

                    {/* Placed Section Cards */}
                    {daySections.map((sec) => {
                      const topOffset = Math.max(0, sec.start - START_MINS);
                      const height = Math.max(35, sec.end - sec.start);
                      const color = colorMap.get(sec.courseCode) || COURSE_COLORS[0];
                      const isClashing = clashingIds.has(sec.id);

                      return (
                        <div
                          key={`${sec.id}-${day}`}
                          className={`absolute left-1 right-1 rounded-xl p-2 border shadow-sm transition-all overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.01] ${
                            isClashing
                              ? "bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100 ring-2 ring-rose-400 ring-offset-1"
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
                            <span className="font-extrabold text-xs tracking-tight">
                              {sec.courseCode}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/40">
                              Sec {sec.sectionNo}
                            </span>
                          </div>

                          <div className="text-[10px] mt-1 space-y-0.5 leading-tight opacity-90 font-medium">
                            <div className="flex items-center justify-between">
                              <span>Room: {sec.room || "TBA"}</span>
                              <span className="font-semibold">{sec.faculty}</span>
                            </div>
                            <div className="text-[9px] opacity-75">
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Swap Section: {swapTarget.courseCode}</span>
              <button
                onClick={() => setSwapTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
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
                // Check if swapping with this would clash with any other enrolled course
                const wouldClash = sections
                  .filter((s) => s.id !== swapTarget.id)
                  .some((other) => doSectionsClash(alt, other));

                return (
                  <div
                    key={alt.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                      isCurrent
                        ? "bg-primary-50 dark:bg-primary-950/50 border-primary-300 dark:border-primary-700"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center space-x-1.5">
                        <span>Section {alt.sectionNo}</span>
                        <span className="text-[10px] font-normal text-slate-500">
                          ({alt.faculty} • {alt.room || "TBA"})
                        </span>
                        {wouldClash && (
                          <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-1 rounded">
                            Clash!
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
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
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        isCurrent
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-default"
                          : "bg-primary-600 hover:bg-primary-700 text-white"
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
