import Link from "next/link";
import {
  Calendar,
  GraduationCap,
  History,
  Search,
  Bookmark,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";

export default function DashboardPage() {
  const tools = [
    {
      title: "Advising Routine Planner",
      desc: "Generate ranked, clash-free timetables from 3-6 course codes in under 2 seconds.",
      href: "/dashboard/advising-planner",
      icon: Calendar,
      color: "from-blue-600 to-indigo-600",
      cta: "Plan Routine",
    },
    {
      title: "Offered Courses Directory",
      desc: "Search sections grouped by time slots (ST, MW, TR, SR). Filter by faculty & open seats.",
      href: "/dashboard/offered-courses",
      icon: Search,
      color: "from-teal-600 to-emerald-600",
      cta: "Browse Sections",
    },
    {
      title: "EWU CGPA Calculator",
      desc: "Calculate semester GPA, cumulative CGPA with EWU retake rules, and graduation target what-if.",
      href: "/dashboard/cgpa-calculator",
      icon: GraduationCap,
      color: "from-amber-600 to-orange-600",
      cta: "Calculate CGPA",
    },
    {
      title: "Previous Semesters Archive",
      desc: "Look back at previous semester offerings (Spring, Summer, Fall) to anticipate faculty and times.",
      href: "/dashboard/previous-courses",
      icon: History,
      color: "from-purple-600 to-pink-600",
      cta: "View Archive",
    },
    {
      title: "My Saved Timetables",
      desc: "Access your bookmarked routine schedules, export them as images, or print anytime.",
      href: "/dashboard/plans",
      icon: Bookmark,
      color: "from-slate-700 to-slate-900",
      cta: "View Saved Plans",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          EWU Advising & Routine Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select a tool below to prepare your upcoming registration semester.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.title}
              href={t.href}
              className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${t.color} flex items-center justify-center text-white shadow-md mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {t.desc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-primary-600 dark:text-primary-400">
                <span>{t.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
