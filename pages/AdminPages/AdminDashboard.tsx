import React, { useState } from 'react';
import { Toast } from '../../components/SharedComponents';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminOverview from '../../components/admin/AdminOverview';
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

   return (
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-display flex h-screen w-screen overflow-hidden transition-colors duration-200">
         {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

         {/* Sidebar - hidden on mobile, visible on md+ */}
         <div className="hidden md:flex">
            <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
         </div>

         {/* Mobile sidebar drawer */}
         {mobileNavOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
               <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
               <div className="absolute left-0 top-0 h-full w-80 max-w-[90vw]">
                  <div className="h-full shadow-2xl">
                     <AdminSidebar
                        activeView={activeView}
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
                     <h2 className="text-lg md:text-xl font-bold capitalize text-gray-900 dark:text-white">{activeView.replace('-', ' ')}</h2>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                     <span className="text-sm font-bold leading-none text-gray-900 dark:text-white">Administrator</span>
                     <span className="text-xs text-green-600 font-medium">System Active</span>
                  </div>
                  <div className="size-8 md:size-10 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                     <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                  </div>
               </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
               {activeView === 'overview' && (isSuperAdmin ? <SuperAdminDashboard /> : <AdminOverview />)}
               {activeView === 'users' && <UserManagement />}
               {activeView === 'dealer-verifications' && <DealerVerificationManagement />}
               {activeView === 'orders' && <OrderManagement />}
               {activeView === 'affiliates' && <AdminAffiliates />}
               {activeView === 'products' && <ProductManagement />}
               {activeView === 'packages' && (
                  <PackageManagement
                     focusPackageId={focusPackageId}
                     onFocusHandled={() => setFocusPackageId(null)}
                  />
               )}
               {activeView === 'gallery' && <GalleryManagement />}
               {activeView === 'requests' && (
                  <RequestsManagement
                     onOpenPackage={(packageId) => {
                        setFocusPackageId(packageId);
                        setActiveView('packages');
                     }}
                  />
               )}
               {activeView === 'invoices' && <InvoiceGenerator />}
               {activeView === 'analytics' && <AnalyticsInsights />}
               {activeView === 'settings' && (isSuperAdmin ? <SuperAdminSettings /> : <SettingsPanel />)}
               {activeView === 'live-chat' && <AdminLiveChat />}
            </main>
         </div>
      </div>
   );
};

export default AdminDashboard;
