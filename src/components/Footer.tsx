import Link from "next/link";
import { Compass, Heart, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="no-print mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-primary-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">EWU Pro</span>
            <span className="text-xs text-slate-400">· Advising & CGPA Assistant</span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy-policy" className="hover:text-primary-600 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-primary-600 transition-colors">
              Terms & Disclaimer
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-primary-600 transition-colors">
              Admin Portal
            </Link>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center">
            <span>Built with care for EWU students</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-3xl mx-auto leading-relaxed">
            <Shield className="w-3.5 h-3.5 inline mr-1 text-slate-400 -mt-0.5" />
            <strong>Unofficial Student Tool:</strong> EWU Pro is an independent student advising assistant and is not affiliated with, endorsed by, or sponsored by East West University. Stored data is kept strictly on your local browser. Always verify your official registration and academic record on the official university portal.
          </p>
        </div>
      </div>
    </footer>
  );
}
