import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type AdminView = 'overview' | 'products' | 'packages' | 'requests' | 'gallery' | 'analytics' | 'settings';

interface AdminSidebarProps {
    activeView: AdminView;
    setActiveView: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView }) => {
    const { signOut } = useAuth();
    const [isCatalogOpen, setIsCatalogOpen] = useState(true);

    const handleLogout = () => {
        if (window.confirm("Sign out of Admin Dashboard?")) {
            signOut();
        }
    };

    return (
        <aside className="w-64 border-r border-[#e7f3e8] dark:border-[#2a3d2c] bg-white dark:bg-[#152a17] flex flex-col shrink-0 hidden md:flex h-full">
            <div className="p-6">
                <Link to="/" className="flex items-center gap-3">
                    <div className="size-10 flex items-center justify-center">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[#0d1b0f] dark:text-white text-base font-bold leading-none">Greenlife Solar</h1>
                        <p className="text-[#4c9a52] text-xs font-medium mt-1 uppercase tracking-wider">Admin Panel</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                <button
                    onClick={() => setActiveView('overview')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeView === 'overview' ? 'bg-primary text-white' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                >
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-sm">Overview</span>
                </button>

                {/* Catalog Group */}
                <div className="pt-2">
                    <button
                        onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase text-gray-500 hover:text-primary transition-colors mb-1"
                    >
                        <span>Catalog & Assets</span>
                        <span className={`material-symbols-outlined text-sm transition-transform ${isCatalogOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {isCatalogOpen && (
                        <div className="space-y-1 pl-2 border-l-2 border-[#e7f3e8] dark:border-[#2a3d2c] ml-4">
                            <button
                                onClick={() => setActiveView('products')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-r-lg font-medium transition-colors text-sm ${activeView === 'products' ? 'bg-primary/10 text-primary' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                            >
                                <span className="material-symbols-outlined text-lg">inventory_2</span>
                                <span>Products (optional)</span>
                            </button>
                            <button
                                onClick={() => setActiveView('packages')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-r-lg font-medium transition-colors text-sm ${activeView === 'packages' ? 'bg-primary/10 text-primary' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                            >
                                <span className="material-symbols-outlined text-lg">package_2</span>
                                <span>Packages</span>
                            </button>
                            <button
                                onClick={() => setActiveView('gallery')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-r-lg font-medium transition-colors text-sm ${activeView === 'gallery' ? 'bg-primary/10 text-primary' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                            >
                                <span className="material-symbols-outlined text-lg">photo_library</span>
                                <span>Gallery</span>
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setActiveView('requests')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeView === 'requests' ? 'bg-primary text-white' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                >
                    <span className="material-symbols-outlined">assignment</span>
                    <span className="text-sm">Requests</span>
                </button>

                <button
                    onClick={() => setActiveView('analytics')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeView === 'analytics' ? 'bg-primary text-white' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                >
                    <span className="material-symbols-outlined">insights</span>
                    <span className="text-sm">Analytics</span>
                </button>

                <button
                    onClick={() => setActiveView('settings')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeView === 'settings' ? 'bg-primary text-white' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}
                >
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-sm">Settings</span>
                </button>
            </nav>

            <div className="p-4 border-t border-[#e7f3e8] dark:border-[#2a3d2c]">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">logout</span> Sign Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
