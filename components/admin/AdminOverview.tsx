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

    return (
        <div className="space-y-10 animate-in fade-in">
            {/* Quick Stats */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-xl font-bold">Overview</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                                <span className="material-symbols-outlined">package_2</span>
                            </div>
                            <span className="text-xs font-bold uppercase text-gray-400">Packages</span>
                        </div>
                        <p className="text-3xl font-black">{packages.length}</p>
                        <p className="text-xs text-[#4c9a52] font-bold uppercase mt-1">Total packages</p>
                    </div>
                    <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                                <span className="material-symbols-outlined">pending_actions</span>
                            </div>
                            <span className="text-xs font-bold uppercase text-gray-400">Requests</span>
                        </div>
                        <p className="text-3xl font-black">{requests.filter(r => normalizeStatus(r.status) !== 'Completed').length}</p>
                        <p className="text-xs text-[#4c9a52] font-bold uppercase mt-1">Pending requests</p>
                    </div>
                    <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                                <span className="material-symbols-outlined">task_alt</span>
                            </div>
                            <span className="text-xs font-bold uppercase text-gray-400">Installations</span>
                        </div>
                        <p className="text-3xl font-black">
                            {requests.filter(r => (r.type === 'Installation' || r.type === 'Package Request') && normalizeStatus(r.status) === 'Completed').length}
                        </p>
                        <p className="text-xs text-[#4c9a52] font-bold uppercase mt-1">Completed installations</p>
                    </div>
                    <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                                <span className="material-symbols-outlined">build</span>
                            </div>
                            <span className="text-xs font-bold uppercase text-gray-400">Maintenance</span>
                        </div>
                        <p className="text-3xl font-black">
                            {requests.filter(r => (r.type === 'Maintenance' || r.type === 'Maintenance Request') && normalizeStatus(r.status) !== 'Completed').length}
                        </p>
                        <p className="text-xs text-[#4c9a52] font-bold uppercase mt-1">Open maintenance requests</p>
                    </div>
                </div>
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black">Requests by type</h3>
                        <span className="text-xs font-bold text-gray-500">{requests.length} total</span>
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
                            <div className="space-y-3">
                                {rows.map(([k, v]) => (
                                    <div key={k} className="grid grid-cols-12 items-center gap-3">
                                        <div className="col-span-4 min-w-0">
                                            <p className="text-xs font-black uppercase tracking-wider text-[#4c9a52] truncate">{k}</p>
                                        </div>
                                        <div className="col-span-6">
                                            <div className="h-2.5 rounded-full bg-[#e7f3e8] dark:bg-[#1a331c] overflow-hidden">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${max ? Math.round((v / max) * 100) : 0}%` }} />
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <span className="text-sm font-black">{v}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No request data yet.</p>
                        );
                    })()}
                </div>

                <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black">Package popularity</h3>
                        <span className="text-xs font-bold text-gray-500">linked by Package ID</span>
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
