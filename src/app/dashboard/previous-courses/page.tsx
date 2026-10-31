"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Course, Section, Semester } from "@/lib/types";
import { formatTimeRange } from "@/lib/time";
import { History, Search, Calendar, User, Clock, BookOpen, Layers } from "lucide-react";

export default function PreviousCoursesPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("Summer 2026");
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchCode, setSearchCode] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string | null>("CSE110");

  const [sections, setSections] = useState<Section[]>([]);
  const [allSectionsMap, setAllSectionsMap] = useState<Record<string, Section[]>>({});
  const [loading, setLoading] = useState(true);

  // Load semesters & courses
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [semRes, courseRes] = await Promise.all([
          fetch("/api/semesters"),
          fetch("/api/courses"),
        ]);
        const semData = await semRes.json();
        const courseData = await courseRes.json();

        if (semData.semesters) setSemesters(semData.semesters);
        if (courseData.courses) setCourses(courseData.courses);
      } catch (err) {
        console.error("Failed to load archive metadata:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Fetch sections for all semesters to enable multi-semester offering history
  useEffect(() => {
    async function loadAllSemesterData() {
      if (semesters.length === 0) return;
      const map: Record<string, Section[]> = {};
      await Promise.all(
        semesters.map(async (s) => {
          try {
            const res = await fetch(`/api/sections?semester=${encodeURIComponent(s.name)}`);
            const data = await res.json();
            if (data.sections) {
              map[s.name] = data.sections;
            }
          } catch (e) {
            console.error(e);
          }
        })
      );
      setAllSectionsMap(map);
    }
    loadAllSemesterData();
  }, [semesters]);

  // Filter courses by search code
  const filteredCourses = useMemo(() => {
    if (!searchCode) return courses;
    const q = searchCode.toUpperCase();
    return courses.filter(
      (c) => c.code.toUpperCase().includes(q) || c.title.toUpperCase().includes(q)
    );
  }, [courses, searchCode]);

  // Offering history across semesters for selected course
  const offeringHistory = useMemo(() => {
    if (!selectedCourse) return [];
    const history: Array<{
      semester: string;
      sections: Section[];
    }> = [];

    for (const sem of semesters) {
      const semSections = allSectionsMap[sem.name] || [];
      const matching = semSections.filter(
        (s) => s.courseCode.toUpperCase() === selectedCourse.toUpperCase()
      );
      if (matching.length > 0) {
        history.push({
          semester: sem.name,
          sections: matching,
        });
      }
    }

    return history;
  }, [selectedCourse, semesters, allSectionsMap]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
          <History className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          <span>Previous Semesters Archive</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Look back across past semesters to analyze historical faculty assignments, timing patterns, and course frequency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Course Selector & Search */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Search course code or title..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredCourses.map((c) => {
              const isSelected = selectedCourse === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setSelectedCourse(c.code)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                    isSelected
                      ? "bg-primary-50 dark:bg-primary-950/70 border-primary-500 text-primary-900 dark:text-primary-100 font-bold shadow-xs"
                      : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div>
                    <div className="font-extrabold">{c.code}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {c.title}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {c.credits} cr
                  </span>
                </button>
              );
            })}

            {filteredCourses.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No matching courses</p>
            )}
          </div>
        </div>

        {/* Right Column: Historical Offerings Across Semesters */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCourse ? (
            <div className="space-y-4">
              {/* Course Header */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {selectedCourse}
                    </h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                      Offered in {offeringHistory.length} Semester
                      {offeringHistory.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {courses.find((c) => c.code === selectedCourse)?.title}
                  </p>
                </div>
              </div>

              {/* Semester by Semester History Cards */}
              {offeringHistory.length > 0 ? (
                <div className="space-y-4">
                  {offeringHistory.map((item) => (
                    <div
                      key={item.semester}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                          <Calendar className="w-4 h-4 text-primary-500" />
                          <span>{item.semester}</span>
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {item.sections.length} Section{item.sections.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {item.sections.map((sec) => (
                          <div
                            key={sec.id}
                            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                Section {sec.sectionNo}
                              </span>
                              <span className="font-black px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-[10px]">
                                {sec.rawDays}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                              <span className="flex items-center space-x-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <strong className="text-slate-700 dark:text-slate-300">
                                  {sec.faculty}
                                </strong>
                              </span>
                              <span>Room: {sec.room || "TBA"}</span>
                            </div>

                            <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeRange(sec.start, sec.end)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  No historical records found for {selectedCourse} in archived terms.
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              Select a course on the left to inspect its historical offerings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
