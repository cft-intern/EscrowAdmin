import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminSignupPage } from '@/pages/admin/AdminSignupPage';
import { CategoriesPage } from '@/pages/admin/CategoriesPage';
import { FormBuilderPage } from '@/pages/admin/FormBuilderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useCategory } from '@/context/CategoryContext';

function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  const { adminUser } = useCategory();
  if (!adminUser) {
    return <Navigate to="/signup" replace />;
  }
  return children;
}

export function App() {
  return (
    <Routes>
      {/* Auth Route: Admin Sign Up (NO separate Login page) */}
      <Route path="/signup" element={<AdminSignupPage />} />
      <Route path="/register" element={<Navigate to="/signup" replace />} />
      <Route path="/login" element={<Navigate to="/signup" replace />} />
      <Route path="/admin/signup" element={<Navigate to="/signup" replace />} />
      <Route path="/admin/login" element={<Navigate to="/signup" replace />} />

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
        <Route path="/admin" element={<Navigate to="/categories" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/categories" replace />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}