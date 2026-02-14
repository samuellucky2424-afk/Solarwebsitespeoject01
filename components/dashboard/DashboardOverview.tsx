import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Link } from 'react-router-dom';

interface DashboardOverviewProps {
    handleBookService: () => void;
    activeUser: any;
    notifications: any[]; // Replace with proper types from context
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ handleBookService, activeUser, notifications }) => {

    // Helper helpers
    const getSystemStatusBadge = (status: string) => {
        switch (status) {
            case 'Operational': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Maintenance': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Offline': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'Out of Care': return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const warrantyEnd = new Date(activeUser.warrantyEnd);
    const today = new Date();
    const isWarrantyActive = warrantyEnd > today;
    const daysLeft = Math.ceil((warrantyEnd.getTime() - today.getTime()) / (1000 * 3600 * 24));


    return (
        <div className="space-y-8 animate-in fade-in">
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Welcome back, {activeUser.firstName}!</h1>
                    <p className="text-[#4c9a66] text-lg">Manage your solar system, orders, and service requests.</p>
                </div>
                <button
                    onClick={handleBookService}
                    className="bg-primary text-forest font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add_circle</span> Book Service
                </button>
            </section>

            {/* Feature 1: System Information with Warranty & Status */}
            <section className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-8 shadow-sm relative overflow-hidden">
                {/* Status Indicator */}
                <div className="absolute top-0 right-0 p-8">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${getSystemStatusBadge(activeUser.systemStatus)}`}>
                        <span className={`size-2 rounded-full ${activeUser.systemStatus === 'Operational' ? 'bg-green-500 animate-pulse' : 'bg-current'}`}></span>
                        {activeUser.systemStatus}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="size-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-5xl text-primary">solar_power</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold">{activeUser.systemName}</h2>
                        </div>
                        <p className="text-[#4c9a66] dark:text-gray-400 text-lg mb-6">{activeUser.address}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-background-light dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/5">
                                <p className="text-xs text-[#4c9a66] uppercase font-bold mb-1">Installation Date</p>
                                <p className="font-semibold">{activeUser.installDate}</p>
                                {activeUser.installTime && <p className="text-xs text-gray-500">{activeUser.installTime}</p>}
                            </div>
                            <div className={`p-4 rounded-lg border ${isWarrantyActive ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <p className={`text-xs uppercase font-bold ${isWarrantyActive ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>
                                        {isWarrantyActive ? 'In Warranty' : 'Expired'}
                                    </p>
                                    {isWarrantyActive && <span className="text-[10px] font-bold text-green-600">{daysLeft} Days left</span>}
                                </div>
                                <p className="font-semibold text-sm">Ends: {activeUser.warrantyEnd}</p>
                            </div>
                            <div className="p-4 bg-background-light dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/5">
                                <p className="text-xs text-[#4c9a66] uppercase font-bold mb-1">Service Plan</p>
                                <p className="font-semibold">{activeUser.plan || 'Standard Plan'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Recent History */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold dark:text-white">Recent Activity</h2>
                </div>
                <div className="bg-white dark:bg-[#152a17] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-white/5">
                        <div className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined">shopping_bag</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm dark:text-white truncate">Order #ORD-248 - Cleaning Kit</p>
                                <p className="text-xs text-gray-500">2 days ago</p>
                            </div>
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Delivered</span>
                        </div>
                        <div className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined">build</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm dark:text-white truncate">Maintenance Request #REQ-101</p>
                                <p className="text-xs text-gray-500">1 week ago</p>
                            </div>
                            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">Pending</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DashboardOverview;
