"use client";

import React, { useState, useEffect } from "react";
import { SavedPlan } from "@/lib/types";
import { TimetableGrid } from "@/components/timetable-grid/TimetableGrid";
import { Bookmark, Trash2, ArrowRight, Plus, Share2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SavedPlansPage() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [activePlan, setActivePlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/plans");
      const data = await res.json();
      if (data.plans) {
        setPlans(data.plans);
        if (data.plans.length > 0 && !activePlan) {
          setActivePlan(data.plans[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/plans?id=${id}`, { method: "DELETE" });
      const updated = plans.filter((p) => p.id !== id);
      setPlans(updated);
      if (activePlan?.id === id) {
        setActivePlan(updated.length > 0 ? updated[0] : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = (plan: SavedPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    const ids = plan.sections.map((s) => s.id).join(",");
    const shareUrl = `${window.location.origin}/dashboard/advising-planner?plan=${encodeURIComponent(ids)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(plan.id);
      setTimeout(() => setCopiedId(null), 3000);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C4370] dark:text-white flex items-center space-x-2">
            <Bookmark className="w-7 h-7 text-[#1CAF9A]" />
            <span>My Saved Routines</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access your saved course routines, inspect schedules, or export PNG images.
          </p>
        </div>

        <Link
          href="/dashboard/advising-planner"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#1CAF9A] hover:bg-[#168e7d] text-white font-bold text-xs shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Routine</span>
        </Link>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-8 text-center">Loading plans...</p>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E7EA] dark:border-slate-800 space-y-4 max-w-lg mx-auto shadow-xs">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              No Saved Routines Yet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You haven&apos;t saved any advising routines. Go to the planner and bookmark your favorite combinations!
            </p>
          </div>
          <Link
            href="/dashboard/advising-planner"
            className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-[#1C4370] text-white font-bold text-xs"
          >
            <span>Open Advising Planner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of plans (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {plans.map((p) => {
              const isSelected = activePlan?.id === p.id;
              const isCopied = copiedId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePlan(p)}
                  className={`p-4 rounded-3xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#effaf7] dark:bg-[#072c29] border-[#1CAF9A] shadow-xs"
                      : "bg-white dark:bg-slate-900 border-[#E4E7EA] dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#1C4370] dark:text-white">
                        {p.name}
                      </h4>
                      <span className="text-[11px] font-semibold text-[#1CAF9A]">
                        {p.semester}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => handleShare(p, e)}
                        className="p-1.5 text-slate-400 hover:text-[#1CAF9A] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Copy share link"
                      >
                        {isCopied ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete routine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.sections.map((s) => (
                      <span
                        key={s.id}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f0f4f5] dark:bg-slate-800 text-[#1C4370] dark:text-slate-300"
                      >
                        {s.courseCode}-{s.sectionNo}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#E4E7EA] dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{p.sections.length} Courses Enrolled</span>
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Visual Grid (8 cols) */}
          <div className="lg:col-span-8">
            {activePlan && (
              <TimetableGrid
                sections={activePlan.sections}
                title={activePlan.name}
                subtitle={`Semester: ${activePlan.semester} • Saved on ${new Date(
                  activePlan.createdAt
                ).toLocaleDateString()}`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
