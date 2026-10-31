"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Course, Day, PlannerPreferences, Section, TimetablePlan } from "@/lib/types";
import { solveTimetables, SolveResult } from "@/lib/planner/solve";
import { CoursePicker } from "@/components/course-picker/CoursePicker";
import { TimetableGrid } from "@/components/timetable-grid/TimetableGrid";
import { formatTimeRange, minutesToTime } from "@/lib/time";
import {
  Calendar,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Share2,
  RefreshCw,
  Trophy,
  Coffee,
  Sun,
  Moon,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function AdvisingPlannerPage() {
  const [semester, setSemester] = useState("Fall 2026");
  const [semesters, setSemesters] = useState<string[]>(["Fall 2026", "Summer 2026", "Spring 2026"]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([
    "CSE110",
    "CSE207",
    "MAT101",
    "ENG101",
  ]);

  // Preferences
  const [freeDays, setFreeDays] = useState<Day[]>([]);
  const [earliestStart, setEarliestStart] = useState<number>(480); // 08:00 AM
  const [latestEnd, setLatestEnd] = useState<number>(1080); // 06:00 PM
  const [preferredFaculty, setPreferredFaculty] = useState<string>("MAR, AH");
  const [avoidedFaculty, setAvoidedFaculty] = useState<string>("");
  const [seatsOnly, setSeatsOnly] = useState<boolean>(false);

  // Solver results
  const [solveResult, setSolveResult] = useState<SolveResult | null>(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Working sections for interactive swapping
  const [currentGridSections, setCurrentGridSections] = useState<Section[]>([]);

  // Load catalog & semester data
  useEffect(() => {
    async function initData() {
      try {
        const [courseRes, secRes] = await Promise.all([
          fetch("/api/courses"),
          fetch(`/api/sections?semester=${encodeURIComponent(semester)}`),
        ]);
        const courseData = await courseRes.json();
        const secData = await secRes.json();

        if (courseData.courses) setAvailableCourses(courseData.courses);
        if (secData.sections) setAllSections(secData.sections);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    }
    initData();
  }, [semester]);

  // Run solver
  const handleSolve = () => {
    if (selectedCourses.length === 0) return;

    setIsSolving(true);
    setSaveSuccessMsg(null);

    // Group sections by requested course codes
    const coursesSections: Section[][] = [];
    const missing: string[] = [];

    for (const code of selectedCourses) {
      const matching = allSections.filter(
        (s) => s.courseCode.toUpperCase() === code.toUpperCase()
      );
      if (matching.length === 0) {
        missing.push(code);
      } else {
        coursesSections.push(matching);
      }
    }

    if (missing.length > 0) {
      setIsSolving(false);
      setSolveResult({
        plans: [],
        totalCombinationsSearched: 0,
        message: `No offered sections found in ${semester} for: ${missing.join(", ")}`,
      });
      return;
    }

    const prefs: PlannerPreferences = {
      freeDays,
      earliestStart,
      latestEnd,
      preferredFaculty: preferredFaculty.split(",").map((s) => s.trim()).filter(Boolean),
      avoidedFaculty: avoidedFaculty.split(",").map((s) => s.trim()).filter(Boolean),
      seatsOnly,
    };

    // Fast local solve
    setTimeout(() => {
      const result = solveTimetables(coursesSections, prefs, 150);
      setSolveResult(result);
      setSelectedPlanIndex(0);
      if (result.plans.length > 0) {
        setCurrentGridSections(result.plans[0].sections);
      } else {
        setCurrentGridSections([]);
      }
      setIsSolving(false);
    }, 100);
  };

  // Run initial solve when data is loaded
  useEffect(() => {
    if (allSections.length > 0 && selectedCourses.length > 0 && !solveResult) {
      handleSolve();
    }
  }, [allSections]);

  // Handle plan selection
  const handleSelectPlan = (idx: number) => {
    setSelectedPlanIndex(idx);
    if (solveResult?.plans[idx]) {
      setCurrentGridSections(solveResult.plans[idx].sections);
    }
  };

  // Available sections grouped by course for swapping
  const availableSectionsByCourse = useMemo(() => {
    const map: Record<string, Section[]> = {};
    for (const code of selectedCourses) {
      map[code] = allSections.filter(
        (s) => s.courseCode.toUpperCase() === code.toUpperCase()
      );
    }
    return map;
  }, [selectedCourses, allSections]);

  // Handle manual swap
  const handleSwapSection = (oldSection: Section, newSection: Section) => {
    setCurrentGridSections((prev) =>
      prev.map((s) => (s.id === oldSection.id ? newSection : s))
    );
  };

  // Save Plan
  const handleSavePlan = async () => {
    if (currentGridSections.length === 0) return;
    try {
      const planName = `Routine (${selectedCourses.join(", ")})`;
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planName,
          semester,
          sections: currentGridSections,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg("Routine saved successfully to your Saved Plans!");
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error("Save plan failed:", e);
    }
  };

  // Preset Handlers
  const applyPreset = (preset: "compact" | "late" | "fewestGaps") => {
    if (preset === "compact") {
      setFreeDays(["SUN"]);
      setEarliestStart(480);
      setLatestEnd(1080);
    } else if (preset === "late") {
      setFreeDays([]);
      setEarliestStart(660); // 11:00 AM+
      setLatestEnd(1080);
    } else if (preset === "fewestGaps") {
      setFreeDays([]);
      setEarliestStart(480);
      setLatestEnd(900);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Calendar className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            <span>Advising Routine Planner</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pick your desired courses, tune your schedule preferences, and instantly receive ranked clash-free routines.
          </p>
        </div>

        {/* Semester Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-500">Advising For:</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm"
          >
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Course Picker & Preferences (4 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Course Selection Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 text-xs flex items-center justify-center font-black">
                  1
                </span>
                <span>Select Desired Courses</span>
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                {selectedCourses.length} Selected
              </span>
            </div>

            <CoursePicker
              selectedCourses={selectedCourses}
              onSelectCourse={(code) => setSelectedCourses([...selectedCourses, code])}
              onRemoveCourse={(code) =>
                setSelectedCourses(selectedCourses.filter((c) => c !== code))
              }
              availableCourses={availableCourses}
              maxCourses={6}
            />
          </div>

          {/* 2. Preferences Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 text-xs flex items-center justify-center font-black">
                  2
                </span>
                <span>Preferences & Weights</span>
              </h2>

              {/* Quick Presets */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => applyPreset("compact")}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  title="Optimize for days off"
                >
                  Compact
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("late")}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  title="No early morning 8:30 starts"
                >
                  Late Start
                </button>
              </div>
            </div>

            {/* Free Days Off */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Coffee className="w-3.5 h-3.5 text-amber-500" />
                <span>Preferred Day(s) Off:</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(["SUN", "MON", "TUE", "WED", "THU"] as Day[]).map((day) => {
                  const isChecked = freeDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setFreeDays(
                          isChecked ? freeDays.filter((d) => d !== day) : [...freeDays, day]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isChecked
                          ? "bg-primary-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Boundaries */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>Earliest Start</span>
                </label>
                <select
                  value={earliestStart}
                  onChange={(e) => setEarliestStart(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                >
                  <option value={480}>08:00 AM (Any)</option>
                  <option value={510}>08:30 AM</option>
                  <option value={610}>10:10 AM</option>
                  <option value={710}>11:50 AM</option>
                  <option value={810}>01:30 PM</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                  <Moon className="w-3 h-3 text-indigo-400" />
                  <span>Latest Finish</span>
                </label>
                <select
                  value={latestEnd}
                  onChange={(e) => setLatestEnd(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                >
                  <option value={1080}>06:00 PM (Any)</option>
                  <option value={1000}>04:40 PM</option>
                  <option value={900}>03:00 PM</option>
                  <option value={800}>01:20 PM</option>
                </select>
              </div>
            </div>

            {/* Faculty Preferences */}
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-500">
                  Preferred Faculty Initials (comma separated):
                </label>
                <input
                  type="text"
                  value={preferredFaculty}
                  onChange={(e) => setPreferredFaculty(e.target.value)}
                  placeholder="e.g. MAR, AH, TSH"
                  className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500">
                  Avoided Faculty Initials:
                </label>
                <input
                  type="text"
                  value={avoidedFaculty}
                  onChange={(e) => setAvoidedFaculty(e.target.value)}
                  placeholder="e.g. TBA"
                  className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Open Seats Toggle */}
            <label className="flex items-center space-x-2 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={seatsOnly}
                onChange={(e) => setSeatsOnly(e.target.checked)}
                className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
              />
              <span>Only pick sections with open seats</span>
            </label>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleSolve}
              disabled={isSolving || selectedCourses.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-extrabold text-sm shadow-md shadow-primary-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isSolving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching combinations...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Clash-Free Routines</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Ranked Results List & Active Visual Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Notification banner for plan save */}
          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl flex items-center justify-between animate-fadeIn">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            </div>
          )}

          {/* Results Summary & Schedule Selector */}
          {solveResult && solveResult.plans.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Top Ranked Combinations ({solveResult.plans.length} Found)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ranked by free days, minimal gaps, and your faculty preferences.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 hover:bg-primary-100 transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Plan</span>
                </button>
              </div>

              {/* Horizontal scroll of top ranked plans */}
              <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
                {solveResult.plans.slice(0, 10).map((plan, idx) => {
                  const isSelected = selectedPlanIndex === idx;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handleSelectPlan(idx)}
                      className={`flex-shrink-0 p-3 rounded-xl border text-left text-xs transition-all w-48 ${
                        isSelected
                          ? "bg-primary-50 dark:bg-primary-950/70 border-primary-500 ring-2 ring-primary-500/20"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-extrabold">
                        <span className="text-slate-900 dark:text-white">
                          Schedule #{idx + 1}
                        </span>
                        <span className="text-[10px] text-primary-600 dark:text-primary-400">
                          Score: {plan.score}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center justify-between">
                          <span>Days Off:</span>
                          <strong className="text-emerald-600">
                            {plan.metrics.freeDaysCount} Days
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Total Gaps:</span>
                          <span>{plan.metrics.totalGapMinutes} mins</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conflict Warning If 0 Plans Found */}
          {solveResult && solveResult.plans.length === 0 && (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/60 rounded-2xl border border-rose-200 dark:border-rose-900 space-y-3">
              <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>No Clash-Free Routine Possible</span>
              </div>
              <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                {solveResult.message}
              </p>
              {solveResult.conflictPair && (
                <div className="text-xs text-rose-700 dark:text-rose-300 bg-white/60 dark:bg-black/30 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                  <strong>Conflict Analysis:</strong> {solveResult.conflictPair.courseA} and{" "}
                  {solveResult.conflictPair.courseB} clash in {solveResult.conflictPair.count}% of their sections.
                  Try choosing an alternate section or replacing one course.
                </div>
              )}
            </div>
          )}

          {/* Active Visual Grid View */}
          {currentGridSections.length > 0 && (
            <TimetableGrid
              sections={currentGridSections}
              onSwapSection={handleSwapSection}
              availableSectionsByCourse={availableSectionsByCourse}
              title={`Selected Schedule (${selectedCourses.length} Courses)`}
              subtitle="Click any section card to swap with an alternative section"
            />
          )}
        </div>
      </div>
    </div>
  );
}
