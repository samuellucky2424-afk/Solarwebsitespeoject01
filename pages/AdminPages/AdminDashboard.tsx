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

// Define View Type (matching AdminSidebar)
type AdminView = 'overview' | 'users' | 'orders' | 'products' | 'packages' | 'requests' | 'gallery' | 'analytics' | 'settings' | 'live-chat';

const AdminDashboard: React.FC = () => {
   const [activeView, setActiveView] = useState<AdminView>('overview');
   const [toastMsg, setToastMsg] = useState<string | null>(null);
   const [mobileNavOpen, setMobileNavOpen] = useState(false);
   const [focusPackageId, setFocusPackageId] = useState<string | null>(null);

   return (
      <div className="bg-background-light dark:bg-background-dark text-[#0d1b0f] dark:text-white font-display flex h-screen w-screen overflow-hidden transition-colors duration-200">
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
            <header className="h-12 sm:h-14 md:h-16 lg:h-20 flex items-center justify-between border-b border-[#d0e5d5] dark:border-[#2a3d2c] bg-white dark:bg-[#152a17] px-3 sm:px-4 md:px-6 lg:px-8 shrink-0 relative z-20 shadow-sm">
               <div className="flex items-center gap-2 sm:gap-3">
                  <button
                     type="button"
                     onClick={() => setMobileNavOpen(true)}
                     className="md:hidden p-1.5 sm:p-2 -ml-1 rounded-lg hover:bg-background-light/80 dark:hover:bg-black/10 transition-colors"
                     aria-label="Open navigation"
                  >
                     <span className="material-symbols-outlined text-base sm:text-xl">menu</span>
                  </button>
                  <div>
                     <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold capitalize text-[#0d1b0f] dark:text-white">{activeView}</h2>
                     <p className="text-[8px] sm:text-xs text-[#4c9a66] dark:text-gray-400 hidden md:block">Manage & monitor</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex flex-col items-end">
                     <span className="text-xs sm:text-base md:text-lg font-bold leading-none text-[#0d1b0f] dark:text-white">Admin Panel</span>
                     <span className="text-[8px] sm:text-xs text-[#4c9a52] font-medium">System Active</span>
                  </div>
                  <div className="size-6 sm:size-8 md:size-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-md">
                     ✓
                  </div>
               </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
               {activeView === 'overview' && <AdminOverview />}
               {activeView === 'users' && <UserManagement />}
               {activeView === 'orders' && <OrderManagement />}
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
               {activeView === 'analytics' && <AnalyticsInsights />}
               {activeView === 'settings' && <SettingsPanel />}
               {activeView === 'live-chat' && <AdminLiveChat />}
            </main>
         </div>
      </div>
   );
};

export default AdminDashboard;
