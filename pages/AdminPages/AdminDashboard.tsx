import React, { useState } from 'react';
import { Toast } from '../../components/SharedComponents';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminOverview from '../../components/admin/AdminOverview';
import StaffDashboardOverview from '../../components/admin/StaffDashboardOverview';
import ProductManagement from '../../components/admin/ProductManagement';
import PackageManagement from '../../components/admin/PackageManagement';
import GalleryManagement from '../../components/admin/GalleryManagement';
import RequestsManagement from '../../components/admin/RequestsManagement';
import AnalyticsInsights from '../../components/admin/AnalyticsInsights';
import SettingsPanel from '../../components/admin/SettingsPanel';
import UserManagement from '../../components/admin/UserManagement';
import AdminLiveChat from '../../components/admin/AdminLiveChat';
import OrderManagement from '../../components/admin/OrderManagement';
import DealerVerificationManagement from '../../components/admin/DealerVerificationManagement';
import AdminAffiliates from '../../components/admin/AdminAffiliates';
import SuperAdminDashboard from '../../components/admin/SuperAdminDashboard';
import SuperAdminSettings from '../../components/admin/SuperAdminSettings';
import InvoiceGenerator from '../../components/admin/InvoiceGenerator';
import { useAuth } from '../../context/AuthContext';

// Define View Type (matching AdminSidebar)
type AdminView = 'overview' | 'users' | 'dealer-verifications' | 'orders' | 'products' | 'packages' | 'requests' | 'gallery' | 'analytics' | 'settings' | 'live-chat' | 'affiliates' | 'invoices';

const AdminDashboard: React.FC = () => {
   const { isSuperAdmin } = useAuth();
   const [activeView, setActiveView] = useState<AdminView>('overview');
   const [toastMsg, setToastMsg] = useState<string | null>(null);
   const [mobileNavOpen, setMobileNavOpen] = useState(false);
   const [focusPackageId, setFocusPackageId] = useState<string | null>(null);

   // Staff permitted views
   const isViewPermitted = (view: AdminView) => {
      if (isSuperAdmin) return true;
      const staffAllowed: AdminView[] = ['overview', 'products', 'packages', 'gallery', 'invoices', 'requests', 'orders'];
      return staffAllowed.includes(view);
   };

   const currentView = isViewPermitted(activeView) ? activeView : 'overview';

   return (
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-display flex h-screen w-screen overflow-hidden transition-colors duration-200">
         {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

         {/* Sidebar - hidden on mobile, visible on md+ */}
         <div className="hidden md:flex">
            <AdminSidebar activeView={currentView} setActiveView={setActiveView} />
         </div>

         {/* Mobile sidebar drawer */}
         {mobileNavOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
               <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
               <div className="absolute left-0 top-0 h-full w-80 max-w-[90vw]">
                  <div className="h-full shadow-2xl">
                     <AdminSidebar
                        activeView={currentView}
                        setActiveView={(v) => {
                           setActiveView(v);
                           setMobileNavOpen(false);
                        }}
                     />
                  </div>
               </div>
            </div>
         )}

         {/* Main Content */}
         <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
            {/* Header */}
            <header className="h-16 lg:h-20 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 md:px-8 shrink-0 relative z-20">
               <div className="flex items-center gap-3">
                  <button
                     type="button"
                     onClick={() => setMobileNavOpen(true)}
                     className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                     aria-label="Open navigation"
                  >
                     <span className="material-symbols-outlined text-xl">menu</span>
                  </button>
                  <div>
                     <h2 className="text-lg md:text-xl font-bold capitalize text-gray-900 dark:text-white">
                        {currentView === 'overview'
                           ? (isSuperAdmin ? 'Super Admin Overview' : 'Staff Dashboard')
                           : currentView.replace('-', ' ')}
                     </h2>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                     <span className="text-sm font-bold leading-none text-gray-900 dark:text-white">
                        {isSuperAdmin ? 'Super Administrator' : 'Staff Member'}
                     </span>
                     <span className="text-xs text-emerald-600 font-medium">
                        {isSuperAdmin ? 'Master Control Active' : 'Operations Active'}
                     </span>
                  </div>
                  <div className="size-8 md:size-10 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                     <span className="material-symbols-outlined text-sm">
                        {isSuperAdmin ? 'admin_panel_settings' : 'badge'}
                     </span>
                  </div>
               </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
               {currentView === 'overview' && (
                  isSuperAdmin ? (
                     <SuperAdminDashboard />
                  ) : (
                     <StaffDashboardOverview onNavigate={setActiveView} />
                  )
               )}
               {currentView === 'users' && isSuperAdmin && <UserManagement />}
               {currentView === 'dealer-verifications' && isSuperAdmin && <DealerVerificationManagement />}
               {currentView === 'orders' && <OrderManagement />}
               {currentView === 'affiliates' && isSuperAdmin && <AdminAffiliates />}
               {currentView === 'products' && <ProductManagement />}
               {currentView === 'packages' && (
                  <PackageManagement
                     focusPackageId={focusPackageId}
                     onFocusHandled={() => setFocusPackageId(null)}
                  />
               )}
               {currentView === 'gallery' && <GalleryManagement />}
               {currentView === 'requests' && (
                  <RequestsManagement
                     onOpenPackage={(packageId) => {
                        setFocusPackageId(packageId);
                        setActiveView('packages');
                     }}
                  />
               )}
               {currentView === 'invoices' && <InvoiceGenerator />}
               {currentView === 'analytics' && isSuperAdmin && <AnalyticsInsights />}
               {currentView === 'settings' && isSuperAdmin && <SuperAdminSettings />}
               {currentView === 'live-chat' && isSuperAdmin && <AdminLiveChat />}
            </main>
         </div>
      </div>
   );
};

export default AdminDashboard;
