import React, { useState } from 'react';
import { Toast } from '../../components/SharedComponents';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminOverview from '../../components/admin/AdminOverview';
import UserManagement from '../../components/admin/UserManagement';
import ProductManagement from '../../components/admin/ProductManagement';
import PackageManagement from '../../components/admin/PackageManagement';
import GalleryManagement from '../../components/admin/GalleryManagement';
import TeamManagement from '../../components/admin/TeamManagement';

import DebugStatus from '../../components/admin/DebugStatus';

// Define View Type (matching AdminSidebar)
type AdminView = 'overview' | 'users' | 'products' | 'packages' | 'gallery' | 'requests' | 'teams';

const AdminDashboard: React.FC = () => {
   const [activeView, setActiveView] = useState<AdminView>('overview');
   const [toastMsg, setToastMsg] = useState<string | null>(null);

   return (
      <div className="bg-background-light dark:bg-background-dark text-[#0d1b0f] dark:text-white font-display flex h-screen overflow-hidden transition-colors duration-200">
         {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

         {/* Sidebar */}
         <AdminSidebar activeView={activeView} setActiveView={setActiveView} />

         {/* Main Content */}
         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Header */}
            <header className="h-16 flex items-center justify-between border-b border-[#e7f3e8] dark:border-[#2a3d2c] bg-white dark:bg-[#152a17] px-8 shrink-0 relative z-20">
               <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold capitalize">{activeView}</h2>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex flex-col text-right">
                     <span className="text-sm font-bold leading-none">Alex Rivera</span>
                     <span className="text-xs text-[#4c9a52]">Admin</span>
                  </div>
                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                     AR
                  </div>
               </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
               {activeView === 'overview' && <AdminOverview />}
               {activeView === 'users' && <UserManagement />}
               {activeView === 'products' && <ProductManagement />}
               {activeView === 'packages' && <PackageManagement />}
               {activeView === 'gallery' && <GalleryManagement />}
               {activeView === 'teams' && <TeamManagement />}
               {activeView === 'requests' && <div className="text-center p-12 text-gray-500">Request Management (Full View) - See Overview for pending actions.</div>}
            </main>
         </div>
         <DebugStatus />
      </div>
   );
};

export default AdminDashboard;