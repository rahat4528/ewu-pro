# EWU Pro — Course Advising & CGPA Planner for East West University

An intelligent, high-speed course advising companion and academic tracker built specifically for students at **East West University (EWU)**, Bangladesh.

---

## 🌟 Key Features

### 1. 🔍 Offered Courses Grouped by Timing
- Clustered view by identical days and time slots (`ST|08:30-10:00`, `MW|10:10-11:40`, `TR|01:30-03:00`, `SR|11:50-01:20`).
- Real-time search across course code, title, classroom, and faculty initials.
- Instant filters for open seats, days, and department.

### 2. ⚡ Sub-Second Advising Routine Solver
- Generates clash-free routines from 3–6 desired courses in **under 2 seconds**.
- Backtracking algorithm with **BigInt bitmask pruning** exploring 100,000+ combinations without UI freeze.
- Customizable preferences: free days off, earliest class start, latest class finish, preferred faculty, and avoided faculty.
- Automatic conflict diagnostics if a hard collision occurs between courses.

### 3. 📅 Interactive Weekly Timetable Grid
- Color-coded schedule grid for Sunday through Thursday.
- Interactive section swap: click any class block to swap sections and detect schedule clashes in real time.
- One-click export to **PNG image** or printable view.

### 4. 🎓 Official EWU CGPA & Target Calculator
- Official **10-tier EWU Grading Scale** ($A+$ 4.00 down to $F$ 0.00).
- EWU Retake Policy: newer grade replaces previous attempt in cumulative CGPA calculation.
- **What-If Target Solver**: computes the exact average GPA required across remaining credits to graduate with your target CGPA.

### 5. 📚 Multi-Semester Offerings Archive
- Cross-semester historical database (Fall 2026, Summer 2026, Spring 2026, Fall 2025).
- Search any course code to view faculty assignment patterns and historical schedules.

### 6. ⚙️ Admin Ingestion & CSV Importer
- Flexible CSV importer with **Zod schema validation** and line-by-line error reporting.
- Preview column mapping before publishing.
- Publish / unpublish semester catalogs.

---

## 📊 EWU Official 10-Tier Grading Scale

| Score | Grade | Point | Remarks |
|---|:---:|:---:|---|
| 80% and above | **A+** | 4.00 | Outstanding |
| 75% to < 80% | **A** | 3.75 | Excellent |
| 70% to < 75% | **A-** | 3.50 | Very Good |
| 65% to < 70% | **B+** | 3.25 | Good |
| 60% to < 65% | **B** | 3.00 | Satisfactory |
| 55% to < 60% | **B-** | 2.75 | Above Average |
| 50% to < 55% | **C+** | 2.50 | Average |
| 45% to < 50% | **C** | 2.25 | Below Average |
| 40% to < 45% | **D** | 2.00 | Passing |
| Less than 40% | **F** | 0.00 | Failing (No Credit) |

---

## 📅 EWU Day-Code Reference

| Code | Days |
|:---:|---|
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

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run development server
npm run dev

# Build production bundle
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Privacy & Legal Disclaimer

EWU Pro is an independent, open-source student tool and is **NOT** affiliated with, endorsed by, or sponsored by East West University. No student portal credentials or passwords are ever captured or stored. All computations run locally on the client device.
