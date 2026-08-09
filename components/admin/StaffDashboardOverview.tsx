import React, { useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';

interface StaffDashboardOverviewProps {
  onNavigate: (view: 'overview' | 'orders' | 'products' | 'packages' | 'requests' | 'gallery' | 'invoices') => void;
  onOpenAddProduct?: () => void;
  onOpenAddPackage?: () => void;
}

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

const safeText = (val: unknown): string => {
  if (val == null) return '—';
  if (typeof val === 'string') return val || '—';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  try { return JSON.stringify(val); } catch { return '—'; }
};

const StaffDashboardOverview: React.FC<StaffDashboardOverviewProps> = ({
  onNavigate,
  onOpenAddProduct,
  onOpenAddPackage
}) => {
  const { inventory, packages, requests, gallery, updateRequestStatus } = useAdmin();

  // Low stock products count
  const lowStockItems = useMemo(() => {
    return inventory.filter(p => p.badge === 'Low Stock' || p.badge === 'Out of Stock' || (p.stock !== null && p.stock <= 5));
  }, [inventory]);

  // Pending Quote & Service Requests
  const pendingRequests = useMemo(() => {
    return requests.filter(req => normalizeStatus(req.status) !== 'Completed');
  }, [requests]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Staff Operations Portal
              </span>
              <span className="text-xs text-slate-400 font-medium">E-Commerce Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Staff Operations Dashboard</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Manage inventory products, solar packages, gallery showcases, customer quote requests, invoices, and orders seamlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                onNavigate('products');
                if (onOpenAddProduct) setTimeout(onOpenAddProduct, 100);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-forest font-bold rounded-xl text-sm hover:shadow-lg hover:brightness-105 transition-all"
            >
              <span className="material-symbols-outlined text-lg">add_box</span>
              <span>+ Add Product</span>
            </button>
            <button
              onClick={() => {
                onNavigate('packages');
                if (onOpenAddPackage) setTimeout(onOpenAddPackage, 100);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm border border-white/20 transition-all"
            >
              <span className="material-symbols-outlined text-lg">package_2</span>
              <span>+ Add Package</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('products')}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Products</span>
            <span className="text-[10px] text-slate-500">Manage Catalog</span>
          </button>

          <button
            onClick={() => onNavigate('packages')}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">solar_power</span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Packages</span>
            <span className="text-[10px] text-slate-500">Solar Bundles</span>
          </button>

          <button
            onClick={() => onNavigate('invoices')}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Invoices</span>
            <span className="text-[10px] text-slate-500">Create & Send</span>
          </button>

          <button
            onClick={() => onNavigate('requests')}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">request_quote</span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Quotes</span>
            <span className="text-[10px] text-slate-500">Customer Surveys</span>
          </button>

          <button
            onClick={() => onNavigate('orders')}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-xl mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Orders</span>
            <span className="text-[10px] text-slate-500">Track Fulfillment</span>
          </button>

          <button
            onClick={() => onNavigate('gallery')}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">photo_library</span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Gallery</span>
            <span className="text-[10px] text-slate-500">Media Assets</span>
          </button>
        </div>
      </section>

      {/* Operational Key Metrics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-xl">inventory_2</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Catalog Products</span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{inventory.length}</p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>{inventory.length - lowStockItems.length} Available</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-xl">package_2</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Solar Packages</span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{packages.length}</p>
            <p className="text-xs text-slate-500 font-medium">Active Bundles</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined text-xl">pending_actions</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Quote Requests</span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{pendingRequests.length}</p>
            <p className="text-xs text-amber-600 font-semibold">{pendingRequests.filter(r => r.priority === 'High').length} High Priority</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <span className="material-symbols-outlined text-xl">warning</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Low Stock Items</span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{lowStockItems.length}</p>
            <p className="text-xs text-rose-500 font-medium">Requires Restock</p>
          </div>
        </div>
      </section>

      {/* Main Operations Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quote Requests Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">assignment</span>
                  <span>Pending Customer Quotes & Requests</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Incoming site survey, package quote, and consultation requests</p>
              </div>
              <button
                onClick={() => onNavigate('requests')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors flex items-center gap-1"
              >
                <span>View All ({requests.length})</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-3">
              {pendingRequests.length > 0 ? (
                pendingRequests.slice(0, 4).map(req => (
                  <div
                    key={req.id}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {safeText(req.type)}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{safeText(req.title)}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{safeText(req.customer)} • <span className="text-slate-500">{safeText(req.phone)}</span></p>
                      <p className="text-[11px] text-slate-500 italic truncate max-w-md">"{safeText(req.description)}"</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateRequestStatus(req.id, 'In-progress')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Process Quote
                      </button>
                      <button
                        onClick={() => onNavigate('requests')}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="View details"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">task_alt</span>
                  <p className="text-sm font-semibold text-slate-500">All quote requests processed!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Invoice Creation Banner */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-950 rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-purple-800/40">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-xl text-purple-300">
                <span className="material-symbols-outlined text-3xl">receipt_long</span>
              </div>
              <div>
                <h4 className="font-bold text-lg">Need to issue an official invoice?</h4>
                <p className="text-xs text-purple-200 mt-0.5">Generate customized PDF invoices for solar products & installation packages.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="px-5 py-2.5 bg-white text-purple-950 font-bold rounded-xl text-sm hover:bg-purple-50 transition-colors whitespace-nowrap"
            >
              Open Invoice Generator
            </button>
          </div>
        </div>

        {/* Right Column: Inventory Stock Monitor & Gallery Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500">error</span>
                <span>Low Stock Monitor</span>
              </h3>
              <button
                onClick={() => onNavigate('products')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Catalog
              </button>
            </div>

            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.img} alt={item.name} className="w-8 h-8 rounded object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.category}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 text-[10px] font-bold rounded whitespace-nowrap">
                      {item.badge || 'Low Stock'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs font-medium">
                  All products sufficiently stocked.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500">photo_library</span>
                <span>Gallery Showcases</span>
              </h3>
              <button
                onClick={() => onNavigate('gallery')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Manage ({gallery.length})
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Upload and manage project photos of completed installations to showcase on the public website.</p>
            <button
              onClick={() => onNavigate('gallery')}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">cloud_upload</span>
              <span>Upload Installation Photos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardOverview;
