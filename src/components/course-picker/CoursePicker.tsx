"use client";

import React, { useState, useEffect, useRef } from "react";
import { Course } from "@/lib/types";
import { Search, Plus, X, BookOpen, AlertCircle } from "lucide-react";

interface CoursePickerProps {
  selectedCourses: string[]; // course codes
  onSelectCourse: (code: string) => void;
  onRemoveCourse: (code: string) => void;
  maxCourses?: number;
  availableCourses?: Course[];
}

export function CoursePicker({
  selectedCourses,
  onSelectCourse,
  onRemoveCourse,
  maxCourses = 6,
  availableCourses = [],
}: CoursePickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = availableCourses.filter((c) => {
    if (selectedCourses.includes(c.code)) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toUpperCase();
    return c.code.toUpperCase().includes(q) || c.title.toUpperCase().includes(q);
  });

  const handleAdd = (code: string) => {
    if (selectedCourses.length >= maxCourses) return;
    onSelectCourse(code);
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleAdd(filtered[0].code);
    }
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Selected Course Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedCourses.map((code) => {
          const courseInfo = availableCourses.find((c) => c.code === code);
          return (
            <span
              key={code}
              className="inline-flex items-center space-x-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/70 border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-200 text-xs font-bold shadow-sm animate-fadeIn"
            >
              <span>{code}</span>
              {courseInfo && (
                <span className="text-[10px] font-normal text-primary-600 dark:text-primary-400">
                  ({courseInfo.credits} cr)
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemoveCourse(code)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-600 dark:text-primary-300 transition-colors"
                title="Remove course"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}

        {selectedCourses.length === 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
            No courses selected yet. Search and add courses below.
          </span>
        )}
      </div>

      {/* Input Field with Dropdown */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedCourses.length >= maxCourses
                ? `Max course limit reached (${maxCourses})`
                : "Type course code (e.g. CSE110, MAT101, ENG101)..."
            }
            disabled={selectedCourses.length >= maxCourses}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 transition-all shadow-sm"
          />
        </div>

        {/* Dropdown Options */}
        {isDropdownOpen && selectedCourses.length < maxCourses && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1 divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.slice(0, 15).map((course) => (
              <button
                key={course.code}
                type="button"
                onClick={() => handleAdd(course.code)}
                className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    {course.code}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    {course.title}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {course.credits} Credits
                  </span>
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-400">
                No matching courses found. Try another code or keyword.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>
          {selectedCourses.length} of {maxCourses} courses selected
        </span>
        {selectedCourses.length >= 5 && (
          <span className="text-amber-600 dark:text-amber-400 flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Standard advising load (15-18 credits)</span>
          </span>
        )}
      </div>
    </div>
  );
}
