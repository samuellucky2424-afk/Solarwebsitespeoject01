import React, { useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';

const normalizeType = (type: string) => {
    switch (type) {
        case 'Installation':
        case 'Package Request':
            return 'Package requests';
        case 'Maintenance':
        case 'Maintenance Request':
            return 'Maintenance';
        case 'Survey':
        case 'Site Survey Request':
            return 'Site surveys';
        case 'Upgrade':
        case 'System Upgrade Request':
            return 'Upgrades';
        case 'Consultation Request':
        default:
            return 'Consultations';
    }
};

const normalizeStatus = (status: string) => {
    switch (status) {
        case 'Completed':
            return 'Completed';
        case 'In-progress':
        case 'In Progress':
            return 'In-progress';
        default:
            return 'Pending';
    }
};

const AdminOverview: React.FC = () => {
    const { requests, packages, updateRequestStatus, deleteRequest } = useAdmin();

    // Using filtered requests logic for overview (e.g. Action Required)
    const pendingRequests = useMemo(() => {
        return requests.filter(req => normalizeStatus(req.status) !== 'Completed' || req.priority === 'High');
    }, [requests]);

    const handleApprove = (id: string) => {
        updateRequestStatus(id, 'In-progress');
    };

    const handleDismiss = (id: string) => {
        if (window.confirm('Dismiss this request?')) {
            deleteRequest(id);
        }
    };

    // Safely render a value that might be an object (from greenlife_hub metadata)
    const safeText = (val: unknown): string => {
        if (val == null) return '—';
        if (typeof val === 'string') return val || '—';
        if (typeof val === 'number' || typeof val === 'boolean') return String(val);
        try { return JSON.stringify(val); } catch { return '—'; }
    };

    return (
        <div className="space-y-6 md:space-y-8 lg:space-y-10 animate-in fade-in">
            {/* Quick Stats */}
            <section>
                <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 px-1">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0d1b0f] dark:text-white">System Overview</h2>
                        <p className="text-xs sm:text-sm text-[#4c9a66] dark:text-gray-400 mt-1">Real-time dashboard metrics</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    <div className="bg-white dark:bg-[#152a17] p-3 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl md:rounded-2xl border border-[#d0e5d5] dark:border-[#2a3d2c] shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <div className="flex justify-between items-start mb-3 sm:mb-4 md:mb-6">
                            <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-lg md:rounded-xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 text-green-600 shadow-md">
                                <span className="material-symbols-outlined text-2xl sm:text-3xl md:text-4xl font-light">package_2</span>
                            </div>
                            <span className="text-[9px] sm:text-xs md:text-sm font-bold uppercase text-gray-400 tracking-wider">Packages</span>
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0d1b0f] dark:text-white mb-1.5 sm:mb-2">{packages.length}</p>
                        <p className="text-[9px] sm:text-xs md:text-sm text-[#4c9a52] font-bold uppercase tracking-wider">Total Packages</p>
                    </div>
                    <div className="bg-white dark:bg-[#152a17] p-3 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl md:rounded-2xl border border-[#d0e5d5] dark:border-[#2a3d2c] shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <div className="flex justify-between items-start mb-3 sm:mb-4 md:mb-6">
                            <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-lg md:rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 text-blue-600 shadow-md">
                                <span className="material-symbols-outlined text-2xl sm:text-3xl md:text-4xl font-light">pending_actions</span>
                            </div>
                            <span className="text-[9px] sm:text-xs md:text-sm font-bold uppercase text-gray-400 tracking-wider">Action Items</span>
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0d1b0f] dark:text-white mb-1.5 sm:mb-2">{requests.filter(r => normalizeStatus(r.status) !== 'Completed').length}</p>
                        <p className="text-[9px] sm:text-xs md:text-sm text-[#4c9a52] font-bold uppercase tracking-wider">Pending Requests</p>
                    </div>
                    <div className="bg-white dark:bg-[#152a17] p-3 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl md:rounded-2xl border border-[#d0e5d5] dark:border-[#2a3d2c] shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <div className="flex justify-between items-start mb-3 sm:mb-4 md:mb-6">
                            <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/10 text-emerald-600 shadow-md">
                                <span className="material-symbols-outlined text-2xl sm:text-3xl md:text-4xl font-light">task_alt</span>
                            </div>
                            <span className="text-[9px] sm:text-xs md:text-sm font-bold uppercase text-gray-400 tracking-wider">Completed</span>
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0d1b0f] dark:text-white mb-1.5 sm:mb-2">
                            {requests.filter(r => (r.type === 'Installation' || r.type === 'Package Request') && normalizeStatus(r.status) === 'Completed').length}
                        </p>
                        <p className="text-[9px] sm:text-xs md:text-sm text-[#4c9a52] font-bold uppercase tracking-wider">Installations</p>
                    </div>
                    <div className="bg-white dark:bg-[#152a17] p-3 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl md:rounded-2xl border border-[#d0e5d5] dark:border-[#2a3d2c] shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <div className="flex justify-between items-start mb-3 sm:mb-4 md:mb-6">
                            <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-lg md:rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 text-amber-600 shadow-md">
                                <span className="material-symbols-outlined text-2xl sm:text-3xl md:text-4xl font-light">build</span>
                            </div>
                            <span className="text-[9px] sm:text-xs md:text-sm font-bold uppercase text-gray-400 tracking-wider">Maintenance</span>
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0d1b0f] dark:text-white mb-1.5 sm:mb-2">
                            {requests.filter(r => (r.type === 'Maintenance' || r.type === 'Maintenance Request') && normalizeStatus(r.status) !== 'Completed').length}
                        </p>
                        <p className="text-[9px] sm:text-xs md:text-sm text-[#4c9a52] font-bold uppercase tracking-wider">Open Tickets</p>
                    </div>
                </div>
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
                <div className="bg-white dark:bg-[#152a17] rounded-lg sm:rounded-xl md:rounded-2xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-4 md:p-5 lg:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-5">
                        <h3 className="text-base sm:text-lg md:text-xl font-black">Requests by type</h3>
                        <span className="text-[9px] sm:text-xs md:text-sm font-bold text-gray-500">{requests.length} total</span>
                    </div>
                    {(() => {
                        const counts = requests.reduce<Record<string, number>>((acc, r) => {
                            const key = normalizeType(r.type);
                            acc[key] = (acc[key] || 0) + 1;
                            return acc;
                        }, {});
                        const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                        const max = Math.max(0, ...rows.map(([, v]) => v));
                        return rows.length ? (
                            <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                {rows.map(([k, v]) => (
                                    <div key={k} className="grid grid-cols-12 items-center gap-2 sm:gap-3">
                                        <div className="col-span-4 min-w-0">
                                            <p className="text-[9px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-[#4c9a52] truncate">{k}</p>
                                        </div>
                                        <div className="col-span-6">
                                            <div className="h-2 sm:h-2.5 md:h-3 rounded-full bg-[#e7f3e8] dark:bg-[#1a331c] overflow-hidden">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${max ? Math.round((v / max) * 100) : 0}%` }} />
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <span className="text-xs sm:text-sm md:text-base font-black">{v}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No request data yet.</p>
                        );
                    })()}
                </div>

                <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-4 md:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <h3 className="text-base md:text-lg font-black">Package popularity</h3>
                        <span className="text-[10px] md:text-xs font-bold text-gray-500">linked by Package ID</span>
                    </div>
                    {(() => {
                        const counts = requests.reduce<Record<string, number>>((acc, r: any) => {
                            const pid = r.packageId;
                            if (!pid) return acc;
                            acc[pid] = (acc[pid] || 0) + 1;
                            return acc;
                        }, {});
                        const rows = packages
                            .map(p => ({ id: p.id, name: p.name, count: counts[p.id] || 0 }))
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 6);
                        const max = Math.max(0, ...rows.map(r => r.count));
                        return rows.length ? (
                            <div className="space-y-3">
                                {rows.map(r => (
                                    <div key={r.id} className="grid grid-cols-12 items-center gap-3">
                                        <div className="col-span-5 min-w-0">
                                            <p className="font-bold truncate">{r.name}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">ID: {r.id}</p>
                                        </div>
                                        <div className="col-span-5">
                                            <div className="h-2.5 rounded-full bg-[#e7f3e8] dark:bg-[#1a331c] overflow-hidden">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${max ? Math.round((r.count / max) * 100) : 0}%` }} />
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <span className="text-sm font-black">{r.count}</span>
                                        </div>
                                    </div>
                                ))}
                                <p className="text-xs text-gray-500 pt-2">
                                    Tip: requests with a Package ID will automatically drive this chart.
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No packages yet.</p>
                        );
                    })()}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-3 md:mb-4 px-1">
                    <h2 className="text-lg md:text-xl font-bold flex items-center gap-1.5 md:gap-2">
                        <span className="material-symbols-outlined text-orange-500 text-[20px] md:text-[24px]">priority_high</span> Action Required
                    </h2>
                    <span className="text-xs md:text-sm text-primary font-bold bg-primary/10 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full">{pendingRequests.length} Pending</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {pendingRequests.length > 0 ? pendingRequests.map((req) => (
                        <div key={req.id} className="flex gap-3 md:gap-4 p-4 md:p-5 bg-white dark:bg-[#152a17] border border-[#cfe7d1] dark:border-[#2a3d2c] rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-1 h-full ${req.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                            <div className="flex flex-col gap-1 flex-1 min-w-0 pl-1.5 md:pl-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-base md:text-lg font-bold truncate">{safeText(req.title)}</h3>
                                    <span className={`text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded uppercase shrink-0 ${req.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>{safeText(req.type)}</span>
                                </div>
                                <p className="text-xs md:text-sm font-bold text-forest dark:text-white">{safeText(req.customer)}</p>
                                <div className="text-[10px] md:text-xs text-forest/70 dark:text-gray-400 mt-1 space-y-0.5">
                                    <p className="font-semibold">{safeText(req.address)}</p>
                                    <div className="flex gap-2 md:gap-3">
                                        <span>{safeText(req.phone)}</span>
                                        <span>•</span>
                                        <span className="truncate">{safeText(req.email)}</span>
                                    </div>
                                </div>
                                <p className="text-[#4c9a52] text-[10px] md:text-xs leading-relaxed line-clamp-2 mt-1.5 md:mt-2 italic">"{safeText(req.description)}"</p>
                                <div className="mt-3 md:mt-4 flex gap-2 md:gap-3">
                                    <button onClick={() => handleApprove(req.id)} className="px-3 md:px-4 py-1.5 bg-blue-600 text-white text-[10px] md:text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">Approve</button>
                                    <button onClick={() => handleDismiss(req.id)} className="px-3 md:px-4 py-1.5 border border-[#cfe7d1] text-[#4c9a52] text-[10px] md:text-xs font-bold rounded-lg hover:bg-background-light dark:hover:bg-[#1d351f] transition-colors">Dismiss</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 py-8 md:py-12 text-center border-2 border-dashed border-[#cfe7d1] rounded-xl">
                            <p className="text-gray-500 text-sm">No pending actions required.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminOverview;
