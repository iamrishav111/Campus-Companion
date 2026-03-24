# 🏛 Campus Companion - Hostel Ops Command Center

A premium, enterprise-grade facility operations dashboard built for high-scale hostel management. This platform streamlines maintenance tracking, SLA orchestration, and data-driven decision making.

---

## 🚀 Overview

Campus Companion is built with a **Premium SaaS** design aesthetic—prioritizing visual clarity, operational speed, and low cognitive load. It serves as a centralized Command Center for tracking, assigning, and analyzing facility maintenance tickets in real-time.

---

## 💎 Key Features

### Admin Dashboard
- **Interactive KPI Engine**: Real-time metrics cards (Total, Unassigned, Assigned, Closed) that act as instant filters for the ticket pipeline.
- **Active Issues Tracker**: Dynamic charts (Category & Block-wise) with interactive filtering—click any bar to drill down into specific data.
- **Advanced Ticket Management**: Slide-in drawer for precise SLA tracking, technical reassignments, and administrative notes syncing.
- **SLA Orchestration**: Automatic breach detection and color-coded urgency indicators (🔴 BREACHED, 🟡 URGENT).

### Boardroom Analytics
- **Visual Insights**: Sophisticated *Recharts* visualizations for Category trends and Block-level issue breakdowns.
- **Multi-Tab Data Export**: Advanced Excel generation with specialized tabs for Categorized Complains, Technician Performance, and Closed Issue audits.

---

## 🛠 Technology Stack

- **Frontend Core**: React 18 (Functional Hooks)
- **Build Tool**: Vite (Ultra-fast HMR)
- **UI Architecture**: Ant Design (v5) + Tailwind CSS
- **Data Visualization**: Recharts (Fully customized)
- **Business Logic**: **Object-Oriented Service Layer** (ES6 Classes)
- **Utilities**: Day.js (SLA Tracking), XLSX (Excel Generation)

---

## 📂 Project Structure

```text
Campus Companion/
├── src/
│   ├── assets/             # Branding & Official SPJIMR Logos
│   ├── layouts/            # MainLayout (Navigation & Sidebar)
│   ├── pages/              # Core Views (Login, Admin, Analytics)
│   ├── services/           # OOP Service Layer (TicketService.js)
│   ├── styles/             # Tailwind & Global Aesthetics
│   └── App.jsx             # Global Router & Configuration
├── public/                 # Favicon & Static Assets
├── index.html              # Main Entry
└── README.md               # Project Documentation
```

---

## 💻 Getting Started

### 1. Installation
Navigate to the frontend directory and install dependencies:
```bash
npm install
```

### 2. Development
Run the local development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Production Build
Generate an optimized production bundle:
```bash
npm run build
```

---

## 🔐 Access Credentials

Use these credentials to access the Administrator Portal:

* **Email**: `admin@spjimr.org`
* **Password**: `admin123`

---
**Official Hostel Ops Team Submission** 🎓
