import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminProfilePage } from '@/pages/admin/AdminProfilePage';
import { CategoriesPage } from '@/pages/admin/CategoriesPage';
import { FormBuilderPage } from '@/pages/admin/FormBuilderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  const tokenKey = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'admin_template_token';
  const token = localStorage.getItem(tokenKey) || localStorage.getItem('accessToken');

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function App() {
  return (
    <Routes>
      {/* Admin Authentication Routes */}
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/signup" element={<AdminLoginPage />} />
      <Route path="/register" element={<AdminLoginPage />} />
      <Route path="/admin/signup" element={<AdminLoginPage />} />

      {/* Main Admin UI Routes */}
      <Route
        element={
          <ProtectedAdminRoute>
            <DashboardLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route path="/" element={<Navigate to="/categories" replace />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:id/builder" element={<FormBuilderPage />} />
        <Route path="/builder" element={<FormBuilderPage />} />
        <Route path="/admin/form-builder" element={<FormBuilderPage />} />
        <Route path="/admin" element={<Navigate to="/categories" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/categories" replace />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
        <Route path="/admin/users" element={<AdminProfilePage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;