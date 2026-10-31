"use client";

import React, { useState, useMemo } from "react";
import {
  calculateSemesterGPA,
  calculateCumulativeCGPA,
  calculateWhatIfGPA,
  WhatIfResult,
} from "@/lib/cgpa/calc";
import { EWU_GRADE_SCALE } from "@/lib/cgpa/scale";
import {
  GraduationCap,
  Plus,
  Trash2,
  Sparkles,
  Calculator,
  Target,
  BookOpen,
  Info,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface CourseRow {
  id: string;
  name: string;
  credits: number;
  grade: string;
  isRetake?: boolean;
}

export default function CGPACalculatorPage() {
  const [activeTab, setActiveTab] = useState<"semester" | "cumulative" | "whatif">("semester");

  // Mode 1: Semester GPA Course Rows
  const [semesterCourses, setSemesterCourses] = useState<CourseRow[]>([
    { id: "1", name: "CSE110", credits: 3, grade: "A+" },
    { id: "2", name: "CSE110L", credits: 1, grade: "A" },
    { id: "3", name: "MAT101", credits: 3, grade: "A-" },
    { id: "4", name: "ENG101", credits: 3, grade: "B+" },
  ]);

  // Mode 2: Cumulative CGPA Inputs
  const [prevCredits, setPrevCredits] = useState<number>(45);
  const [prevCGPA, setPrevCGPA] = useState<number>(3.45);
  const [cumulativeCourses, setCumulativeCourses] = useState<CourseRow[]>([
    { id: "c1", name: "CSE207", credits: 3, grade: "A" },
    { id: "c2", name: "CSE209", credits: 3, grade: "A-" },
    { id: "c3", name: "MAT102", credits: 3, grade: "B+" },
  ]);

  // Mode 3: What-if Target Solver Inputs
  const [currentCGPA, setCurrentCGPA] = useState<number>(3.30);
  const [completedCredits, setCompletedCredits] = useState<number>(60);
  const [targetCGPA, setTargetCGPA] = useState<number>(3.60);
  const [remainingCredits, setRemainingCredits] = useState<number>(60);

  // Computed results
  const semesterResult = useMemo(() => {
    return calculateSemesterGPA(semesterCourses);
  }, [semesterCourses]);

  const cumulativeResult = useMemo(() => {
    return calculateCumulativeCGPA(prevCredits, prevCGPA, cumulativeCourses);
  }, [prevCredits, prevCGPA, cumulativeCourses]);

  const whatIfResult = useMemo<WhatIfResult>(() => {
    return calculateWhatIfGPA(currentCGPA, completedCredits, targetCGPA, remainingCredits);
  }, [currentCGPA, completedCredits, targetCGPA, remainingCredits]);

  // Helpers to add/remove rows
  const addSemesterCourse = () => {
    setSemesterCourses([
      ...semesterCourses,
      { id: `sem-${Date.now()}`, name: "", credits: 3, grade: "A" },
    ]);
  };

  const removeSemesterCourse = (id: string) => {
    setSemesterCourses(semesterCourses.filter((c) => c.id !== id));
  };

  const addCumulativeCourse = () => {
    setCumulativeCourses([
      ...cumulativeCourses,
      { id: `cum-${Date.now()}`, name: "", credits: 3, grade: "A" },
    ]);
  };

  const removeCumulativeCourse = (id: string) => {
    setCumulativeCourses(cumulativeCourses.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
          <GraduationCap className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          <span>EWU CGPA & Target Calculator</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Accurately compute your semester GPA, cumulative standing, and graduation what-if targets based on East West University&apos;s official 10-tier scale.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("semester")}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "semester"
              ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Semester GPA</span>
        </button>

        <button
          onClick={() => setActiveTab("cumulative")}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "cumulative"
              ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Cumulative CGPA</span>
        </button>

        <button
          onClick={() => setActiveTab("whatif")}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "whatif"
              ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>What-If Target Solver</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calculator Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: SEMESTER GPA */}
          {activeTab === "semester" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Semester Course Grades
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add courses, select credits and letter grade earned.
                  </p>
                </div>

                {/* Score Preview Badge */}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Semester GPA
                  </span>
                  <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                    {semesterResult.gpa.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Course Rows */}
              <div className="space-y-2.5">
                {semesterCourses.map((c, index) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => {
                          const updated = [...semesterCourses];
                          updated[index].name = e.target.value;
                          setSemesterCourses(updated);
                        }}
                        placeholder={`Course ${index + 1} (e.g. CSE110)`}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                      />
                    </div>

                    <div className="col-span-3">
                      <select
                        value={c.credits}
                        onChange={(e) => {
                          const updated = [...semesterCourses];
                          updated[index].credits = Number(e.target.value);
                          setSemesterCourses(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                      >
                        <option value={1}>1.0 Credit (Lab)</option>
                        <option value={1.5}>1.5 Credits</option>
                        <option value={3}>3.0 Credits (Standard)</option>
                        <option value={4}>4.0 Credits</option>
                      </select>
                    </div>

                    <div className="col-span-3">
                      <select
                        value={c.grade}
                        onChange={(e) => {
                          const updated = [...semesterCourses];
                          updated[index].grade = e.target.value;
                          setSemesterCourses(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-primary-600 dark:text-primary-400"
                      >
                        {EWU_GRADE_SCALE.map((g) => (
                          <option key={g.grade} value={g.grade}>
                            {g.grade} ({g.point.toFixed(2)})
                          </option>
                        ))}
                        <option value="W">W (Withdrawn)</option>
                        <option value="I">I (Incomplete)</option>
                      </select>
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeSemesterCourse(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={addSemesterCourse}
                  className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 hover:bg-primary-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Course</span>
                </button>

                <div className="text-right text-xs text-slate-500">
                  Total Credits Attempted: <strong>{semesterResult.totalCredits}</strong> (Earned:{" "}
                  <strong>{semesterResult.earnedCredits}</strong>)
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUMULATIVE CGPA */}
          {activeTab === "cumulative" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Cumulative CGPA Calculator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Combine your prior academic standing with your new term.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Updated CGPA
                  </span>
                  <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                    {cumulativeResult.gpa.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Previous Record Inputs */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Previous Completed Credits:
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={prevCredits}
                    onChange={(e) => setPrevCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Previous CGPA:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={4.0}
                    value={prevCGPA}
                    onChange={(e) => setPrevCGPA(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  />
                </div>
              </div>

              {/* New term courses */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  New Semester Courses:
                </h4>
                {cumulativeCourses.map((c, index) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => {
                          const updated = [...cumulativeCourses];
                          updated[index].name = e.target.value;
                          setCumulativeCourses(updated);
                        }}
                        placeholder={`Course ${index + 1}`}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                      />
                    </div>

                    <div className="col-span-3">
                      <select
                        value={c.credits}
                        onChange={(e) => {
                          const updated = [...cumulativeCourses];
                          updated[index].credits = Number(e.target.value);
                          setCumulativeCourses(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                      >
                        <option value={1}>1.0 Credit</option>
                        <option value={3}>3.0 Credits</option>
                        <option value={4}>4.0 Credits</option>
                      </select>
                    </div>

                    <div className="col-span-3">
                      <select
                        value={c.grade}
                        onChange={(e) => {
                          const updated = [...cumulativeCourses];
                          updated[index].grade = e.target.value;
                          setCumulativeCourses(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-primary-600 dark:text-primary-400"
                      >
                        {EWU_GRADE_SCALE.map((g) => (
                          <option key={g.grade} value={g.grade}>
                            {g.grade} ({g.point.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeCumulativeCourse(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={addCumulativeCourse}
                  className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 hover:bg-primary-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Course</span>
                </button>

                <div className="text-right text-xs text-slate-500">
                  Total Completed: <strong>{cumulativeResult.totalCredits} Credits</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHAT-IF TARGET SOLVER */}
          {activeTab === "whatif" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  What-If Target CGPA Solver
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Find out exactly what average GPA you must achieve across your remaining credits to graduate with your dream CGPA.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Current CGPA:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={4.0}
                    value={currentCGPA}
                    onChange={(e) => setCurrentCGPA(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Completed Credits So Far:
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={completedCredits}
                    onChange={(e) => setCompletedCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Graduation CGPA:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={4.0}
                    value={targetCGPA}
                    onChange={(e) => setTargetCGPA(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-primary-600 dark:text-primary-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Remaining Credits to Graduate:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={remainingCredits}
                    onChange={(e) => setRemainingCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
              </div>

              {/* What-If Result Banner */}
              <div
                className={`p-5 rounded-2xl border text-sm space-y-2 ${
                  whatIfResult.isPossible
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                    : "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center space-x-1.5">
                    {whatIfResult.isPossible ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    )}
                    <span>Required GPA in Remaining Credits</span>
                  </span>

                  <span className="text-2xl font-black">
                    {whatIfResult.requiredGPA.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">{whatIfResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Official EWU Grade Scale Reference (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-primary-500" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Official EWU Grading Scale
              </h3>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-2 py-2 text-center">Grade</th>
                    <th className="px-2 py-2 text-right">Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {EWU_GRADE_SCALE.map((g) => (
                    <tr key={g.grade} className="hover:bg-slate-50/50">
                      <td className="px-3 py-1.5 text-[11px] text-slate-500">
                        {g.minMarks}% - {g.maxMarks < 100 ? `<${Math.ceil(g.maxMarks)}%` : "100%"}
                      </td>
                      <td className="px-2 py-1.5 text-center font-bold text-slate-900 dark:text-white">
                        {g.grade}
                      </td>
                      <td className="px-2 py-1.5 text-right font-semibold text-primary-600 dark:text-primary-400">
                        {g.point.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Retake Policy Note */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 space-y-1">
              <strong className="flex items-center space-x-1">
                <Info className="w-3.5 h-3.5" />
                <span>EWU Retake Policy:</span>
              </strong>
              <p className="leading-relaxed">
                When you retake a course at EWU, the <strong>newer grade replaces the old grade</strong> in computing cumulative CGPA. Both attempts remain recorded on transcripts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
