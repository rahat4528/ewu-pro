import Link from "next/link";
import {
  Calendar,
  Compass,
  GraduationCap,
  History,
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Layers,
  Clock,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Calendar,
      title: "Advising Routine Planner",
      desc: "Pick 3–6 desired courses and receive clash-free timetables ranked by your preferences in under 2 seconds.",
      href: "/dashboard/advising-planner",
      tag: "Flagship",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: Search,
      title: "Offered Courses by Timing",
      desc: "Search sections clustered by identical time slots (ST, MW, TR, SR). Filter by faculty, available seats, and room.",
      href: "/dashboard/offered-courses",
      tag: "Search",
      color: "from-teal-500 to-emerald-600",
    },
    {
      icon: GraduationCap,
      title: "EWU CGPA Calculator",
      desc: "Official 10-tier EWU scale (A+ 4.00 down to F 0.00). Calculate semester GPA, retake replacement, and target 'what-if'.",
      href: "/dashboard/cgpa-calculator",
      tag: "Official Scale",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: History,
      title: "Previous Courses Archive",
      desc: "Explore previous semesters (Spring, Summer, Fall) to check faculty patterns and predicting upcoming offerings.",
      href: "/dashboard/previous-courses",
      tag: "Archive",
      color: "from-purple-500 to-pink-600",
    },
  ];

  const highlights = [
    {
      icon: Zap,
      title: "Sub-Second Solver",
      desc: "Backtracking with bitmask pruning tests 100,000+ combinations instantly without freezing your browser.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Credentials Required",
      desc: "We never ask for or store student portal passwords. 100% private and runs locally on your device.",
    },
    {
      icon: Layers,
      title: "Customized for EWU",
      desc: "Native support for EWU day patterns (ST, MW, TR, SR), campus building codes (AB1, AB2, AB3, AB4), and retake rules.",
    },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6 sm:pt-12 max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/80 border border-primary-200 dark:border-primary-850 text-primary-700 dark:text-primary-300 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Made specifically for East West University students</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
          Course Advising <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary-600 via-teal-500 to-indigo-600 bg-clip-text text-transparent">
            Without The Headaches
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Registration is stressful. EWU Pro untangles messy offered-course lists, builds clash-free routines in 2 seconds, and accurately tracks your CGPA.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/advising-planner"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-sm shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02]"
          >
            <Calendar className="w-4 h-4" />
            <span>Launch Routine Planner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard/offered-courses"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-[1.02]"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Browse Fall 2026</span>
          </Link>

          <Link
            href="/dashboard/cgpa-calculator"
            className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            <span>CGPA Calculator</span>
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Four Core Tools
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Everything you need for a smooth registration semester
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-600 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center space-x-1.5">
                  <span>{item.title}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-500" />
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Highlights / Why EWU Pro */}
      <section className="bg-gradient-to-br from-slate-50 to-primary-50/30 dark:from-slate-900 dark:to-primary-950/20 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Built by Students, for Students
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Engineered around the real complexities of East West University registration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <div
                key={h.title}
                className="p-5 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {h.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {h.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
