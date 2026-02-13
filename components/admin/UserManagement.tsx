import React, { useState } from 'react';
import { useAdmin, Referral } from '../../context/AdminContext';

const UserManagement: React.FC = () => {
    const { activeUser, updateUserSystem, referrals, approveReferral } = useAdmin();

    // Modal State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [rewardAmount, setRewardAmount] = useState<string>('');
    const [rewardDays, setRewardDays] = useState<string>('30');
    const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateUserSystem({ systemStatus: e.target.value as any });
    };

    const handleWarrantyChange = (field: 'warrantyStart' | 'warrantyEnd', value: string) => {
        updateUserSystem({ [field]: value });
    };

    const handleOpenReward = (ref: Referral) => {
        setSelectedReferral(ref);
        setRewardAmount('');
    };

    const handleGenerateReward = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReferral || !rewardAmount) return;

        approveReferral(selectedReferral.id, Number(rewardAmount), Number(rewardDays));
        setSelectedReferral(null);
        alert("Reward generated!"); // Replace with toast later or parent callback
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">User Management</h2>
            </div>

            <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#cfe7d1] dark:border-[#2a3d2c]">
                    <h3 className="font-bold">Active Customer Database</h3>
                </div>
                <div className="p-4">
                    {/* Simulating a list, highlighting the active demo user */}
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 bg-background-light dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-cover" style={{ backgroundImage: `url('${activeUser.avatar}')` }}></div>
                                <div>
                                    <p className="font-bold">{activeUser.fullName}</p>
                                    <p className="text-xs text-gray-500">{activeUser.email}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${activeUser.systemStatus === 'Operational' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {activeUser.systemStatus}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsUserModalOpen(true)} className="px-4 py-2 bg-primary text-forest text-sm font-bold rounded-lg hover:brightness-105 transition-colors">
                                Manage User
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Management Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-[#152a17] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Manage: {activeUser.fullName}</h2>
                            <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-6 space-y-8">

                            {/* System Control */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">System Control</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold mb-2">System Status</label>
                                        <select
                                            value={activeUser.systemStatus}
                                            onChange={handleStatusChange}
                                            className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-background-light dark:bg-black/20"
                                        >
                                            <option value="Operational">Operational</option>
                                            <option value="Maintenance">Under Maintenance</option>
                                            <option value="Offline">Offline</option>
                                            <option value="Out of Care">Out of Care (Warranty Void)</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-bold mb-2">Warranty Start</label>
                                            <input type="date" value={activeUser.warrantyStart} onChange={(e) => handleWarrantyChange('warrantyStart', e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-background-light dark:bg-black/20 text-xs" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-2">Warranty End</label>
                                            <input type="date" value={activeUser.warrantyEnd} onChange={(e) => handleWarrantyChange('warrantyEnd', e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-background-light dark:bg-black/20 text-xs" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Referral Management */}
                            <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/10">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Referral Approval</h3>
                                <div className="bg-background-light dark:bg-black/20 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10">
                                    {referrals.filter(r => r.referrerId === activeUser.id).map(ref => (
                                        <div key={ref.id} className="p-4 border-b border-gray-100 dark:border-white/5 last:border-0 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold">{ref.refereeName}</p>
                                                <p className="text-xs text-gray-500">Purchase: ₦{ref.refereePurchaseTotal.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                {ref.status === 'Qualified' || (ref.status === 'Pending' && ref.refereePurchaseTotal >= 100000) ? (
                                                    <button
                                                        onClick={() => handleOpenReward(ref)}
                                                        className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600"
                                                    >
                                                        Approve Reward
                                                    </button>
                                                ) : (
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${ref.status === 'Approved' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                                        {ref.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reward Generation Form */}
                                {selectedReferral && (
                                    <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl animate-in fade-in">
                                        <h4 className="font-bold text-sm mb-3">Generate Discount Code for {selectedReferral.refereeName} Referral</h4>
                                        <form onSubmit={handleGenerateReward} className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold mb-1">Amount (₦)</label>
                                                <input required type="number" value={rewardAmount} onChange={(e) => setRewardAmount(e.target.value)} className="w-full p-2 rounded border text-sm" placeholder="5000" />
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-xs font-bold mb-1">Days Valid</label>
                                                <input required type="number" value={rewardDays} onChange={(e) => setRewardDays(e.target.value)} className="w-full p-2 rounded border text-sm" />
                                            </div>
                                            <button type="submit" className="bg-primary text-forest font-bold px-4 py-2 rounded text-sm hover:brightness-105">Generate</button>
                                        </form>
                                    </div>
                                )}
                            </section>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
