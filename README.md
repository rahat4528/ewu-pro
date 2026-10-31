# EWU Pro — Course Advising & CGPA Companion for East West University

[![Next.js](https://img.shields.io/badge/Next.js-15.5.28-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2.7-729B1B?style=flat&logo=vitest)](https://vitest.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-1CAF9A?style=flat&logo=pwa)](https://github.com/rahat4528/ewu-pro)

**EWU Pro** is an intelligent, high-speed advising companion, routine builder, and academic performance tracker built specifically for the students and faculty of **East West University (EWU)**, Dhaka, Bangladesh.

The visual design, color palette, typography, and card motifs are directly aligned with East West University's portal ([`https://portal.ewubd.edu/`](https://portal.ewubd.edu/)):
- **Primary Navy:** `#1C4370`
- **Accent Teal:** `#1CAF9A`
- **Sky Accent:** `#3186a4`
- **Soft Portal Canvas:** `#f0f4f5`
- **Portal Card Borders:** `#E4E7EA`
- **EWU Status Colors:** Success `#5cb85c`, Warning `#F0AD4E`, Alert `#D9534F`

---

## 🌟 Key Features

### 1. 🔍 Offered Courses Grouped by Timing Slots
- **Clustered Time-Slot View:** Courses are grouped by identical day combinations and clock intervals (e.g. `ST | 08:30 AM - 10:00 AM`, `MW | 10:10 AM - 11:40 AM`, `TR | 01:30 PM - 03:00 PM`, `SR | 11:50 AM - 01:20 PM`).
- **Live Search & Multi-Filters:** Instant searching by course code, title, instructor initials, and classroom with filters for open seats, days, and department.
- **Seat Availability Meter:** Visual progress bars displaying enrolled vs total capacity.

### 2. ⚡ Sub-Second Advising Routine Solver
- **Fast Backtracking Engine:** Explores 100,000+ schedule combinations in **under 2 seconds** using 64-bit `BigInt` bitmask pruning.
- **Natural Language "AI Query Assistant":** Type conversational queries such as *"Sunday off with late classes and no SR"* to automatically set solver weights and day preferences.
- **Weighted Optimization:** Scores schedules based on free days off, minimized idle gaps between classes, early start prevention, and preferred faculty weights.
- **Conflict Diagnostics:** When no clash-free schedule exists, the system isolates and explains the exact conflicting course pairs and timing overlaps.
- **Theory + Lab Section Bundling:** Automatically detects and bundles core theory courses with their corresponding lab sections (e.g. `CSE110` + `CSE110L`).

### 3. 📅 Interactive Weekly Timetable Grid
- **Sunday–Thursday Schedule:** Tailored to EWU's academic calendar (Sunday through Thursday).
- **Interactive Section Swapper:** Click any course block on the timetable to preview alternative sections, with real-time detection of collision hazards (e.g. `Clash w/ CSE207`).
- **Campus Building Legend:** Quick reference for EWU Academic Buildings (AB1, AB2, AB3, AB4).
- **High-Resolution PNG & Print Export:** One-click image download with automatic high-DPI canvas capture for printing or sharing.
- **One-Click Routine Sharing:** Share your planned schedule with peers via direct URL state encoding (`?plan=...`).

### 4. 🎓 Official EWU CGPA & What-If Target Solver
- **EWU 10-Tier Scale:** Accurate calculations using EWU's official grading scale ($A+$ 4.00 down to $F$ 0.00).
- **EWU Retake Policy:** Seamlessly replaces earlier attempts with newer grades in cumulative standing computations.
- **What-If Graduation Target Solver:** Computes the exact average GPA required across remaining degree credits to achieve your target graduation CGPA.
- **CSV Grade Report Export:** Download formatted academic summaries for personal records.

### 5. 📚 Historical Offerings Archive
- Cross-semester historical database covering Fall 2026, Summer 2026, Spring 2026, and Fall 2025 across multiple departments (CSE, EEE, MPS, BBA, ECO, ENG, PHR, LAW).
- Inspect faculty teaching history, time slots, and historical section allocations.

### 6. ⚙️ Admin Ingestion & CSV Importer
- Ingest semester course offerings from CSV or JSON with robust **Zod schema validation**.
- Provides downloadable official CSV template (`ewu-offered-courses-template.csv`).
- Comprehensive preview with row-level validation diagnostics before publishing.

### 7. 📱 Offline PWA Support
- Service worker registration with stale-while-revalidate offline caching for schedules, catalogs, and calculator tools.
- Installable on mobile and desktop as a Progressive Web App.

---

## 📊 EWU Official 10-Tier Grading Scale

| Marks Range | Letter Grade | Grade Point | Remarks |
|:---:|:---:|:---:|:---|
| 80% and above | **A+** | **4.00** | Outstanding |
| 75% to < 80% | **A** | **3.75** | Excellent |
| 70% to < 75% | **A-** | **3.50** | Very Good |
| 65% to < 70% | **B+** | **3.25** | Good |
| 60% to < 65% | **B** | **3.00** | Satisfactory |
| 55% to < 60% | **B-** | **2.75** | Above Average |
| 50% to < 55% | **C+** | **2.50** | Average |
| 45% to < 50% | **C** | **2.25** | Below Average |
| 40% to < 45% | **D** | **2.00** | Passing |
| Less than 40% | **F** | **0.00** | Failing (No Credit) |

---

## 📅 EWU Day-Code Reference

| Day Code | Corresponding Days |
|:---:|:---|
| **ST** | Sunday & Tuesday |
| **MW** | Monday & Wednesday |
| **TR** | Tuesday & Thursday |
| **SW** | Sunday & Wednesday |
| **MR** | Monday & Thursday |
| **SR** | Sunday & Thursday |
| **S** | Sunday |
| **M** | Monday |
| **T** | Tuesday |
| **W** | Wednesday |
| **R** | Thursday |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/rahat4528/ewu-pro.git
cd ewu-pro

# Install dependencies
npm install
```

### Running Tests

```bash
# Run unit test suite (Vitest)
npm test
```

### Development Server

```bash
# Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

---

## 🧪 Verification & Unit Test Suite

The test suite covers all domain logic and critical algorithms:
- `tests/days.test.ts`: EWU day code parser, multi-day tokens (`ST`, `MW`, `TR`, `SR`), labels, and validation.
- `tests/nlp.test.ts`: Natural language intent extraction for free days, start times, and faculty weights.
- `tests/cgpa.test.ts`: Semester GPA, cumulative standing with EWU retake replacement, and What-If solver edge cases.
- `tests/clash.test.ts`: BigInt bitmask collision detection, same-day interval overlaps, and clash explanations.
- `tests/planner.test.ts`: Backtracking solver execution, preference ranking, and linked theory-lab bundling.
- `tests/import.test.ts`: CSV row header normalization, Zod schema validation, and missing column detection.

---

## 🔒 Privacy & Legal Disclaimer

**EWU Pro** is an independent, community-driven academic utility developed for East West University students. It is **NOT** an official university portal and is not endorsed by East West University. No student credentials, passwords, or personal identifying numbers are captured, transmitted, or stored on external servers. All computations run securely in the student's browser.
