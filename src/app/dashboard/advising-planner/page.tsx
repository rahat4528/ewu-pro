"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Course, Day, PlannerPreferences, Section, TimetablePlan } from "@/lib/types";
import { solveTimetables, SolveResult } from "@/lib/planner/solve";
import { parseNaturalLanguagePreferences } from "@/lib/planner/nlp";
import { CoursePicker } from "@/components/course-picker/CoursePicker";
import { TimetableGrid } from "@/components/timetable-grid/TimetableGrid";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Share2,
  RefreshCw,
  Trophy,
  Coffee,
  Sun,
  Moon,
  Wand2,
  Copy,
} from "lucide-react";

function PlannerContent() {
  const searchParams = useSearchParams();
  const [semester, setSemester] = useState("Fall 2026");
  const [semesters] = useState<string[]>(["Fall 2026", "Summer 2026", "Spring 2026"]);
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
  const [earliestStart, setEarliestStart] = useState<number>(480);
  const [latestEnd, setLatestEnd] = useState<number>(1080);
  const [preferredFaculty, setPreferredFaculty] = useState<string>("MAR, AH");
  const [avoidedFaculty, setAvoidedFaculty] = useState<string>("");
  const [seatsOnly, setSeatsOnly] = useState<boolean>(false);

  // Natural language prompt state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [appliedAiTags, setAppliedAiTags] = useState<string[]>([]);

  // Solver results
  const [solveResult, setSolveResult] = useState<SolveResult | null>(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

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
        if (secData.sections) {
          setAllSections(secData.sections);

          // Check if URL has a shared plan query param e.g. ?plan=sec1,sec2
          const sharedPlanParam = searchParams.get("plan");
          if (sharedPlanParam) {
            const ids = sharedPlanParam.split(",").map((s) => s.trim());
            const matchedSections = secData.sections.filter((s: Section) => ids.includes(s.id));
            if (matchedSections.length > 0) {
              setCurrentGridSections(matchedSections);
              const courseCodes = Array.from(new Set(matchedSections.map((s: Section) => s.courseCode)));
              setSelectedCourses(courseCodes as string[]);
              setNotificationMsg("Shared routine loaded from URL link!");
              setTimeout(() => setNotificationMsg(null), 4000);
            }
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    }
    initData();
  }, [semester, searchParams]);

  // Run solver
  const handleSolve = () => {
    if (selectedCourses.length === 0) return;

    setIsSolving(true);
    setNotificationMsg(null);

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

    setTimeout(() => {
      const result = solveTimetables(coursesSections, prefs, 150, allSections);
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

  useEffect(() => {
    if (allSections.length > 0 && selectedCourses.length > 0 && !solveResult && !searchParams.get("plan")) {
      handleSolve();
    }
  }, [allSections]);

  const handleSelectPlan = (idx: number) => {
    setSelectedPlanIndex(idx);
    if (solveResult?.plans[idx]) {
      setCurrentGridSections(solveResult.plans[idx].sections);
    }
  };

  const availableSectionsByCourse = useMemo(() => {
    const map: Record<string, Section[]> = {};
    for (const code of selectedCourses) {
      map[code] = allSections.filter(
        (s) => s.courseCode.toUpperCase() === code.toUpperCase()
      );
    }
    return map;
  }, [selectedCourses, allSections]);

  const handleSwapSection = (oldSection: Section, newSection: Section) => {
    setCurrentGridSections((prev) =>
      prev.map((s) => (s.id === oldSection.id ? newSection : s))
    );
  };

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
        setNotificationMsg("Routine saved successfully to your Saved Plans!");
        setTimeout(() => setNotificationMsg(null), 4000);
      }
    } catch (e) {
      console.error("Save plan failed:", e);
    }
  };

  // Copy shareable routine link
  const handleShareLink = () => {
    if (currentGridSections.length === 0) return;
    const ids = currentGridSections.map((s) => s.id).join(",");
    const shareUrl = `${window.location.origin}/dashboard/advising-planner?plan=${encodeURIComponent(ids)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setNotificationMsg("Share link copied to clipboard! Anyone with the link can view this routine.");
      setTimeout(() => setNotificationMsg(null), 4000);
    });
  };

  // AI NLP Handler
  const handleApplyAiQuery = () => {
    if (!aiPrompt.trim()) return;
    const res = parseNaturalLanguagePreferences(aiPrompt);
    if (res.preferences.freeDays) setFreeDays(res.preferences.freeDays);
    if (res.preferences.earliestStart) setEarliestStart(res.preferences.earliestStart);
    if (res.preferences.latestEnd) setLatestEnd(res.preferences.latestEnd);
    if (res.preferences.preferredFaculty) setPreferredFaculty(res.preferences.preferredFaculty.join(", "));
    if (res.preferences.avoidedFaculty) setAvoidedFaculty(res.preferences.avoidedFaculty.join(", "));
    if (res.preferences.seatsOnly !== undefined) setSeatsOnly(res.preferences.seatsOnly);
    setAppliedAiTags(res.appliedTags);
  };

  const applyPreset = (preset: "compact" | "late" | "fewestGaps") => {
    if (preset === "compact") {
      setFreeDays(["SUN"]);
      setEarliestStart(480);
      setLatestEnd(1080);
    } else if (preset === "late") {
      setFreeDays([]);
      setEarliestStart(660);
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
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C4370] dark:text-white flex items-center space-x-2">
            <Calendar className="w-7 h-7 text-[#1CAF9A]" />
            <span>Advising Routine Planner</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pick your desired courses, tune your schedule preferences, and instantly receive ranked clash-free routines.
          </p>
        </div>

        {/* Semester Selector & Share Action */}
        <div className="flex items-center space-x-2">
          {currentGridSections.length > 0 && (
            <button
              onClick={handleShareLink}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#1CAF9A] hover:bg-[#168e7d] text-white shadow-xs transition-all"
              title="Share routine by URL link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
          )}

          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-[#E4E7EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1C4370] dark:text-white shadow-xs"
          >
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Natural Language Prompt Assistant */}
      <div className="bg-gradient-to-r from-[#1C4370]/10 via-[#1CAF9A]/10 to-transparent p-4 rounded-2xl border border-[#1CAF9A]/30 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center space-x-2 text-[#1C4370] dark:text-[#1CAF9A] font-extrabold text-xs whitespace-nowrap">
          <Wand2 className="w-4 h-4 text-[#1CAF9A]" />
          <span>AI Query Assistant:</span>
        </div>
        <div className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApplyAiQuery()}
            placeholder="Type in plain English (e.g. 'no Sunday classes, afternoons only, prefer MAR')..."
            className="flex-1 px-3 py-1.5 rounded-xl border border-[#E4E7EA] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1CAF9A]"
          />
          <button
            type="button"
            onClick={handleApplyAiQuery}
            className="px-3.5 py-1.5 bg-[#1CAF9A] hover:bg-[#168e7d] text-white font-bold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            Apply
          </button>
        </div>

        {appliedAiTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {appliedAiTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1CAF9A] text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Course Selection Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E7EA] dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1C4370] dark:text-white flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#1C4370] text-[#1CAF9A] text-xs flex items-center justify-center font-black">
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E7EA] dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1C4370] dark:text-white flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#1C4370] text-[#1CAF9A] text-xs flex items-center justify-center font-black">
                  2
                </span>
                <span>Preferences & Weights</span>
              </h2>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => applyPreset("compact")}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f0f4f5] dark:bg-slate-800 hover:bg-slate-200 text-[#1C4370] dark:text-[#1CAF9A]"
                >
                  Compact
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("late")}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f0f4f5] dark:bg-slate-800 hover:bg-slate-200 text-[#1C4370] dark:text-[#1CAF9A]"
                >
                  Late Start
                </button>
              </div>
            </div>

            {/* Free Days Off */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Coffee className="w-3.5 h-3.5 text-[#F0AD4E]" />
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isChecked
                          ? "bg-[#1CAF9A] text-white shadow-xs"
                          : "bg-[#f0f4f5] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
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
                  <Sun className="w-3 h-3 text-[#F0AD4E]" />
                  <span>Earliest Start</span>
                </label>
                <select
                  value={earliestStart}
                  onChange={(e) => setEarliestStart(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-xl border border-[#E4E7EA] dark:border-slate-700 bg-[#f0f4f5] dark:bg-slate-800 text-xs font-medium"
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
                  <Moon className="w-3 h-3 text-[#1C4370]" />
                  <span>Latest Finish</span>
                </label>
                <select
                  value={latestEnd}
                  onChange={(e) => setLatestEnd(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-xl border border-[#E4E7EA] dark:border-slate-700 bg-[#f0f4f5] dark:bg-slate-800 text-xs font-medium"
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
                  Preferred Faculty Initials:
                </label>
                <input
                  type="text"
                  value={preferredFaculty}
                  onChange={(e) => setPreferredFaculty(e.target.value)}
                  placeholder="e.g. MAR, AH, TSH"
                  className="w-full mt-0.5 px-3 py-1.5 rounded-xl border border-[#E4E7EA] dark:border-slate-700 bg-[#f0f4f5] dark:bg-slate-800 text-xs"
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
                  className="w-full mt-0.5 px-3 py-1.5 rounded-xl border border-[#E4E7EA] dark:border-slate-700 bg-[#f0f4f5] dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Open Seats Toggle */}
            <label className="flex items-center space-x-2 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={seatsOnly}
                onChange={(e) => setSeatsOnly(e.target.checked)}
                className="rounded text-[#1CAF9A] focus:ring-[#1CAF9A] w-4 h-4"
              />
              <span>Only pick sections with open seats</span>
            </label>

            <button
              type="button"
              onClick={handleSolve}
              disabled={isSolving || selectedCourses.length === 0}
              className="w-full py-3.5 rounded-2xl bg-[#1C4370] hover:bg-[#143154] text-white font-extrabold text-sm shadow-md shadow-[#1C4370]/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isSolving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#1CAF9A]" />
                  <span>Searching clash-free routines...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#1CAF9A]" />
                  <span>Generate Clash-Free Routines</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {notificationMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{notificationMsg}</span>
              </div>
            </div>
          )}

          {solveResult && solveResult.plans.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E7EA] dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-[#1C4370] dark:text-white flex items-center space-x-1.5">
                    <Trophy className="w-4 h-4 text-[#F0AD4E]" />
                    <span>Top Ranked Routines ({solveResult.plans.length} Found)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ranked by free days, minimal gaps, and your faculty preferences.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f0f4f5] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#1CAF9A]" />
                    <span>Share</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSavePlan}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#effaf7] dark:bg-[#072c29] text-[#1CAF9A] hover:bg-[#d6f3ed] transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save Plan</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
                {solveResult.plans.slice(0, 10).map((plan, idx) => {
                  const isSelected = selectedPlanIndex === idx;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handleSelectPlan(idx)}
                      className={`flex-shrink-0 p-3 rounded-2xl border text-left text-xs transition-all w-48 ${
                        isSelected
                          ? "bg-[#effaf7] dark:bg-[#072c29] border-[#1CAF9A] ring-2 ring-[#1CAF9A]/30"
                          : "bg-[#f0f4f5]/60 dark:bg-slate-800/40 border-[#E4E7EA] dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-extrabold">
                        <span className="text-[#1C4370] dark:text-white">
                          Routine #{idx + 1}
                        </span>
                        <span className="text-[10px] text-[#1CAF9A]">
                          Score: {plan.score}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center justify-between">
                          <span>Days Off:</span>
                          <strong className="text-[#5cb85c]">
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

          {solveResult && solveResult.plans.length === 0 && (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/60 rounded-3xl border border-rose-200 dark:border-rose-900 space-y-3">
              <div className="flex items-center space-x-2 text-[#D9534F] font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>No Clash-Free Routine Possible</span>
              </div>
              <p className="text-xs text-[#D9534F] leading-relaxed">
                {solveResult.message}
              </p>
              {solveResult.conflictPair && (
                <div className="text-xs text-rose-800 bg-white/70 p-3 rounded-2xl border border-rose-200">
                  <strong>Conflict Analysis:</strong> {solveResult.conflictPair.courseA} and{" "}
                  {solveResult.conflictPair.courseB} clash in {solveResult.conflictPair.count}% of their sections.
                </div>
              )}
            </div>
          )}

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

export default function AdvisingPlannerPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading advising planner...</div>}>
      <PlannerContent />
    </Suspense>
  );
}
