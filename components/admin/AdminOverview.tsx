import React, { useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';

const AdminOverview: React.FC = () => {
    const { requests, updateRequestStatus, deleteRequest, stats } = useAdmin();

    // Using filtered requests logic for overview (e.g. Action Required)
    const pendingRequests = useMemo(() => {
        return requests.filter(req => req.status === 'Pending' || req.priority === 'High');
    }, [requests]);

    const handleApprove = (id: string) => {
        updateRequestStatus(id, 'Scheduled');
    };

    const handleDismiss = (id: string) => {
        if (window.confirm('Dismiss this request?')) {
            deleteRequest(id);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in">
            {/* Quick Stats */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-xl font-bold">Quick Stats</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                                <span className="material-symbols-outlined">inventory_2</span>
                            </div>
                            <span className="text-xs font-bold uppercase text-gray-400">Inventory</span>
                        </div>
                        <p className="text-3xl font-black">{stats.lowStockCount}</p>
                        <p className="text-xs text-[#4c9a52] font-bold uppercase mt-1">Low Stock Alerts</p>
                    </div>
                    <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                                <span className="material-symbols-outlined">pending_actions</span>
                            </div>
                            <span className="text-xs font-bold uppercase text-gray-400">Services</span>
                        </div>
                        <p className="text-3xl font-black">{stats.pendingInstalls}</p>
                        <p className="text-xs text-[#4c9a52] font-bold uppercase mt-1">Pending Installs</p>
                    </div>
                    <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                                <span className="material-symbols-outlined">group</span>
                            </div>
                            <span className="text-xs font-bold uppercase text-gray-400">Users</span>
                        </div>
                        <p className="text-3xl font-black">{stats.activeCustomers}</p>
                        <p className="text-xs text-[#4c9a52] font-bold uppercase mt-1">Active Customers</p>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-500">priority_high</span> Action Required
                    </h2>
                    <span className="text-sm text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">{pendingRequests.length} Pending</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {pendingRequests.length > 0 ? pendingRequests.map((req) => (
                        <div key={req.id} className="flex gap-4 p-5 bg-white dark:bg-[#152a17] border border-[#cfe7d1] dark:border-[#2a3d2c] rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-1 h-full ${req.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                            <div className="flex flex-col gap-1 flex-1 min-w-0 pl-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold truncate">{req.title}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${req.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>{req.type}</span>
                                </div>
                                <p className="text-sm font-bold text-forest dark:text-white">{req.customer}</p>
                                <div className="text-xs text-forest/70 dark:text-gray-400 mt-1 space-y-0.5">
                                    <p className="font-semibold">{req.address}</p>
                                    <div className="flex gap-3">
                                        <span>{req.phone}</span>
                                        <span>•</span>
                                        <span className="truncate">{req.email}</span>
                                    </div>
                                </div>
                                <p className="text-[#4c9a52] text-xs leading-relaxed line-clamp-2 mt-2 italic">"{req.description}"</p>
                                <div className="mt-4 flex gap-3">
                                    <button onClick={() => handleApprove(req.id)} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">Approve</button>
                                    <button onClick={() => handleDismiss(req.id)} className="px-4 py-1.5 border border-[#cfe7d1] text-[#4c9a52] text-xs font-bold rounded-lg hover:bg-background-light dark:hover:bg-[#1d351f] transition-colors">Dismiss</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 py-12 text-center border-2 border-dashed border-[#cfe7d1] rounded-xl">
                            <p className="text-gray-500">No pending actions required.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminOverview;
