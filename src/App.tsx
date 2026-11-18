import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { scrollToSection } from './lib/scroll';
import { HomePage } from './pages/storefront/HomePage';
import { CatalogPage } from './pages/storefront/CatalogPage';
import { CategoryPage } from './pages/storefront/CategoryPage';
import { MotorcycleDetailPage } from './pages/storefront/MotorcycleDetailPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMotorcyclesPage } from './pages/admin/AdminMotorcyclesPage';
import { AdminMotorcycleFormPage } from './pages/admin/AdminMotorcycleFormPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminSiteEditorPage } from './pages/admin/AdminSiteEditorPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tryScroll = () => {
      if (scrollToSection(hash) || attempts >= 16) {
        return;
      }
      attempts += 1;
      timer = setTimeout(tryScroll, 50);
    };

    const rafId = requestAnimationFrame(tryScroll);

    return () => {
      cancelAnimationFrame(rafId);
      if (timer) clearTimeout(timer);
    };
  }, [pathname, hash, key]);

  return null;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#080909] text-[#858989] flex items-center justify-center text-sm">
        Verificando sessão administrativa...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollManager />
            <Routes>
              {/* Public Storefront Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/motos" element={<CatalogPage />} />
              <Route path="/motos/:slug" element={<MotorcycleDetailPage />} />
              <Route path="/categoria/:slug" element={<CategoryPage />} />

              {/* Admin Authentication */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminDashboardPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/motos"
                element={
                  <RequireAdmin>
                    <AdminMotorcyclesPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/motos/nova"
                element={
                  <RequireAdmin>
                    <AdminMotorcycleFormPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/motos/:id"
                element={
                  <RequireAdmin>
                    <AdminMotorcycleFormPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/categorias"
                element={
                  <RequireAdmin>
                    <AdminCategoriesPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/banners"
                element={
                  <RequireAdmin>
                    <AdminBannersPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/site"
                element={
                  <RequireAdmin>
                    <AdminSiteEditorPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/configuracoes"
                element={
                  <RequireAdmin>
                    <AdminSettingsPage />
                  </RequireAdmin>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
