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
        <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in">
            {/* Executive Header */}
            <section className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 sm:gap-4">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-[#4c9a66] dark:text-gray-400 mb-1 uppercase tracking-wider">System Overview</p>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 text-[#0d1b0f] dark:text-white">Welcome back, {activeUser.firstName}</h1>
                    <p className="text-sm sm:text-base text-[#4c9a66] dark:text-gray-300 font-medium max-w-2xl">Manage your solar system, orders, and service requests.</p>
                </div>
                <button
                    onClick={handleBookService}
                    className="bg-primary hover:bg-primary/90 active:scale-95 text-forest font-bold px-4 sm:px-5 py-2 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl shadow-md shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap h-fit"
                >
                    <span className="material-symbols-outlined text-base sm:text-lg font-light">add_circle</span> 
                    <span>Request Service</span>
                </button>
            </section>



            {/* Primary System Information Card */}
            <section className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1a2e21] dark:to-[#0d1b0f] rounded-lg sm:rounded-xl border border-[#d0e5d5] dark:border-white/10 p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-primary/3 rounded-full -ml-8 -mb-8 sm:-ml-12 sm:-mb-12"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10">
                    <div className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[8px] sm:text-xs font-bold uppercase tracking-wider ${getSystemStatusBadge(systemCard.status)} shadow-md`}>
                        <span className={`size-1 rounded-full ${systemCard.status === 'Operational' ? 'bg-green-500 animate-pulse' : 'bg-current'}`}></span>
                        {systemCard.status}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 items-start relative z-10">
                    <div className="size-12 sm:size-14 md:size-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 shadow-md">
                        <span className="material-symbols-outlined text-3xl sm:text-4xl md:text-5xl text-primary font-light">solar_power</span>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="mb-2 sm:mb-3">
                            <p className="text-[8px] sm:text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">Active System</p>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0d1b0f] dark:text-white mb-1">{systemCard.name}</h2>
                            <p className="text-xs sm:text-sm font-semibold text-[#4c9a66] dark:text-gray-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm sm:text-base font-light">location_on</span>
                                {systemCard.address}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
                            <div className="p-2 sm:p-3 bg-white dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
                                <p className="text-[7px] sm:text-xs text-[#4c9a66] uppercase font-bold tracking-wider mb-1">Installation</p>
                                <p className="font-bold text-xs sm:text-base text-[#0d1b0f] dark:text-white">{systemCard.installDate}</p>
                                {activeUser.installTime && <p className="text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activeUser.installTime}</p>}
                            </div>
                            <div className={`p-2 sm:p-3 rounded-lg border backdrop-blur-sm transition-colors ${isWarrantyActive ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 hover:border-green-300' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 hover:border-red-300'}`}>
                                <p className={`text-[7px] sm:text-xs uppercase font-bold tracking-wider mb-1 ${isWarrantyActive ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    Warranty
                                </p>
                                <p className="font-bold text-xs sm:text-base text-[#0d1b0f] dark:text-white">{isWarrantyActive ? 'Active' : 'Expired'}</p>
                                {isWarrantyActive && <p className="text-[8px] sm:text-xs font-semibold text-green-600 dark:text-green-400 mt-0.5">{daysLeft} days left</p>}
                            </div>
                            <div className="p-2 sm:p-3 bg-white dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
                                <p className="text-[7px] sm:text-xs text-[#4c9a66] uppercase font-bold tracking-wider mb-1">Service Plan</p>
                                <p className="font-bold text-xs sm:text-base text-[#0d1b0f] dark:text-white">{activeUser.plan || 'Premium'}</p>
                                <div className="inline-block bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 rounded text-[7px] sm:text-xs font-semibold mt-1">Active</div>
                            </div>
                            <div className="p-2 sm:p-3 bg-white dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/10 backdrop-blur-sm hover:border-primary/30 transition-colors">
                                <p className="text-[7px] sm:text-xs text-[#4c9a66] uppercase font-bold tracking-wider mb-1">Status</p>
                                <p className="font-bold text-xs sm:text-base text-[#0d1b0f] dark:text-white">Operational</p>
                                <p className="text-[8px] sm:text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">All systems normal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Activity Section */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <div>
                        <h2 className="text-xl font-bold text-[#0d1b0f] dark:text-white">Recent Activity</h2>
                        <p className="text-xs text-[#4c9a66] dark:text-gray-400 mt-0.5">Latest service requests and updates</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#d0e5d5] dark:border-white/10 overflow-hidden shadow-md">
                    <div className="grid grid-cols-1 divide-y divide-[#e7f3eb] dark:divide-white/5">
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
                                    'New': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                                    'In-progress': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                                    'Completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                                    'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                                    'Approved': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                                    'In Progress': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                                    'Scheduled': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                                };

                                activities.push({
                                    id: req.id,
                                    icon: iconInfo.icon,
                                    iconBg: iconInfo.bg,
                                    iconColor: iconInfo.color,
                                    title: `${req.type}`,
                                    date: req.date,
                                    status: req.status,
                                    statusStyle: statusStyles[req.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600',
                                });
                            });

                            // Show latest 4
                            const recent = activities.slice(0, 4);

                            if (recent.length === 0) {
                                return (
                                    <div className="p-6 sm:p-8 text-center">
                                        <span className="material-symbols-outlined text-3xl sm:text-4xl text-gray-300 dark:text-gray-600 mb-2 block font-light">history</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No recent activity</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Book a service to get started</p>
                                    </div>
                                );
                            }

                            return recent.map(item => (
                                <div key={item.id} className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                    <div className={`size-8 sm:size-10 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-outlined text-sm sm:text-lg font-light">{item.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-xs sm:text-sm text-[#0d1b0f] dark:text-white">{item.title}</p>
                                        <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.date}</p>
                                    </div>
                                    <span className={`text-[9px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${item.statusStyle}`}>{item.status}</span>
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
