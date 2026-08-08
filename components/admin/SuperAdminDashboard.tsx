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
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
            <section>
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Master control panel and comprehensive user tracking</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary">
                        <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <div className="bg-white dark:bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <span className="material-symbols-outlined text-xl">group</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold uppercase text-gray-400 tracking-widest">Total Users</span>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.totalUsers}</p>
                                <p className="text-xs text-gray-500 font-medium">All Registered</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                    <span className="material-symbols-outlined text-xl">how_to_reg</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold uppercase text-gray-400 tracking-widest">Active</span>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.activeUsers}</p>
                                <p className="text-xs text-emerald-600 font-medium">Active Users</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    <span className="material-symbols-outlined text-xl">person_off</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold uppercase text-gray-400 tracking-widest">Suspended</span>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.suspendedUsers}</p>
                                <p className="text-xs text-red-500 font-medium">Suspended</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                    <span className="material-symbols-outlined text-xl">diversity_3</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold uppercase text-gray-400 tracking-widest">Affiliates</span>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">{stats.totalAffiliates}</p>
                                <p className="text-xs text-gray-500 font-medium">{stats.totalReferrals} Referrals</p>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default SuperAdminDashboard;
