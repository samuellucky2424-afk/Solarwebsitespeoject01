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

// Define View Type (matching AdminSidebar)
type AdminView = 'overview' | 'users' | 'products' | 'packages' | 'requests' | 'gallery' | 'analytics' | 'settings';

const AdminDashboard: React.FC = () => {
   const [activeView, setActiveView] = useState<AdminView>('overview');
   const [toastMsg, setToastMsg] = useState<string | null>(null);
   const [mobileNavOpen, setMobileNavOpen] = useState(false);
   const [focusPackageId, setFocusPackageId] = useState<string | null>(null);

   return (
      <div className="bg-background-light dark:bg-background-dark text-[#0d1b0f] dark:text-white font-display flex h-screen overflow-hidden transition-colors duration-200">
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
         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Header */}
            <header className="h-14 md:h-16 flex items-center justify-between border-b border-[#e7f3e8] dark:border-[#2a3d2c] bg-white dark:bg-[#152a17] px-4 md:px-6 lg:px-8 shrink-0 relative z-20">
               <div className="flex items-center gap-2">
                  <button
                     type="button"
                     onClick={() => setMobileNavOpen(true)}
                     className="md:hidden p-1.5 md:p-2 -ml-1.5 md:-ml-2 rounded-lg hover:bg-background-light/80 dark:hover:bg-black/10 transition-colors"
                     aria-label="Open navigation"
                  >
                     <span className="material-symbols-outlined text-[20px] md:text-[24px]">menu</span>
                  </button>
                  <h2 className="text-lg md:text-xl font-bold capitalize">{activeView}</h2>
               </div>
               <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex flex-col text-right">
                     <span className="text-xs md:text-sm font-bold leading-none">Alex Rivera</span>
                     <span className="text-[10px] md:text-xs text-[#4c9a52]">Admin</span>
                  </div>
                  <div className="size-7 md:size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs md:text-sm">
                     AR
                  </div>
               </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
               {activeView === 'overview' && <AdminOverview />}
               {activeView === 'users' && <UserManagement />}
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
            </main>
         </div>
      </div>
   );
};

export default AdminDashboard;