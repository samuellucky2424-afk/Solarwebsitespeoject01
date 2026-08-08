import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';

const SuperAdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        totalReferrals: 0,
        totalAffiliates: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Fetch basic counts using edge function
                const { data: usersData, error: usersErr } = await supabase.functions.invoke('admin-list-users');
                
                let active = 0;
                let suspended = 0;
                let total = 0;

                if (usersData?.users) {
                    total = usersData.users.length;
                    usersData.users.forEach((p: any) => {
                        if (p.suspended) suspended++;
                        else active++;
                    });
                }

                // Fetch affiliates
                const { count: affiliateCount } = await supabase
                    .from('affiliate_profiles')
                    .select('*', { count: 'exact', head: true });

                // Fetch referrals (from affiliate_rewards or referrals table if exists)
                const { count: rewardCount } = await supabase
                    .from('affiliate_rewards')
                    .select('*', { count: 'exact', head: true });

                setStats({
                    totalUsers: total,
                    activeUsers: active,
                    suspendedUsers: suspended,
                    totalReferrals: rewardCount || 0,
                    totalAffiliates: affiliateCount || 0
                });

            } catch (err) {
                console.error("Failed to fetch super admin stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-6 md:space-y-8 lg:space-y-10 animate-in fade-in">
            <section>
                <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 px-1">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0d1b0f] dark:text-white">Super Admin Dashboard</h2>
                        <p className="text-xs sm:text-sm text-[#4c9a66] dark:text-gray-400 mt-1">Master control panel and comprehensive user tracking</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary">
                        <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                        <div className="bg-gradient-to-br from-[#152a17] to-[#0d1b0f] dark:from-[#0d1b0f] dark:to-[#050a06] p-3 md:p-5 rounded-xl border border-[#2a3d2c] shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all"></div>
                            <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
                                <div className="p-1.5 md:p-2.5 rounded-lg bg-white/10 text-white shadow-sm backdrop-blur-sm border border-white/5">
                                    <span className="material-symbols-outlined text-xl md:text-2xl">group</span>
                                </div>
                                <span className="text-[9px] md:text-xs font-bold uppercase text-gray-400 tracking-wider">Total Users</span>
                            </div>
                            <p className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 relative z-10">{stats.totalUsers}</p>
                            <p className="text-[9px] md:text-xs text-[#4c9a52] font-bold uppercase tracking-wider relative z-10">All Registered</p>
                        </div>

                        <div className="bg-white dark:bg-[#152a17] p-3 md:p-5 rounded-xl border border-[#d0e5d5] dark:border-[#2a3d2c] shadow-md hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-3 md:mb-4">
                                <div className="p-1.5 md:p-2.5 rounded-lg bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 text-green-600 shadow-sm">
                                    <span className="material-symbols-outlined text-xl md:text-2xl">how_to_reg</span>
                                </div>
                                <span className="text-[9px] md:text-xs font-bold uppercase text-gray-400 tracking-wider">Active</span>
                            </div>
                            <p className="text-2xl md:text-4xl font-black text-[#0d1b0f] dark:text-white mb-1 md:mb-2">{stats.activeUsers}</p>
                            <p className="text-[9px] md:text-xs text-green-600 font-bold uppercase tracking-wider">Active Users</p>
                        </div>

                        <div className="bg-white dark:bg-[#152a17] p-3 md:p-5 rounded-xl border border-[#d0e5d5] dark:border-[#2a3d2c] shadow-md hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-3 md:mb-4">
                                <div className="p-1.5 md:p-2.5 rounded-lg bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10 text-red-600 shadow-sm">
                                    <span className="material-symbols-outlined text-xl md:text-2xl">person_off</span>
                                </div>
                                <span className="text-[9px] md:text-xs font-bold uppercase text-gray-400 tracking-wider">Suspended</span>
                            </div>
                            <p className="text-2xl md:text-4xl font-black text-[#0d1b0f] dark:text-white mb-1 md:mb-2">{stats.suspendedUsers}</p>
                            <p className="text-[9px] md:text-xs text-red-500 font-bold uppercase tracking-wider">Suspended</p>
                        </div>

                        <div className="bg-gradient-to-br from-primary to-[#4c9a52] p-3 md:p-5 rounded-xl border border-primary shadow-lg relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 -mb-6 -mr-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all"></div>
                            <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
                                <div className="p-1.5 md:p-2.5 rounded-lg bg-black/10 text-white shadow-sm backdrop-blur-sm border border-black/5">
                                    <span className="material-symbols-outlined text-xl md:text-2xl">diversity_3</span>
                                </div>
                                <span className="text-[9px] md:text-xs font-bold uppercase text-white/80 tracking-wider">Affiliates</span>
                            </div>
                            <p className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 relative z-10">{stats.totalAffiliates}</p>
                            <p className="text-[9px] md:text-xs text-white/90 font-bold uppercase tracking-wider relative z-10">{stats.totalReferrals} Referrals</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default SuperAdminDashboard;
