import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type AdminView = 'overview' | 'users' | 'dealer-verifications' | 'orders' | 'products' | 'packages' | 'requests' | 'gallery' | 'analytics' | 'settings' | 'live-chat' | 'affiliates' | 'invoices';

interface AdminSidebarProps {
    activeView: AdminView;
    setActiveView: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView }) => {
    const { signOut, isSuperAdmin } = useAuth();
    const [isCatalogOpen, setIsCatalogOpen] = useState(true);

    const handleLogout = async () => {
        if (window.confirm("Sign out of Admin Dashboard?")) {
            await signOut();
        }
    };

    const navItemClass = (view: AdminView) => {
        const isActive = activeView === view;
        return `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isActive 
                ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent'
        }`;
    };

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-full">
            {/* Logo Area */}
            <div className="p-6 border-b border-slate-800">
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex items-center justify-center">
                        <img src="/logo.png" alt="Greenlife Logo" className="h-10 w-10 object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-white text-base font-bold leading-tight tracking-wide">GREENLIFE</h1>
                        <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Admin Portal</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Main Menu</div>
                
                <button onClick={() => setActiveView('overview')} className={navItemClass('overview')}>
                    <span className="material-symbols-outlined text-xl">dashboard</span>
                    <span>Overview</span>
                </button>

                {isSuperAdmin && (
                    <button onClick={() => setActiveView('users')} className={navItemClass('users')}>
                        <span className="material-symbols-outlined text-xl">group</span>
                        <span>Users</span>
                    </button>
                )}

                <button onClick={() => setActiveView('dealer-verifications')} className={navItemClass('dealer-verifications')}>
                    <span className="material-symbols-outlined text-xl">verified_user</span>
                    <span>Dealer Reviews</span>
                </button>

                <button onClick={() => setActiveView('orders')} className={navItemClass('orders')}>
                    <span className="material-symbols-outlined text-xl">local_shipping</span>
                    <span>Orders</span>
                </button>

                <button onClick={() => setActiveView('invoices')} className={navItemClass('invoices')}>
                    <span className="material-symbols-outlined text-xl">receipt_long</span>
                    <span>Invoices</span>
                </button>

                <button onClick={() => setActiveView('affiliates')} className={navItemClass('affiliates')}>
                    <span className="material-symbols-outlined text-xl">volunteer_activism</span>
                    <span>Affiliates</span>
                </button>

                <div className="mt-6 mb-2 px-3 pt-4 border-t border-slate-800 flex justify-between items-center cursor-pointer group" onClick={() => setIsCatalogOpen(!isCatalogOpen)}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-300 transition-colors">Catalog & Assets</div>
                    <span className={`material-symbols-outlined text-slate-500 text-sm transition-transform ${isCatalogOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </div>

                {isCatalogOpen && (
                    <div className="space-y-1">
                        <button onClick={() => setActiveView('products')} className={navItemClass('products')}>
                            <span className="material-symbols-outlined text-xl">inventory_2</span>
                            <span>Products</span>
                        </button>
                        <button onClick={() => setActiveView('packages')} className={navItemClass('packages')}>
                            <span className="material-symbols-outlined text-xl">package_2</span>
                            <span>Packages</span>
                        </button>
                        <button onClick={() => setActiveView('gallery')} className={navItemClass('gallery')}>
                            <span className="material-symbols-outlined text-xl">photo_library</span>
                            <span>Gallery</span>
                        </button>
                    </div>
                )}

                <div className="mt-6 mb-2 px-3 pt-4 border-t border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">Support & Settings</div>

                <button onClick={() => setActiveView('requests')} className={navItemClass('requests')}>
                    <span className="material-symbols-outlined text-xl">assignment</span>
                    <span>Requests</span>
                </button>

                <button onClick={() => setActiveView('live-chat')} className={navItemClass('live-chat')}>
                    <span className="material-symbols-outlined text-xl">chat</span>
                    <span>Live Chat</span>
                </button>

                {isSuperAdmin && (
                    <button onClick={() => setActiveView('analytics')} className={navItemClass('analytics')}>
                        <span className="material-symbols-outlined text-xl">insights</span>
                        <span>Analytics</span>
                    </button>
                )}

                {isSuperAdmin && (
                    <button onClick={() => setActiveView('settings')} className={navItemClass('settings')}>
                        <span className="material-symbols-outlined text-xl">settings</span>
                        <span>Settings</span>
                    </button>
                )}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-800">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
                    <span className="material-symbols-outlined text-xl">logout</span>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
