import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TechnicianHistory from './pages/TechnicianHistory';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4F46E5', // Deep Indigo / Blue
          fontFamily: "'Inter', sans-serif",
          borderRadius: 12, // More rounded corners per prompt
          colorBgContainer: '#ffffff',
          colorBgLayout: '#F8FAFC',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes with Module parameter */}
          <Route path="/admin" element={<Navigate to="/admin/hostel/tickets" replace />} />
          <Route path="/admin/:module" element={<MainLayout role="admin" />}>
            <Route index element={<Navigate to="tickets" replace />} />
            <Route path="tickets" element={<AdminDashboard />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />

          </Route>

          <Route path="/technician" element={<MainLayout role="technician" />}>
            <Route index element={<Navigate to="tickets" replace />} />
            <Route path="tickets" element={<TechnicianDashboard />} />
            <Route path="history" element={<TechnicianHistory />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
