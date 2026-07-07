import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { TablesPage } from './pages/TablesPage';
import { ProductsPage } from './pages/ProductsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { MembersPage } from './pages/MembersPage';
import { HRPage } from './pages/HRPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';

import { PaymentsPage } from './pages/PaymentsPage';
import { AccountingPage } from './pages/AccountingPage';
import { CashClosingPage } from './pages/CashClosingPage';
import { TicketsPage } from './pages/TicketsPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { PurchasesPage } from './pages/PurchasesPage'; // Import the new page

export function AppRoutes() {
  return (
    <Routes>
      {/* Existing routes */}
      <Route path="/purchases" element={<PurchasesPage />} /> {/* New route */}
      {/* ... other routes ... */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}