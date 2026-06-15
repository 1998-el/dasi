﻿﻿﻿﻿﻿import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { RegisterPageWizard } from './pages/RegisterPageWizard'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { OrdersPage } from './pages/OrdersPage'
import { TablesPage } from './pages/TablesPage'
import { ProductsPage } from './pages/ProductsPage'
import { SuppliersPage } from './pages/SuppliersPage'
import { InventoryPage } from './pages/InventoryPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { MembersPage } from './pages/MembersPage'
import { TicketsPage } from './pages/TicketsPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { HRPage } from './pages/HRPage'
import { EmployeeDetailPage } from './pages/EmployeeDetailPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { ClientMenuPage } from './pages/ClientMenuPage'
import { AccountingPage } from './pages/AccountingPage'
import { CashClosingPage } from './pages/CashClosingPage'
import { AIAnalysisPage } from './pages/AIAnalysisPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPageWizard />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/menu" element={<ClientMenuPage />} />
          <Route path="/scan/:tenantId/:tableCode" element={<ClientMenuPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/tables" element={<PrivateRoute><TablesPage /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
          <Route path="/suppliers" element={<PrivateRoute><SuppliersPage /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><InventoryPage /></PrivateRoute>} />
          <Route path="/payments" element={<PrivateRoute><PaymentsPage /></PrivateRoute>} />
          <Route path="/members" element={<PrivateRoute><MembersPage /></PrivateRoute>} />
          <Route path="/tickets" element={<PrivateRoute><TicketsPage /></PrivateRoute>} />
          <Route path="/finance" element={<PrivateRoute><ExpensesPage /></PrivateRoute>} />
          <Route path="/hr" element={<PrivateRoute><HRPage /></PrivateRoute>} />
          <Route path="/hr/members/:id" element={<PrivateRoute><EmployeeDetailPage /></PrivateRoute>} />
          <Route path="/accounting" element={<PrivateRoute><AccountingPage /></PrivateRoute>} />
          <Route path="/accounting/closing" element={<PrivateRoute><CashClosingPage /></PrivateRoute>} />
          <Route path="/ai-analysis" element={<PrivateRoute><AIAnalysisPage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}