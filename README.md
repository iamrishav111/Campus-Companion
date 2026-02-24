# 🏛 Campus Companion
A modern, enterprise-grade facility operations dashboard built for educational campuses, seamlessly managing maintenance tickets and analytics across various distinct operational modules (Hostel, Mess, Rec Centre, Academic Block).

---

## 🚀 Overview

Campus Companion is built with a **Premium SaaS** design aesthetic—prioritizing visual clarity, operational speed, and low cognitive load. The platform serves two distinct primary user roles:
1. **Facility Administrators:** Comprehensive management of support tickets, SLA tracking, pipeline filtration, and high-level analytical performance reporting.
2. **Technicians directly on the field:** Mobile-optimized, ultra-fast task completion pipelines stripped of complex analytics, prioritizing immediate actionable items ("What should I do next?").

---

## 💎 Features & Highlights

### Admin Interface (`/admin`)
- **Module-Aware Navigation:** Switch dynamically between distinct operational spheres (Hostel, Mess, Rec Centre) with real-time route syncing (`/admin/:module/tickets`).
- **Dynamic KPI Engine:** Top-level metrics cards (Total, Open, Assigned, Closed) act as interactive quick-filters for the entire data table organically.
- **Boardroom-Ready Analytics:** Standalone Analytics Dashboard (`/admin/:module/analytics`) utilizing smooth, stylized *Recharts* for tracking Average Resolution Time, SLA Trends, and Technician output comparisons.
- **Most Common Issues Pipeline:** A full-width interactive horizontal bar chart natively adjacent to the KPIs, visually communicating where the highest volume of queue congestion lays.
- **Advanced Ticket Management:** Slide-in Drawer interface allowing for precise SLA tracking, reassignments, priority escalation, and admin notes formatting.

### Technician App (`/technician`)
- **Action-Oriented Strip:** Stripped back to core "Work Summary" fundamentals featuring Donut tracking, Weekly Completion Bars, and bold SLA Risk Tiles (🟢 On Time, 🔴 Overdue).
- **Mobile-First Pipeline:** Complex tables automatically degrade into touch-friendly stacked *Card* layouts on smaller devices (<768px). 
- **Lightning Inline Actions:** Allow technicians to instantly "Start Work" or "Mark as Completed" with a single tap inline from the data grid without navigating deeper.
- **Action Drawer with Proof Upload:** Restricting harmful assignment logic, while maintaining a robust space to input "Work Notes" and upload singular photo-evidence upon job completion.

---

## 🛠 Technology Stack

This project was bootstrapped with **Vite** leveraging the **React** template.

- **Frontend Core:** React 18, React Router v6
- **Build Tool:** Vite (Ultra-fast HMR)
- **UI Architecture:** Ant Design (v5 Token System) combined iteratively with Tailwind CSS.
- **Data Visualization:** Recharts (Fully customized tooltip and axis styling).
- **Date Management:** Day.js (Real-time formatting and SLA `fromNow()` extensions).
- **Animation System:** Custom CSS keyframes natively extended through Tailwind configurations (`animate-fade-in-up`, `kpi-number`).

---

## 📂 Project Structure

```text
campus-companion/
├── frontend/                     # Main Web Application directory
│   ├── index.html                # App entry document
│   ├── vite.config.js            # Vite build constraints
│   ├── src/
│   │   ├── App.jsx               # Global Routing map definitions (/admin & /technician routes)
│   │   ├── index.css             # Tailwind Directives + Custom Global motion tokens & breakpoints
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx    # Stateful structural layout with responsive Sider & Header
│   │   └── pages/
│   │       ├── Login.jsx                 # Secure entry gate with Dummy Auth logic
│   │       ├── AdminDashboard.jsx        # Data grid, KPI matrix, filters, Most Common Issues chart
│   │       ├── AnalyticsDashboard.jsx   # Standalone Boardroom presentation graphs
│   │       ├── TechnicianDashboard.jsx   # Mobile-first ticket handler with inline action grids
│   │       └── TechnicianHistory.jsx     # Read-only closed history log
│   └── ...
├── backend/                      # API / Data logic container (For future development)
│   ├── app.py                    # Placeholder backend entry
│   └── requirements.txt
└── README.md                     # You are here
```

---

## 💻 Running the Project Locally

To preview Campus Companion seamlessly on your local machine:

1. **Verify your Node version** (Node.js 18+ recommended).
2. **Navigate into the Frontend directory:**
   ```bash
   cd frontend
   ```
3. **Install exact dependencies:**
   ```bash
   npm install
   ```
4. **Boot up the Vite Dev Server:**
   ```bash
   npm run dev
   ```
5. **Open** `http://localhost:5173` (or the port Vite issues).

### Dummy Login Credentials
Use the following strict credentials to bypass the gateway:

* **Administrator View:**
  * Email: `admin@spjimr.org`
  * Password: `admin123`

* **Technician View:**
  * Email: `tech@spjimr.org`
  * Password: `tech123`

*(Note: These credentials explicitly render visually vastly different component layouts utilizing role-based access logic natively).*

---

## 📦 Building for Production

To compile highly optimized, minified static files ready for standard server deployment:

```bash
cd frontend
npm run build
```
Vite will silently generate the minified application chunk files into the `frontend/dist` directory.
