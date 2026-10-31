import Link from "next/link";
import { Compass, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="no-print mt-auto border-t border-[#E4E7EA] dark:border-slate-800 bg-[#f0f4f5]/80 dark:bg-[#0f2139]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-[#1C4370] flex items-center justify-center text-[#1CAF9A]">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-[#1C4370] dark:text-white">EWU Pro</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">· Advising & Routine Assistant</span>
          </div>

          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy-policy" className="hover:text-[#1CAF9A] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#1CAF9A] transition-colors">
              Terms & Disclaimer
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-[#1CAF9A] transition-colors">
              Admin Portal
            </Link>
            <span>•</span>
            <a
              href="https://portal.ewubd.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1CAF9A] transition-colors text-[#1C4370] dark:text-[#1CAF9A] font-bold"
            >
              Official EWU Portal ↗
            </a>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center">
            <span>Designed for East West University Students</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E4E7EA] dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            <Shield className="w-3.5 h-3.5 inline mr-1 text-[#1C4370] dark:text-[#1CAF9A] -mt-0.5" />
            <strong>Unofficial Student Tool:</strong> EWU Pro is an independent advising routine assistant and is not officially affiliated with or sponsored by East West University. Stored schedules are kept on your local browser. Always verify your official course registrations and grade records on <a href="https://portal.ewubd.edu" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-[#1C4370]">portal.ewubd.edu</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
