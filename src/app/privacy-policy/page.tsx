import { ShieldCheck, Lock, HardDrive, EyeOff } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
          <ShieldCheck className="w-8 h-8 text-primary-600" />
          <span>Privacy Policy</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Last updated: November 2026</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-primary-500" />
            <span>1. Zero Portal Credentials Policy</span>
          </h2>
          <p>
            EWU Pro <strong>never</strong> asks for, handles, captures, or stores your official university portal passwords, student account credentials, or login tokens. Any academic planning you perform occurs anonymously or strictly within your local browser storage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-primary-500" />
            <span>2. Local Storage and Data Minimization</span>
          </h2>
          <p>
            Your saved timetables, custom preferences, and grade calculation inputs are persisted locally on your device using Web Storage (`localStorage`). You have total control over your data and can delete or clear it at any time directly through your browser settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-primary-500" />
            <span>3. No Third-Party Tracking or Ads</span>
          </h2>
          <p>
            We do not sell your personal data or display intrusive behavioral advertisements. Aggregate server logs may capture standard HTTP headers solely for network stability and error diagnosis.
          </p>
        </section>
      </div>
    </div>
  );
}
