import { BrowserRouter, Route, Routes } from 'react-router';
import DashboardLayout from '@/components/customs/DashboardLayout';

import Home from '@/pages/customer/Home';
import TopUpRequest from '@/pages/customer/TopUpRequest';
import TopUpConfirm from '@/pages/customer/TopUpConfirm';
import TopUpQris from '@/pages/customer/TopUpQris';
import TopUpSuccess from '@/pages/customer/TopUpSuccess';
import Transfer from '@/pages/customer/Transfer';
import TransferConfirm from '@/pages/customer/TransferConfirm';
import TransferSuccess from '@/pages/customer/TransferSuccess';
import Activity from '@/pages/customer/Activity';
import Summary from '@/pages/admin/Summary';
import Users from '@/pages/admin/Users';
import UserDetail from '@/pages/admin/UserDetail';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import { AuthProvider } from './context/Auth/AuthProvider';
import { ToastProvider } from './context/Toast/ToastProvider';
import ProtectedRoute from './components/customs/ProtectedRoute';
import { CustomerRoute } from './routes/CustomerRoute';
import { AdminRoute } from './routes/AdminRoute';
import { AppProvider } from './context/App/ToastProvider';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppProvider>
            <Routes>
              {/* === Halaman dengan sidebar dashboard layout === */}
              {/* Customer */}
              <Route
                element={
                  <ProtectedRoute>
                    <CustomerRoute>
                      <DashboardLayout role="customer" />
                    </CustomerRoute>
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Home />} />
                <Route path="/topup" element={<TopUpRequest />} />
                <Route path="/transfer" element={<Transfer />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <DashboardLayout role="admin" />
                    </AdminRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Summary />} />
                <Route path="users" element={<Users />} />
                <Route path="users/:id" element={<UserDetail />} />
                <Route path="profile" element={<Settings />} />
              </Route>

              {/* === Halaman tanpa sidebar dashboard layout === */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/topup/confirm"
                element={
                  <ProtectedRoute>
                    <CustomerRoute>
                      <TopUpConfirm />
                    </CustomerRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/topup/qris"
                element={
                  <ProtectedRoute>
                    <CustomerRoute>
                      <TopUpQris />
                    </CustomerRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/topup/success"
                element={
                  <ProtectedRoute>
                    <CustomerRoute>
                      <TopUpSuccess />
                    </CustomerRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transfer/confirm"
                element={
                  <ProtectedRoute>
                    <CustomerRoute>
                      <TransferConfirm />
                    </CustomerRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transfer/success"
                element={
                  <ProtectedRoute>
                    <CustomerRoute>
                      <TransferSuccess />
                    </CustomerRoute>
                  </ProtectedRoute>
                }
              />

              {/* 404 Not Found Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
