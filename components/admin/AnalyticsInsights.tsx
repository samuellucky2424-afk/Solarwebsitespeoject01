import React, { useMemo } from 'react';
import { useAdmin, ServiceRequest } from '../../context/AdminContext';

const normalizeType = (type: ServiceRequest['type']) => {
  switch (type) {
    case 'Installation':
    case 'Package Request':
      return 'Package Requests';
    case 'Maintenance':
    case 'Maintenance Request':
      return 'Maintenance';
    case 'Survey':
    case 'Site Survey Request':
      return 'Site Surveys';
    case 'Upgrade':
    case 'System Upgrade Request':
      return 'Upgrades';
    case 'Consultation Request':
    default:
      return 'Consultations';
  }
};

const normalizeStatus = (status: ServiceRequest['status']) => {
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

const BarRow: React.FC<{ label: string; value: number; max: number; tone?: 'primary' | 'muted' }> = ({
  label,
  value,
  max,
  tone = 'primary',
}) => {
  const pct = max <= 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="grid grid-cols-12 items-center gap-3">
      <div className="col-span-4 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-[#4c9a52] truncate">{label}</p>
      </div>
      <div className="col-span-6">
        <div className="h-2.5 rounded-full bg-[#e7f3e8] dark:bg-[#1a331c] overflow-hidden">
          <div
            className={`h-full rounded-full ${tone === 'primary' ? 'bg-primary' : 'bg-[#4c9a52]/50'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="col-span-2 text-right">
        <span className="text-sm font-black">{value}</span>
      </div>
    </div>
  );
};

const AnalyticsInsights: React.FC = () => {
  const { requests, packages } = useAdmin();

  const requestsByType = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of requests) {
      const key = normalizeType(r.type);
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [requests]);

  const tasksByStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of requests) {
      const key = normalizeStatus(r.status);
      map.set(key, (map.get(key) || 0) + 1);
    }
    const order = ['Pending', 'In-progress', 'Completed'];
    return Array.from(map.entries()).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  }, [requests]);

  const packagePopularity = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of requests) {
      if (!r.packageId) continue;
      counts.set(r.packageId, (counts.get(r.packageId) || 0) + 1);
    }
    return packages
      .map((p) => ({ id: p.id, name: p.name, count: counts.get(p.id) || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [requests, packages]);

  const maxType = Math.max(0, ...requestsByType.map(([, v]) => v));
  const maxStatus = Math.max(0, ...tasksByStatus.map(([, v]) => v));
  const maxPop = Math.max(0, ...packagePopularity.map((p) => p.count));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
        <p className="text-[#4c9a52]">Operational visibility across requests and packages</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black">Requests by type</h3>
            <span className="text-xs font-bold text-gray-500">{requests.length} total</span>
          </div>
          <div className="space-y-4">
            {requestsByType.length ? (
              requestsByType.map(([k, v]) => <BarRow key={k} label={k} value={v} max={maxType} />)
            ) : (
              <p className="text-sm text-gray-500">No request data yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black">Completed vs pending tasks</h3>
            <span className="text-xs font-bold text-gray-500">status overview</span>
          </div>
          <div className="space-y-4">
            {tasksByStatus.length ? (
              tasksByStatus.map(([k, v]) => (
                <BarRow key={k} label={k} value={v} max={maxStatus} tone={k === 'Completed' ? 'primary' : 'muted'} />
              ))
            ) : (
              <p className="text-sm text-gray-500">No request data yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black">Packages by popularity</h3>
            <span className="text-xs font-bold text-gray-500">based on linked requests</span>
          </div>
          <div className="space-y-4">
            {packagePopularity.length ? (
              packagePopularity.map((p) => (
                <div key={p.id} className="grid grid-cols-12 items-center gap-3">
                  <div className="col-span-5 min-w-0">
                    <p className="font-bold truncate">{p.name}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">ID: {p.id}</p>
                  </div>
                  <div className="col-span-5">
                    <div className="h-2.5 rounded-full bg-[#e7f3e8] dark:bg-[#1a331c] overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${maxPop ? Math.round((p.count / maxPop) * 100) : 0}%` }} />
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-black">{p.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No package-linked requests yet (link requests to Package ID to populate this chart).</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsInsights;

