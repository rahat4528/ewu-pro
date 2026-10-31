"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Semester, Section } from "@/lib/types";
import { formatTimeRange } from "@/lib/time";
import {
  Upload,
  Settings,
  FileText,
  AlertTriangle,
  Database,
  Eye,
  Check,
  Download,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminPage() {
  const [semesterName, setSemesterName] = useState("Spring 2027");
  const [csvContent, setCsvContent] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // Import states
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const loadSemesters = async () => {
    try {
      const res = await fetch("/api/semesters");
      const data = await res.json();
      if (data.semesters) setSemesters(data.semesters);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  const sampleCSV = `Course,Section,Instructor,Days,Time,Classroom,Seats,Capacity
CSE110,1,MAR,ST,08:30-10:00,AB3-401,30,35
CSE110,2,TSH,ST,10:10-11:40,AB3-402,25,35
CSE207,1,AH,MW,10:10-11:40,AB3-501,15,35
CSE207,2,MRA,TR,01:30-03:00,AB3-502,20,35
CSE209,1,MAR,MW,11:50-01:20,AB3-403,28,35
MAT101,1,KHA,ST,08:30-10:00,AB2-201,35,35
MAT102,1,SHM,MW,01:30-03:00,AB2-204,18,35
ENG101,1,NZA,ST,10:10-11:40,AB1-301,12,30`;

  const handleLoadSample = () => {
    setCsvContent(sampleCSV);
  };

  const handleDownloadTemplate = () => {
    const template = "Course,Section,Instructor,Days,Time,Classroom,Seats,Capacity\nCSE110,1,MAR,ST,08:30-10:00,AB3-401,35,35\n";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ewu-offered-courses-template.csv";
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file);
  };

  const handlePreview = async () => {
    if (!csvContent.trim() || !semesterName.trim()) return;

    try {
      setIsProcessing(true);
      setImportStatus(null);

      const parsed = Papa.parse(csvContent.trim(), {
        header: true,
        skipEmptyLines: true,
      });

      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semesterName,
          rows: parsed.data,
          action: "preview",
        }),
      });

      const data = await res.json();
      setPreviewResult(data);
    } catch (err: any) {
      console.error(err);
      setImportStatus(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommit = async () => {
    if (!csvContent.trim() || !semesterName.trim()) return;

    try {
      setIsProcessing(true);
      const parsed = Papa.parse(csvContent.trim(), {
        header: true,
        skipEmptyLines: true,
      });

      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semesterName,
          rows: parsed.data,
          action: "commit",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setImportStatus(
          `Success: Published ${data.validCount} sections for ${semesterName}!`
        );
        loadSemesters();
        setPreviewResult(null);
        setCsvContent("");
      } else {
        setImportStatus(`Commit failed: ${data.error}`);
      }
    } catch (err: any) {
      setImportStatus(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePublish = async (sem: Semester) => {
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semesterName: sem.name,
          published: !sem.published,
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadSemesters();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1C4370] dark:text-white flex items-center space-x-2">
          <Settings className="w-7 h-7 text-[#1CAF9A]" />
          <span>Semester Ingestion & Admin Portal</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload and validate new semester course bulletins, map columns, preview parsed routines, and publish to the live catalogue.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E7EA] dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-extrabold text-[#1C4370] dark:text-white text-base flex items-center space-x-2">
                <Upload className="w-5 h-5 text-[#1CAF9A]" />
                <span>Upload Semester CSV</span>
              </h2>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-[#1C4370] dark:hover:text-[#1CAF9A]"
                  title="Download standard template"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Template</span>
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs font-bold text-[#1CAF9A] hover:underline"
                >
                  Insert Sample EWU CSV
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Semester Name:
              </label>
              <input
                type="text"
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                placeholder="e.g. Spring 2027"
                className="w-full px-3 py-2 rounded-xl border border-[#E4E7EA] dark:border-slate-700 bg-[#f0f4f5] dark:bg-slate-800 text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Choose CSV File:
              </label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1C4370] file:text-white hover:file:bg-[#143154]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Raw CSV Data:
              </label>
              <textarea
                rows={8}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="Paste CSV with headers (Course, Section, Instructor, Days, Time, Classroom, Seats)..."
                className="w-full p-3 rounded-2xl border border-[#E4E7EA] dark:border-slate-700 bg-[#f0f4f5] dark:bg-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#1CAF9A]"
              />
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold ${
                  importStatus.startsWith("Success")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                    : "bg-rose-50 text-rose-800 border border-rose-300"
                }`}
              >
                {importStatus}
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handlePreview}
                disabled={isProcessing || !csvContent.trim()}
                className="flex-1 py-2.5 rounded-2xl bg-[#f0f4f5] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#1C4370] dark:text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <Eye className="w-4 h-4 text-[#1CAF9A]" />
                <span>Validate & Preview</span>
              </button>

              <button
                type="button"
                onClick={handleCommit}
                disabled={isProcessing || !csvContent.trim()}
                className="flex-1 py-2.5 rounded-2xl bg-[#1CAF9A] hover:bg-[#168e7d] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-[#1CAF9A]/20 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Publish to Live Catalog</span>
              </button>
            </div>
          </div>

          {previewResult && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E7EA] dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E7EA] dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-[#1C4370] dark:text-white">
                  Preview Validation Summary
                </h3>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#5cb85c] font-black">
                    ✓ {previewResult.validCount} Valid
                  </span>
                  {previewResult.errorCount > 0 && (
                    <span className="text-[#D9534F] font-black">
                      ✕ {previewResult.errorCount} Errors
                    </span>
                  )}
                </div>
              </div>

              {previewResult.errors?.length > 0 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-1">
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Row Validation Issues:</span>
                  </div>
                  <ul className="text-[11px] text-rose-600 dark:text-rose-400 space-y-0.5 list-disc pl-4">
                    {previewResult.errors.map((err: any, i: number) => (
                      <li key={i}>
                        Row {err.rowNumber}: {err.errors.join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {previewResult.sampleSections?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#f0f4f5] dark:bg-slate-800 font-bold text-[#1C4370]">
                      <tr>
                        <th className="p-2">Course</th>
                        <th className="p-2">Sec</th>
                        <th className="p-2">Days</th>
                        <th className="p-2">Timing</th>
                        <th className="p-2">Faculty</th>
                        <th className="p-2">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EA] dark:divide-slate-800">
                      {previewResult.sampleSections.map((s: Section) => (
                        <tr key={s.id}>
                          <td className="p-2 font-bold text-[#1C4370]">{s.courseCode}</td>
                          <td className="p-2">{s.sectionNo}</td>
                          <td className="p-2 font-bold text-[#1CAF9A]">{s.rawDays}</td>
                          <td className="p-2">{formatTimeRange(s.start, s.end)}</td>
                          <td className="p-2 font-semibold text-[#1C4370]">{s.faculty}</td>
                          <td className="p-2 text-slate-500">{s.room || "TBA"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E7EA] dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h2 className="font-extrabold text-[#1C4370] dark:text-white text-base flex items-center space-x-2">
              <Database className="w-5 h-5 text-[#1CAF9A]" />
              <span>Catalog Semesters</span>
            </h2>

            <div className="space-y-2.5">
              {semesters.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl border border-[#E4E7EA] dark:border-slate-800 bg-[#f0f4f5]/60 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                >
                  <div>
                    <strong className="text-[#1C4370] dark:text-slate-200 block font-bold text-sm">
                      {s.name}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      {s.sectionCount ?? 0} Sections • {new Date(s.importedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePublish(s)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                      s.published
                        ? "bg-[#5cb85c]/15 text-[#3d8b3d] dark:bg-[#143d22] dark:text-[#d4efdf]"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {s.published ? "Published" : "Draft"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
