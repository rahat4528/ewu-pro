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
  ArrowRight,
  Layers,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Calendar,
      title: "Advising Routine Planner",
      desc: "Pick 3–6 desired courses and receive clash-free timetables ranked by your preferences in under 2 seconds.",
      href: "/dashboard/advising-planner",
      tag: "Flagship",
      color: "from-[#1C4370] to-[#245269]",
    },
    {
      icon: Search,
      title: "Offered Courses by Timing",
      desc: "Search sections clustered by identical time slots (ST, MW, TR, SR). Filter by faculty, available seats, and room.",
      href: "/dashboard/offered-courses",
      tag: "Directory",
      color: "from-[#168e7d] to-[#1CAF9A]",
    },
    {
      icon: GraduationCap,
      title: "Official EWU CGPA Calculator",
      desc: "Official 10-tier EWU scale (A+ 4.00 down to F 0.00). Calculate semester GPA, retake replacement, and target 'what-if'.",
      href: "/dashboard/cgpa-calculator",
      tag: "Official Scale",
      color: "from-[#3186a4] to-[#4ca5c4]",
    },
    {
      icon: History,
      title: "Previous Semesters Archive",
      desc: "Explore previous terms (Spring, Summer, Fall) to check faculty patterns and anticipate upcoming class timings.",
      href: "/dashboard/previous-courses",
      tag: "Archive",
      color: "from-[#4e5154] to-[#686a6a]",
    },
  ];

  const highlights = [
    {
      icon: Zap,
      title: "Sub-Second Bitmask Solver",
      desc: "Optimized backtracking with BigInt bitmasks tests 100,000+ combinations instantly without freezing your browser.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Credentials Stored",
      desc: "We never ask for or touch your official portal passwords. 100% private and runs locally on your client device.",
    },
    {
      icon: Layers,
      title: "Built for EWU Routines",
      desc: "Native support for EWU day codes (ST, MW, TR, SR), campus building codes (AB1, AB2, AB3, AB4), and retake rules.",
    },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6 sm:pt-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1C4370]/10 dark:bg-white/10 border border-[#1C4370]/20 dark:border-white/20 text-[#1C4370] dark:text-[#1CAF9A] text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#1CAF9A]" />
          <span>Styled & Designed for East West University (portal.ewubd.edu reference)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#1C4370] dark:text-white tracking-tight leading-[1.15]">
          Course Advising <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#1C4370] via-[#1CAF9A] to-[#3186a4] bg-clip-text text-transparent">
            Without The Headaches
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Registration is stressful. EWU Pro untangles messy offered-course lists, generates clash-free routines in 2 seconds, and accurately tracks your CGPA on the official EWU scale.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/advising-planner"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-[#1CAF9A] hover:bg-[#168e7d] text-white font-extrabold text-sm shadow-lg shadow-[#1CAF9A]/25 transition-all hover:scale-[1.02]"
          >
            <Calendar className="w-4 h-4" />
            <span>Launch Routine Planner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard/offered-courses"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-[#f0f4f5] dark:hover:bg-slate-700 text-[#1C4370] dark:text-white font-bold text-sm border border-[#E4E7EA] dark:border-slate-700 shadow-xs transition-all hover:scale-[1.02]"
          >
            <Search className="w-4 h-4 text-[#1CAF9A]" />
            <span>Browse Fall 2026</span>
          </Link>

          <Link
            href="/dashboard/cgpa-calculator"
            className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-[#1C4370] hover:bg-[#143154] text-white font-bold text-sm transition-all shadow-xs"
          >
            <GraduationCap className="w-4 h-4 text-[#1CAF9A]" />
            <span>CGPA Calculator</span>
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-black text-[#1C4370] dark:text-white">
            Four Core Tools
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Engineered around East West University course scheduling
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E7EA] dark:border-slate-800 hover:border-[#1CAF9A] dark:hover:border-[#1CAF9A] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#f0f4f5] dark:bg-slate-800 text-[#1C4370] dark:text-[#1CAF9A]">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1C4370] dark:text-white mt-4 group-hover:text-[#1CAF9A] dark:group-hover:text-[#1CAF9A] transition-colors flex items-center space-x-1.5">
                  <span>{item.title}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#1CAF9A]" />
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white dark:bg-slate-900/90 p-8 sm:p-10 rounded-3xl border border-[#E4E7EA] dark:border-slate-800 space-y-6 shadow-sm">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-[#1C4370] dark:text-white">
            Portal-Aligned Standards
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tailored specifically for EWU students preparing for online advising.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <div
                key={h.title}
                className="p-5 bg-[#f0f4f5]/60 dark:bg-slate-800/40 rounded-2xl border border-[#E4E7EA] dark:border-slate-800/80 space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1C4370] text-[#1CAF9A] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#1C4370] dark:text-white">
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
