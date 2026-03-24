# Campus Companion - Hostel Ops Command Center

A premium, real-time facility orchestration platform built for high-scale hostel management.

## 🚀 Overview

Campus Companion streamlines facility management by providing a centralized dashboard for tracking, assigning, and analyzing maintenance tickets. It features a premium UI, real-time data sync, and comprehensive analytics.

## 🛠 Tech Stack

- **Frontend**: React 18 with Vite
- **UI Library**: Ant Design (antd)
- **Styling**: Tailwind CSS + Glassmorphism
- **Charts**: Recharts
- **Data Handling**: Dayjs (SLA Tracking), XLSX (Excel Exports)
- **Architecture**: Object-Oriented Service Layer (ES6 Classes)

## 📁 Project Structure

```text
frontend/
├── src/
│   ├── assets/             # Branding & Static Assets (Logos, Icons)
│   ├── layouts/            # MainLayout (Navigation, Header, Sidebar)
│   ├── pages/              # Core Views (Login, Admin, Analytics)
│   ├── services/           # OOP Service Layer (TicketService.js)
│   ├── styles/             # Global CSS & Tailwind configuration
│   └── App.jsx             # Main Routing & Entry Point
├── public/                 # Static Public Assets (Favicon)
├── index.html              # Entry HTML
└── README.md               # Documentation
```

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 2. Install Dependencies
Navigate to the frontend directory and run:
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

## 🛡 Business Logic & Scalability

The project follows an **Object-Oriented Programming (OOP)** approach by centralizing business logic in `src/services/TicketService.js`. This allows for:
- **Encapsulation**: All API mapping and data transformations are handled in one place.
- **Consistency**: The same data models are used across Admin and Analytics views.
- **Scalability**: Adding new features (e.g., automated technician assignment) only requires updating the service layer.

---
**Official Hostel Ops Team Submission** 🎓
