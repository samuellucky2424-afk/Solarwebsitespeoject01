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
        <div className="space-y-8 animate-in fade-in">
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-3 text-[#0d1b0f] dark:text-white">Welcome back, {activeUser.firstName}!</h1>
                    <p className="text-[#4c9a66] dark:text-gray-300 text-lg font-medium">Manage your solar system, orders, and service requests all in one place.</p>
                </div>
                <button
                    onClick={handleBookService}
                    className="bg-primary hover:bg-primary/90 active:scale-95 text-forest font-bold px-8 py-3.5 md:px-10 md:py-4 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center gap-3 text-base md:text-lg whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-2xl font-light">add_circle</span> 
                    <span>Book a Service</span>
                </button>
            </section>

            {/* Feature 1: System Information with Warranty & Status */}
            <section className="bg-white dark:bg-[#1a2e21] rounded-2xl border border-[#d0e5d5] dark:border-white/5 p-8 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20"></div>
                
                {/* Status Indicator */}
                <div className="absolute top-8 right-8 z-10">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${getSystemStatusBadge(systemCard.status)} shadow-md`}>
                        <span className={`size-2 rounded-full ${systemCard.status === 'Operational' ? 'bg-green-500 animate-pulse' : 'bg-current'}`}></span>
                        {systemCard.status}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="size-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-md">
                        <span className="material-symbols-outlined text-6xl text-primary font-light">solar_power</span>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="mb-2">
                            <h2 className="text-3xl font-bold text-[#0d1b0f] dark:text-white mb-1">{systemCard.name}</h2>
                            <p className="text-[#4c9a66] dark:text-gray-400 text-base font-medium">{systemCard.address}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-25 dark:from-white/5 dark:to-white/2 rounded-xl border border-[#e7f3eb] dark:border-white/5 backdrop-blur-sm">
                                <p className="text-[11px] text-[#4c9a66] uppercase font-bold tracking-wider mb-1">Installation Date</p>
                                <p className="font-bold text-lg text-[#0d1b0f] dark:text-white">{systemCard.installDate}</p>
                                {activeUser.installTime && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activeUser.installTime}</p>}
                            </div>
                            <div className={`p-4 rounded-xl border backdrop-blur-sm ${isWarrantyActive ? 'bg-gradient-to-br from-green-50 to-green-25 border-green-200 dark:from-green-900/10 dark:to-green-900/5 dark:border-green-900/30' : 'bg-gradient-to-br from-red-50 to-red-25 border-red-200 dark:from-red-900/10 dark:to-red-900/5 dark:border-red-900/30'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <p className={`text-[11px] uppercase font-bold tracking-wider ${isWarrantyActive ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {isWarrantyActive ? 'Warranty Status: Active' : 'Warranty Expired'}
                                    </p>
                                </div>
                                <p className="font-bold text-lg text-[#0d1b0f] dark:text-white">Expires: {activeUser.warrantyEnd}</p>
                                {isWarrantyActive && <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">{daysLeft} days remaining</p>}
                            </div>
                            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-25 dark:from-white/5 dark:to-white/2 rounded-xl border border-[#e7f3eb] dark:border-white/5 backdrop-blur-sm">
                                <p className="text-[11px] text-[#4c9a66] uppercase font-bold tracking-wider mb-1">Service Plan</p>
                                <p className="font-bold text-lg text-[#0d1b0f] dark:text-white">{activeUser.plan || 'Standard Plan'}</p>
                                <div className="mt-2 inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">Active</div>
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
