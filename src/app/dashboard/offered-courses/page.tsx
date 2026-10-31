"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Section, Semester } from "@/lib/types";
import { filterSections, groupSectionsByTiming, GroupedSectionsRow } from "@/lib/data/store";
import { formatTimeRange } from "@/lib/time";
import { SectionChip } from "@/components/section-chip/SectionChip";
import {
  Search,
  Filter,
  Clock,
  Calendar,
  Users,
  Grid,
  List,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function OfferedCoursesPage() {
  const [semester, setSemester] = useState("Fall 2026");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [hasSeatsOnly, setHasSeatsOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");

  // Selected section modal/drawer
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  // Fetch published semesters
  useEffect(() => {
    async function loadSemesters() {
      try {
        const res = await fetch("/api/semesters");
        const data = await res.json();
        if (data.semesters) {
          setSemesters(data.semesters);
        }
      } catch (e) {
        console.error("Failed to load semesters:", e);
      }
    }
    loadSemesters();
  }, []);

  // Fetch sections for chosen semester
  useEffect(() => {
    async function loadSections() {
      try {
        setLoading(true);
        const res = await fetch(`/api/sections?semester=${encodeURIComponent(semester)}`);
        const data = await res.json();
        if (data.sections) {
          setSections(data.sections);
        }
      } catch (e) {
        console.error("Failed to load sections:", e);
      } finally {
        setLoading(false);
      }
    }
    loadSections();
  }, [semester]);

  // Client-side filtering for zero-latency response
  const filteredSections = useMemo(() => {
    return filterSections(sections, {
      query: searchQuery,
      day: selectedDay,
      faculty: facultyFilter,
      hasSeats: hasSeatsOnly,
    });
  }, [sections, searchQuery, selectedDay, facultyFilter, hasSeatsOnly]);

  // Pre-grouped timing rows
  const groupedRows = useMemo(() => {
    return groupSectionsByTiming(filteredSections);
  }, [filteredSections]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Offered Courses</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
              {semester}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse all sections for the semester, grouped cleanly by identical class timings.
          </p>
        </div>

        {/* Semester Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-500">Semester:</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500"
          >
            {semesters.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} {s.published ? "" : "(Draft)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Query */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, title, room..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Day Filter */}
          <div className="relative">
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="">All Days</option>
              <option value="ST">ST (Sun, Tue)</option>
              <option value="MW">MW (Mon, Wed)</option>
              <option value="TR">TR (Tue, Thu)</option>
              <option value="SR">SR (Sun, Thu)</option>
              <option value="SUN">Sunday</option>
              <option value="MON">Monday</option>
              <option value="TUE">Tuesday</option>
              <option value="WED">Wednesday</option>
              <option value="THU">Thursday</option>
            </select>
          </div>

          {/* Faculty Initial Filter */}
          <div className="relative">
            <input
              type="text"
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              placeholder="Faculty Initials (e.g. MAR, TSH)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Seats only & View Mode Toggle */}
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSeatsOnly}
                onChange={(e) => setHasSeatsOnly(e.target.checked)}
                className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
              />
              <span>Has Open Seats</span>
            </label>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode("grouped")}
                className={`p-1.5 rounded-md text-xs font-semibold ${
                  viewMode === "grouped"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Grouped by Timing"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md text-xs font-semibold ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Tabular List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count & Quick Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing <strong>{filteredSections.length}</strong> sections across{" "}
            <strong>{groupedRows.length}</strong> distinct timing slots
          </span>
          {(searchQuery || selectedDay || facultyFilter || hasSeatsOnly) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDay("");
                setFacultyFilter("");
                setHasSeatsOnly(false);
              }}
              className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-500" />
          <p className="text-xs text-slate-500">Loading offered courses...</p>
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">No sections found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No sections match your active filters in {semester}. Try clearing the search or changing parameters.
          </p>
        </div>
      ) : viewMode === "grouped" ? (
        /* Grouped by Timing View (Blueprint Headline Feature 1) */
        <div className="space-y-4">
          {groupedRows.map((group) => (
            <div
              key={group.groupKey}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:border-slate-300 transition-colors"
            >
              {/* Group Timing Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-200">
                    {group.rawDays}
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTimeRange(group.start, group.end)}</span>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  {group.sections.length} Section{group.sections.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* Sections Chips in this timing row */}
              <div className="flex flex-wrap gap-2.5">
                {group.sections.map((sec) => (
                  <SectionChip
                    key={sec.id}
                    section={sec}
                    onClick={() => setActiveSection(sec)}
                    selected={activeSection?.id === sec.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Tabular Table View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Course Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-3 py-3">Sec</th>
                  <th className="px-3 py-3">Days</th>
                  <th className="px-4 py-3">Timing</th>
                  <th className="px-3 py-3">Room</th>
                  <th className="px-3 py-3">Faculty</th>
                  <th className="px-3 py-3">Seats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredSections.map((sec) => (
                  <tr
                    key={sec.id}
                    onClick={() => setActiveSection(sec)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {sec.courseCode}
                    </td>
                    <td className="px-4 py-3 truncate max-w-xs">{sec.courseTitle || "-"}</td>
                    <td className="px-3 py-3 font-semibold">{sec.sectionNo}</td>
                    <td className="px-3 py-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                        {sec.rawDays}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatTimeRange(sec.start, sec.end)}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{sec.room || "TBA"}</td>
                    <td className="px-3 py-3 font-semibold text-primary-600 dark:text-primary-400">
                      {sec.faculty}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          (sec.seats ?? 0) <= 0
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {sec.seats ?? 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeSection && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                  {activeSection.semester}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {activeSection.courseCode} — Section {activeSection.sectionNo}
                </h3>
                {activeSection.courseTitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{activeSection.courseTitle}</p>
                )}
              </div>
              <button
                onClick={() => setActiveSection(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Faculty</span>
                <strong className="text-slate-800 dark:text-slate-200 text-sm">
                  {activeSection.faculty}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Classroom</span>
                <strong className="text-slate-800 dark:text-slate-200 text-sm">
                  {activeSection.room || "TBA"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Days</span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {activeSection.rawDays} ({activeSection.days.join(", ")})
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Timing</span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {formatTimeRange(activeSection.start, activeSection.end)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Available Seats</span>
                <strong
                  className={
                    (activeSection.seats ?? 0) > 0 ? "text-emerald-600" : "text-rose-600"
                  }
                >
                  {activeSection.seats ?? 0} / {activeSection.capacity ?? 35}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Credits</span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {activeSection.credits ?? 3} Credits
                </strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveSection(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
