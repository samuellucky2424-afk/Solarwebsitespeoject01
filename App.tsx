import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { GalleryProvider } from './context/GalleryContext';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';
import { CartDrawer, FloatingCartButton } from './components/SharedComponents';

// Lazy load components
const LandingPage = lazy(() => import('./pages/PublicPages/LandingPage'));
const ProductCatalog = lazy(() => import('./pages/PublicPages/ProductCatalog'));
const ProductDetail = lazy(() => import('./pages/PublicPages/ProductDetail'));
const ConsultationForm = lazy(() => import('./pages/PublicPages/ConsultationForm'));
const GalleryPage = lazy(() => import('./pages/PublicPages/GalleryPage'));
const InstallersPage = lazy(() => import('./pages/PublicPages/InstallersPage'));
const PackagesPage = lazy(() => import('./pages/PublicPages/PackagesPage'));
const ContactPage = lazy(() => import('./pages/PublicPages/ContactPage'));
const UserLogin = lazy(() => import('./pages/AuthPages/UserLogin'));
const AdminLogin = lazy(() => import('./pages/AuthPages/AdminLogin'));
const UserDashboard = lazy(() => import('./pages/UserPages/UserDashboard'));
const ServiceRequestForm = lazy(() => import('./pages/UserPages/ServiceRequestForm'));
const AdminDashboard = lazy(() => import('./pages/AdminPages/AdminDashboard'));
const CheckoutPage = lazy(() => import('./pages/UserPages/CheckoutPage'));

// Admin Sub-pages are now integrated into AdminDashboard
// const ProductInventory = lazy(() => import('./pages/AdminPages/ProductInventory'));
// const AdminGallery = lazy(() => import('./pages/AdminPages/AdminGallery'));
// const AdminPackages = lazy(() => import('./pages/AdminPages/AdminPackages'));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Global suppressor for transient Supabase/AbortError race conditions
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const err = event.reason;
      const isAbort = err?.name === 'AbortError' || err?.message?.includes('AbortError') || err?.message?.includes('signal is aborted');
      if (isAbort) {
        event.preventDefault(); // Swallow it
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  return null;
};

const PageLoader = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background-light dark:bg-background-dark fixed inset-0 z-[100]">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/10">
          <img src="/logo.png" alt="Loading..." className="w-12 h-12 object-contain animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 size-6 bg-forest text-primary rounded-full flex items-center justify-center border-2 border-white dark:border-background-dark animate-spin">
          <span className="material-symbols-outlined text-xs">refresh</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold text-forest dark:text-white tracking-tight">Greenlife Solar</h2>
        <div className="flex gap-1.5">
          <div className="size-2 bg-primary rounded-full animate-[bounce_1s_infinite_0ms]"></div>
          <div className="size-2 bg-primary rounded-full animate-[bounce_1s_infinite_200ms]"></div>
          <div className="size-2 bg-primary rounded-full animate-[bounce_1s_infinite_400ms]"></div>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AdminProvider>
          <GalleryProvider>
            <CartProvider>
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/products" element={<ProductCatalog />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/consultation" element={<ConsultationForm />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/installers" element={<InstallersPage />} />
                  <Route path="/packages" element={<PackagesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<UserLogin />} />
                  <Route path="/php/greenlife/privatelog" element={<AdminLogin />} />

                  {/* User Protected Routes */}
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/requests" element={<Navigate to="/dashboard?view=requests" replace />} />
                  <Route path="/service-request" element={<ServiceRequestForm />} />

                  {/* Admin Protected Routes */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  {/* Redirect old admin routes to dashboard */}
                  <Route path="/admin/inventory" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/gallery" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/packages" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </Suspense>
              <CartDrawer />
              <FloatingCartButton />
            </CartProvider>
          </GalleryProvider>
        </AdminProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;