import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { GalleryProvider } from './context/GalleryContext';
import { CartDrawer, FloatingCartButton } from './components/SharedComponents';

// Lazy load components to improve initial load performance and handle refreshes gracefully
const LandingPage = lazy(() => import('./pages/PublicPages/LandingPage'));
const ProductCatalog = lazy(() => import('./pages/PublicPages/ProductCatalog'));
const ProductDetail = lazy(() => import('./pages/PublicPages/ProductDetail'));
const ConsultationForm = lazy(() => import('./pages/PublicPages/ConsultationForm'));
const ContactPage = lazy(() => import('./pages/PublicPages/ContactPage'));
const UserLogin = lazy(() => import('./pages/AuthPages/UserLogin'));
const AdminLogin = lazy(() => import('./pages/AuthPages/AdminLogin'));
const UserDashboard = lazy(() => import('./pages/UserPages/UserDashboard'));
const UserRequests = lazy(() => import('./pages/UserPages/UserRequests'));
const ServiceRequestForm = lazy(() => import('./pages/UserPages/ServiceRequestForm'));
const AdminDashboard = lazy(() => import('./pages/AdminPages/AdminDashboard'));
const ProductInventory = lazy(() => import('./pages/AdminPages/ProductInventory'));
const AdminGallery = lazy(() => import('./pages/AdminPages/AdminGallery'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Component to force redirect to home on initial load/refresh
const ForceHomeRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Navigate to root on mount if not already there.
    // This ensures that refreshing the page always brings the user back to the homepage.
    if (window.location.hash !== '#/') {
      navigate('/');
    }
  }, [navigate]);
  return null;
};

// Custom Loading Component to display while pages are fetching
const PageLoader = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background-light dark:bg-background-dark fixed inset-0 z-[100]">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/10">
          <span className="material-symbols-outlined text-5xl text-primary animate-pulse">solar_power</span>
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
    <GalleryProvider>
      <CartProvider>
        <HashRouter>
          <ScrollToTop />
          <ForceHomeRedirect />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/products" element={<ProductCatalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/consultation" element={<ConsultationForm />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<UserLogin />} />
              <Route path="/admin" element={<AdminLogin />} />

              {/* User Protected Routes */}
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/requests" element={<UserRequests />} />
              <Route path="/service-request" element={<ServiceRequestForm />} />

              {/* Admin Protected Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/inventory" element={<ProductInventory />} />
              <Route path="/admin/gallery" element={<AdminGallery />} />
            </Routes>
          </Suspense>
          <CartDrawer />
          <FloatingCartButton />
        </HashRouter>
      </CartProvider>
    </GalleryProvider>
  );
};

export default App;