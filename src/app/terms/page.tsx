import { AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
          <FileText className="w-8 h-8 text-primary-600" />
          <span>Terms of Use & Disclaimer</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Last updated: November 2026</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-medium space-y-1">
          <strong className="flex items-center space-x-1.5 text-sm font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Important Academic Disclaimer</span>
          </strong>
          <p>
            EWU Pro is an independent, open-source companion created to assist students during the advising period. It is <strong>NOT</strong> an official university service and does not execute official registrations.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Unofficial Advisory Tool
          </h2>
          <p>
            EWU Pro is not affiliated with, endorsed by, or sponsored by East West University (EWU). All logos, brand elements, and interface designs are original works. Do not rely exclusively on this tool for official graduation clearance or advising commitments.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. Verification of Course Information
          </h2>
          <p>
            While course schedules, timings, faculty assignments, and seat counts are imported from published departmental bulletins, unexpected changes can occur. Always confirm your schedule on the official university student portal before the registration deadline.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            3. Limitation of Liability
          </h2>
          <p>
            EWU Pro is provided &ldquo;as is&rdquo; without warranty of any kind. The creators and contributors bear no responsibility for missed advising windows, registration conflicts, seat unavailability, or grading discrepancies.
          </p>
        </section>
      </div>
    </div>
  );
}
