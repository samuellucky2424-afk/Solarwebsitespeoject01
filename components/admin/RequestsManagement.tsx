import React, { useMemo, useState } from 'react';
import { useAdmin, ServiceRequest, SolarPackage } from '../../context/AdminContext';

type RequestTab =
  | 'All'
  | 'Package Request'
  | 'Maintenance Request'
  | 'Site Survey Request'
  | 'System Upgrade Request'
  | 'Consultation Request';

const normalizeRequestType = (type: ServiceRequest['type']): Exclude<RequestTab, 'All'> => {
  switch (type) {
    case 'Installation':
    case 'Package Request':
      return 'Package Request';
    case 'Maintenance':
    case 'Maintenance Request':
      return 'Maintenance Request';
    case 'Survey':
    case 'Site Survey Request':
      return 'Site Survey Request';
    case 'Upgrade':
    case 'System Upgrade Request':
      return 'System Upgrade Request';
    case 'Consultation Request':
    default:
      return 'Consultation Request';
  }
};

const normalizeStatusLabel = (status: ServiceRequest['status']): 'New' | 'In-progress' | 'Completed' => {
  switch (status) {
    case 'Completed':
      return 'Completed';
    case 'In-progress':
    case 'In Progress':
      return 'In-progress';
    case 'Approved':
    case 'Scheduled':
    case 'Pending':
    case 'New':
    default:
      return 'New';
  }
};

const statusPill = (status: ReturnType<typeof normalizeStatusLabel>) => {
  if (status === 'Completed') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (status === 'In-progress') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
};

interface RequestsManagementProps {
  onOpenPackage?: (packageId: string) => void;
}

// Safely render a value that might be an object (from greenlife_hub metadata)
const safeText = (val: unknown): string => {
  if (val == null) return '—';
  if (typeof val === 'string') return val || '—';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  try { return JSON.stringify(val); } catch { return '—'; }
};

