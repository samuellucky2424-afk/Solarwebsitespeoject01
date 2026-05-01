import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type AdminView = 'overview' | 'users' | 'orders' | 'products' | 'packages' | 'requests' | 'gallery' | 'analytics' | 'settings' | 'live-chat';

interface AdminSidebarProps {
    activeView: AdminView;
    setActiveView: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView }) => {
    const { signOut } = useAuth();
    const [isCatalogOpen, setIsCatalogOpen] = useState(true);

    const handleLogout = async () => {
        if (window.confirm("Sign out of Admin Dashboard?")) {
            await signOut();
        }
    };

    return (
        <aside className="w-56 md:w-64 border-r border-[#d0e5d5] dark:border-[#2a3d2c] bg-white dark:bg-[#152a17] flex flex-col shrink-0 h-full shadow-sm">
            <div className="p-6 md:p-8 border-b border-[#d0e5d5] dark:border-[#2a3d2c]">
                <Link to="/" className="flex items-center gap-3 md:gap-4">
                    <div className="size-10 md:size-12 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
                        <img src="/logo.png" alt="Logo" className="w-6 md:w-8 h-6 md:h-8 object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[#0d1b0f] dark:text-white text-base md:text-lg font-black leading-tight">Greenlife Solar</h1>
                        <p className="text-[#4c9a52] text-[10px] md:text-xs font-semibold mt-0.5 uppercase tracking-wider">Admin Portal</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 px-4 md:px-6 py-6 space-y-1 overflow-y-auto">
                <button
                    onClick={() => setActiveView('overview')}
                    className={`w-full flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl font-semibold transition-all ${activeView === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-[#4c9a52] hover:bg-[#f0f7f2] dark:hover:bg-[#1d351f]'}`}
                >
                    <span className="material-symbols-outlined text-xl md:text-2xl font-light">dashboard</span>
                    <span className="text-sm md:text-base">Overview</span>
                </button>

                <button
                    onClick={() => setActiveView('users')}
                    className={`w-full flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl font-semibold transition-all ${activeView === 'users' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-[#4c9a52] hover:bg-[#f0f7f2] dark:hover:bg-[#1d351f]'}`}
                >
                    <span className="material-symbols-outlined text-xl md:text-2xl font-light">group</span>
                    <span className="text-sm md:text-base">Users</span>
                </button>

                <button
                    onClick={() => setActiveView('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl font-semibold transition-all ${activeView === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-[#4c9a52] hover:bg-[#f0f7f2] dark:hover:bg-[#1d351f]'}`}
                >
                    <span className="material-symbols-outlined text-xl md:text-2xl font-light">local_shipping</span>
                    <span className="text-sm md:text-base">Orders</span>
                </button>

                {/* Catalog Group */}
                <div className="pt-4 md:pt-6">
                    <button
                        onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                        className="w-full flex items-center justify-between px-4 py-2 text-[11px] md:text-xs font-bold uppercase text-gray-500 hover:text-primary transition-colors mb-2"
                    >
                        <span className="tracking-wider">Catalog & Assets</span>
                        <span className={`material-symbols-outlined text-sm md:text-base transition-transform ${isCatalogOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {isCatalogOpen && (
                        <div className="space-y-1 pl-2 border-l-2 border-[#d0e5d5] dark:border-[#2a3d2c] ml-4">
                            <button
                                onClick={() => setActiveView('products')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-xl font-semibold transition-all text-sm md:text-base ${activeView === 'products' ? 'bg-primary/10 text-primary' : 'text-[#4c9a52] hover:bg-[#f0f7f2] dark:hover:bg-[#1d351f]'}`}
                            >
                                <span className="material-symbols-outlined text-lg md:text-xl font-light">inventory_2</span>
                                <span>Products</span>
                            </button>
                            <button
                                onClick={() => setActiveView('packages')}
                                className={`w-full flex items-center gap-2 md:gap-3 px-3 py-1.5 md:py-2 rounded-r-lg font-medium transition-colors text-xs md:text-sm ${activeView === 'packages' ? 'bg-primary/10 text-primary' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                            >
                                <span className="material-symbols-outlined text-base md:text-lg">package_2</span>
                                <span>Packages</span>
                            </button>
                            <button
                                onClick={() => setActiveView('gallery')}
                                className={`w-full flex items-center gap-2 md:gap-3 px-3 py-1.5 md:py-2 rounded-r-lg font-medium transition-colors text-xs md:text-sm ${activeView === 'gallery' ? 'bg-primary/10 text-primary' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                            >
                                <span className="material-symbols-outlined text-base md:text-lg">photo_library</span>
                                <span>Gallery</span>
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setActiveView('requests')}
                    className={`w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg font-medium transition-colors ${activeView === 'requests' ? 'bg-primary text-white' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                >
                    <span className="material-symbols-outlined text-[20px] md:text-[24px]">assignment</span>
                    <span className="text-xs md:text-sm">Requests</span>
                </button>

                <button
                    onClick={() => setActiveView('live-chat')}
                    className={`w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg font-medium transition-colors ${activeView === 'live-chat' ? 'bg-primary text-white' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                >
                    <span className="material-symbols-outlined text-[20px] md:text-[24px]">chat</span>
                    <span className="text-xs md:text-sm">Live Chat</span>
                </button>

                <button
                    onClick={() => setActiveView('analytics')}
                    className={`w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg font-medium transition-colors ${activeView === 'analytics' ? 'bg-primary text-white' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                >
                    <span className="material-symbols-outlined text-[20px] md:text-[24px]">insights</span>
                    <span className="text-xs md:text-sm">Analytics</span>
                </button>

                <button
                    onClick={() => setActiveView('settings')}
                    className={`w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg font-medium transition-colors ${activeView === 'settings' ? 'bg-primary text-white' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                >
                    <span className="material-symbols-outlined text-[20px] md:text-[24px]">settings</span>
                    <span className="text-xs md:text-sm">Settings</span>
                </button>
            </nav>

            <div className="p-3 md:p-4 border-t border-[#e7f3e8] dark:border-[#2a3d2c]">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-1.5 md:gap-2 py-1.5 md:py-2 text-xs md:text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[20px] md:text-[24px]">logout</span> Sign Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
