"use client";

import React, { useState, useEffect, useRef } from "react";
import { Course } from "@/lib/types";
import { Search, Plus, X, AlertCircle } from "lucide-react";

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
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Selected Course Chips */}
      <div className="flex flex-wrap items-center gap-2" aria-label="Selected courses list">
        {selectedCourses.map((code) => {
          const courseInfo = availableCourses.find((c) => c.code === code);
          return (
            <span
              key={code}
              className="inline-flex items-center space-x-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-[#1C4370]/10 dark:bg-[#1C4370]/30 border border-[#1C4370]/20 text-[#1C4370] dark:text-[#1CAF9A] text-xs font-bold shadow-xs animate-fadeIn"
            >
              <span>{code}</span>
              {courseInfo && (
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                  ({courseInfo.credits} cr)
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemoveCourse(code)}
                aria-label={`Remove ${code}`}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#1C4370]/20 dark:hover:bg-slate-700 text-[#1C4370] dark:text-[#1CAF9A] transition-colors focus:outline-hidden focus:ring-1 focus:ring-[#1CAF9A]"
                title={`Remove ${code}`}
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            role="combobox"
            aria-expanded={isDropdownOpen}
            aria-autocomplete="list"
            aria-controls="course-dropdown-options"
            aria-label="Search courses by code or title"
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E7EA] dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1CAF9A] focus:border-transparent disabled:opacity-50 transition-all shadow-xs"
          />
        </div>

        {/* Dropdown Options */}
        {isDropdownOpen && selectedCourses.length < maxCourses && (
          <div
            id="course-dropdown-options"
            role="listbox"
            aria-label="Available course matches"
            className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-y-auto rounded-2xl border border-[#E4E7EA] dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1 divide-y divide-slate-100 dark:divide-slate-800"
          >
            {filtered.slice(0, 15).map((course) => (
              <button
                key={course.code}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => handleAdd(course.code)}
                className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-[#f0f4f5] dark:hover:bg-slate-800 flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-[#1C4370] dark:group-hover:text-[#1CAF9A]">
                    {course.code}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    {course.title}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-semibold text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {course.credits} Credits
                  </span>
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#1CAF9A] transition-colors" />
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-400" role="status">
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
          <span className="text-[#F0AD4E] flex items-center space-x-1 font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>Standard advising load (15-18 credits)</span>
          </span>
        )}
      </div>
    </div>
  );
}