const RequestsManagement: React.FC<RequestsManagementProps> = ({ onOpenPackage }) => {
  const { requests, packages, updateRequestStatus, deleteRequest } = useAdmin();
  const [activeTab, setActiveTab] = useState<RequestTab>('All');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'In-progress' | 'Completed'>('All');

  const packageById = useMemo(() => {
    const map = new Map<string, SolarPackage>();
    for (const p of packages) map.set(p.id, p);
    return map;
  }, [packages]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests
      .map((r) => ({
        ...r,
        _type: normalizeRequestType(r.type),
        _status: normalizeStatusLabel(r.status),
      }))
      .filter((r) => (activeTab === 'All' ? true : r._type === activeTab))
      .filter((r) => (statusFilter === 'All' ? true : r._status === statusFilter))
      .filter((r) => {
        if (!q) return true;
        const pkg = r.packageId ? packageById.get(r.packageId) : undefined;
        return (
          r.customer?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.phone?.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r._type.toLowerCase().includes(q) ||
          r._status.toLowerCase().includes(q) ||
          (r.packageId || '').toLowerCase().includes(q) ||
          (pkg?.name || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a._status !== b._status) return a._status.localeCompare(b._status);
        return (b.date || '').localeCompare(a.date || '');
      });
  }, [requests, activeTab, search, statusFilter, packageById]);

  const tabs: RequestTab[] = useMemo(
    () => ['All', 'Package Request', 'Maintenance Request', 'Site Survey Request', 'System Upgrade Request', 'Consultation Request'],
    []
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Customer Requests</h2>
          <p className="text-[#4c9a52]">Read-only user details; manage request status and workflow</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#152a17] border border-[#cfe7d1] dark:border-[#2a3d2c] rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search by customer, email, package ID..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-[#152a17] border border-[#cfe7d1] dark:border-[#2a3d2c] rounded-lg text-sm font-semibold outline-none hover:bg-background-light dark:hover:bg-black/10"
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="New">New</option>
            <option value="In-progress">In-progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${activeTab === t
              ? 'bg-primary text-forest border-primary'
              : 'bg-white dark:bg-[#152a17] border-[#cfe7d1] dark:border-[#2a3d2c] text-[#4c9a52] hover:bg-background-light dark:hover:bg-black/10'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Mobile Card Layout (below lg) ── */}
      <div className="lg:hidden space-y-3">
        {rows.length > 0 ? (
          rows.map((r) => {
            const pkg = r.packageId ? packageById.get(r.packageId) : undefined;
            return (
              <div key={r.id} className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm p-4 space-y-3">
                {/* Header: Customer + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{safeText(r.customer)}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{safeText(r.email)}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{safeText(r.phone)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${statusPill(r._status)}`}>
                    {r._status}
                  </span>
                </div>

                {/* Request details */}
                <div>
                  <p className="font-bold text-xs">{safeText(r.title)}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{safeText(r.description)}</p>
                </div>

                {/* Type + Package + T&C row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-background-light dark:bg-white/5 text-[#4c9a52] text-[9px] font-black uppercase tracking-wider">
                    {r._type}
                  </span>
                  {r.packageId && (
                    <button
                      type="button"
                      onClick={() => onOpenPackage?.(r.packageId!)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[9px] font-black"
                      title="Open package"
                    >
                      <span className="material-symbols-outlined text-[10px]">link</span>
                      {pkg?.name || r.packageId}
                    </button>
                  )}
                  {(r as any).metadata?.tcAgreed && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="material-symbols-outlined text-[10px]">check_circle</span>T&C
                    </span>
                  )}
                  {(r as any).metadata?.paymentConfirmed && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="material-symbols-outlined text-[10px]">payments</span>Paid
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#e7f3e8] dark:border-[#2a3d2c]">
                  <select
                    value={r._status}
                    onChange={(e) => {
                      const next = e.target.value as ReturnType<typeof normalizeStatusLabel>;
                      updateRequestStatus(r.id, next);
                    }}
                    className="flex-1 px-3 py-2 text-xs font-bold rounded-lg border border-[#cfe7d1] dark:border-[#2a3d2c] bg-white dark:bg-[#152a17] outline-none"
                    aria-label="Update request status"
                  >
                    <option value="New">New</option>
                    <option value="In-progress">In-progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this request?')) deleteRequest(r.id);
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete request"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center text-gray-500 bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c]">
            No requests match your filters.
          </div>
        )}
      </div>

      {/* ── Desktop Table Layout (lg and up) ── */}
      <div className="hidden lg:block bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-[#e7f3e8] dark:bg-[#1a331c]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Request</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Package</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">T&C / Payment</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7f3e8] dark:divide-[#2a3d2c]">
              {rows.length > 0 ? (
                rows.map((r) => {
                  const pkg = r.packageId ? packageById.get(r.packageId) : undefined;
                  return (
                    <tr key={r.id} className="hover:bg-background-light/60 dark:hover:bg-black/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="font-bold truncate">{safeText(r.customer)}</p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                            <p className="truncate">{safeText(r.email)}</p>
                            <p className="truncate">{safeText(r.phone)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm">{safeText(r.title)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 max-w-[420px]">{safeText(r.description)}</p>
                      </td>
                      <td className="px-6 py-4">
                        {r.packageId ? (
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => onOpenPackage?.(r.packageId!)}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black hover:bg-primary/15 transition-colors"
                              title="Open package"
                            >
                              <span className="material-symbols-outlined text-sm">link</span>
                              {r.packageId}
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[240px]">{pkg?.name || 'Package not found'}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-background-light dark:bg-white/5 text-[#4c9a52] text-[10px] font-black uppercase tracking-wider">
                          {r._type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusPill(r._status)}`}>
                          {r._status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {(r as any).metadata?.tcAgreed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="material-symbols-outlined text-xs">check_circle</span> T&C ✓
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">T&C —</span>
                          )}
                          {(r as any).metadata?.paymentConfirmed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="material-symbols-outlined text-xs">payments</span> Paid ✓
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">Paid —</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <select
                            value={r._status}
                            onChange={(e) => {
                              const next = e.target.value as ReturnType<typeof normalizeStatusLabel>;
                              updateRequestStatus(r.id, next);
                            }}
                            className="px-3 py-2 text-xs font-bold rounded-lg border border-[#cfe7d1] dark:border-[#2a3d2c] bg-white dark:bg-[#152a17] outline-none"
                            aria-label="Update request status"
                          >
                            <option value="New">New</option>
                            <option value="In-progress">In-progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this request?')) deleteRequest(r.id);
                            }}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete request"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No requests match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RequestsManagement;

