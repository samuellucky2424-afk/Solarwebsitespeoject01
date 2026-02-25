import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Link } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

interface DashboardOverviewProps {
    handleBookService: () => void;
    activeUser: any;
    notifications: any[]; // Replace with proper types from context
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ handleBookService, activeUser, notifications }) => {
    const { requests } = useAdmin();

    const [latestSystem, setLatestSystem] = useState<any | null>(null);

    useEffect(() => {
        const loadLatest = async () => {
            if (!activeUser?.id) return;
            try {
                const { data, error } = await supabase
                    .from('user_systems')
                    .select('*')
                    .eq('user_id', activeUser.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) throw error;
                setLatestSystem(data || null);
            } catch (err) {
                console.error('Failed to load latest system:', err);
                setLatestSystem(null);
            }
        };

        loadLatest();
    }, [activeUser?.id]);

    const systemCard = useMemo(() => {
        const sysData = latestSystem?.system_data || {};
        return {
            name: latestSystem?.name || sysData?.name || activeUser.systemName,
            address: sysData?.address || activeUser.address,
            installDate: latestSystem?.installation_date || sysData?.installDate || activeUser.installDate,
            status: latestSystem?.status || activeUser.systemStatus,
        };
    }, [activeUser.address, activeUser.installDate, activeUser.systemName, activeUser.systemStatus, latestSystem]);

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
        <div className="space-y-6 animate-in fade-in">
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">Welcome back, {activeUser.firstName}!</h1>
                    <p className="text-[#4c9a66] text-base lg:text-lg">Manage your solar system, orders, and service requests.</p>
                </div>
                <button
                    onClick={handleBookService}
                    className="bg-primary text-forest font-bold px-4 py-2.5 md:px-6 md:py-3 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 text-sm md:text-base"
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span> Book Service
                </button>
            </section>

            {/* Feature 1: System Information with Warranty & Status */}
            <section className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-6 shadow-sm relative overflow-hidden">
                {/* Status Indicator */}
                <div className="absolute top-0 right-0 p-6">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${getSystemStatusBadge(systemCard.status)}`}>
                        <span className={`size-1.5 rounded-full ${systemCard.status === 'Operational' ? 'bg-green-500 animate-pulse' : 'bg-current'}`}></span>
                        {systemCard.status}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                    <div className="size-16 md:size-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-4xl text-primary">solar_power</span>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl md:text-2xl font-bold">{systemCard.name}</h2>
                        </div>
                        <p className="text-[#4c9a66] dark:text-gray-400 text-sm md:text-base mb-4">{systemCard.address}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 bg-background-light dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/5">
                                <p className="text-[10px] text-[#4c9a66] uppercase font-bold mb-0.5">Installation Date</p>
                                <p className="font-semibold text-sm">{systemCard.installDate}</p>
                                {activeUser.installTime && <p className="text-[10px] text-gray-500">{activeUser.installTime}</p>}
                            </div>
                            <div className={`p-3 rounded-lg border ${isWarrantyActive ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'}`}>
                                <div className="flex justify-between items-center mb-0.5">
                                    <p className={`text-[10px] uppercase font-bold ${isWarrantyActive ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>
                                        {isWarrantyActive ? 'In Warranty' : 'Expired'}
                                    </p>
                                    {isWarrantyActive && <span className="text-[9px] font-bold text-green-600">{daysLeft} Days left</span>}
                                </div>
                                <p className="font-semibold text-xs md:text-sm">Ends: {activeUser.warrantyEnd}</p>
                            </div>
                            <div className="p-3 bg-background-light dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/5">
                                <p className="text-[10px] text-[#4c9a66] uppercase font-bold mb-0.5">Service Plan</p>
                                <p className="font-semibold text-sm">{activeUser.plan || 'Standard Plan'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Recent Activity (from Supabase) */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold dark:text-white">Recent Activity</h2>
                </div>
                <div className="bg-white dark:bg-[#152a17] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-white/5">
                        {(() => {
                            // Build activity items from real data
                            const activities: { id: string; icon: string; iconBg: string; iconColor: string; title: string; date: string; status: string; statusStyle: string }[] = [];

                            // Add service requests
                            requests.forEach(req => {
                                const iconMap: Record<string, { icon: string; bg: string; color: string }> = {
                                    'Maintenance Request': { icon: 'build', bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600' },
                                    'Package Request': { icon: 'shopping_bag', bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600' },
                                    'Site Survey Request': { icon: 'home_work', bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600' },
                                    'System Upgrade Request': { icon: 'upgrade', bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600' },
                                    'Consultation Request': { icon: 'support_agent', bg: 'bg-cyan-100 dark:bg-cyan-900/30', color: 'text-cyan-600' },
                                };
                                const iconInfo = iconMap[req.type] || { icon: 'assignment', bg: 'bg-gray-100 dark:bg-gray-700', color: 'text-gray-600' };

                                const statusStyles: Record<string, string> = {
                                    'New': 'bg-blue-100 text-blue-700',
                                    'In-progress': 'bg-amber-100 text-amber-700',
                                    'Completed': 'bg-green-100 text-green-700',
                                    'Pending': 'bg-amber-100 text-amber-700',
                                    'Approved': 'bg-green-100 text-green-700',
                                    'In Progress': 'bg-amber-100 text-amber-700',
                                    'Scheduled': 'bg-blue-100 text-blue-700',
                                };

                                activities.push({
                                    id: req.id,
                                    icon: iconInfo.icon,
                                    iconBg: iconInfo.bg,
                                    iconColor: iconInfo.color,
                                    title: `${req.type} — ${req.title}`,
                                    date: req.date,
                                    status: req.status,
                                    statusStyle: statusStyles[req.status] || 'bg-gray-100 text-gray-600',
                                });
                            });

                            // Show latest 5
                            const recent = activities.slice(0, 5);

                            if (recent.length === 0) {
                                return (
                                    <div className="p-8 text-center">
                                        <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2 block">history</span>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">No recent activity yet. Book a service or place an order to get started!</p>
                                    </div>
                                );
                            }

                            return recent.map(item => (
                                <div key={item.id} className="p-3 md:p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className={`size-8 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}>
                                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-xs md:text-sm dark:text-white truncate">{item.title}</p>
                                        <p className="text-[10px] text-gray-500">{item.date}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.statusStyle}`}>{item.status}</span>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DashboardOverview;
