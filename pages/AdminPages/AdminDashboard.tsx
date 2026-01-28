import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Toast } from '../../components/SharedComponents';

const AdminDashboard: React.FC = () => {
  const { requests, updateRequestStatus, deleteRequest, stats } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Derived Data for Filters
  const filteredRequests = useMemo(() => {
    return requests.filter(req => 
      req.status === 'Pending' && 
      (req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       req.customer.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [requests, searchTerm]);

  // Handlers
  const handleApprove = (id: string) => {
    updateRequestStatus(id, 'Scheduled');
    setToastMsg(`Request ${id} approved and scheduled.`);
  };

  const handleDispatch = (id: string) => {
    updateRequestStatus(id, 'In Progress');
    setToastMsg(`Team dispatched for Request ${id}.`);
  };

  const handleDismiss = (id: string) => {
    if (window.confirm('Dismiss this request permanently?')) {
      deleteRequest(id);
      setToastMsg(`Request ${id} dismissed.`);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d1b0f] dark:text-white font-display flex h-screen overflow-hidden">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#e7f3e8] dark:border-[#2a3d2c] bg-white dark:bg-[#152a17] flex flex-col shrink-0 hidden md:flex">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <span className="material-symbols-outlined text-primary">solar_power</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[#0d1b0f] dark:text-white text-base font-bold leading-none">Greenlife Solar</h1>
              <p className="text-[#4c9a52] text-xs font-medium mt-1 uppercase tracking-wider">Admin Panel</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white font-medium">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Overview</span>
          </Link>
          <Link to="/admin/inventory" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f] transition-colors">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-sm">Products</span>
          </Link>
          <Link to="/admin/gallery" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f] transition-colors">
            <span className="material-symbols-outlined">photo_library</span>
            <span className="text-sm">Gallery</span>
          </Link>
          {/* Functional Scroll Links */}
          <a href="#action-required" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f] transition-colors">
            <span className="material-symbols-outlined">request_quote</span>
            <span className="text-sm">Quotation Requests</span>
          </a>
          <a href="#action-required" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f] transition-colors">
            <span className="material-symbols-outlined">engineering</span>
            <span className="text-sm">Maintenance</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between border-b border-[#e7f3e8] dark:border-[#2a3d2c] bg-white dark:bg-[#152a17] px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c9a52]">search</span>
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#e7f3e8] dark:bg-[#1d351f] border-none rounded-lg focus:ring-2 focus:ring-primary text-sm placeholder:text-[#4c9a52]" 
                placeholder="Search pending requests..." 
                type="text" 
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 cursor-pointer">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold leading-none">Alex Rivera</span>
                <span className="text-xs text-[#4c9a52]">Operations Mgr</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-primary" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA83MNSq95iwj6_QEPs5fCiDYMHrDK7gJrurp7JrY9o5RD6d7xxxxDEIGzJjqxrz_wxHdrgxCY8kh9vTmVKG-iONBWW_b0rJmv8GDbyYdkKXX_ukYAa0aoZRVcvnppVgbdnteQ8LS2D5ZeHIuIcMUw8RUOM7aKtMl4UgDqF45p1ES3arKrfMs3n_6Fvht7gmquhqE7mPX379ts40lCN_54GhXIK7h-Ol_5Ani_gTlOtm9hr72rKq4RJLMLQ7KAsB71YMi6TCorr8Ug')" }}></div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
           <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Business Operations Overview</h1>
            <p className="text-[#4c9a52] mt-1">Welcome back. Here is what's happening with Greenlife Solar today.</p>
          </div>

          <section id="action-required" className="mb-10">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">priority_high</span> Action Required
              </h2>
              <span className="text-sm text-primary font-medium">{filteredRequests.length} Pending Requests</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
               {/* Dynamic Requests List */}
               {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                 <div key={req.id} className="flex gap-4 p-5 bg-white dark:bg-[#152a17] border border-[#cfe7d1] dark:border-[#2a3d2c] rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1 h-full ${req.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${req.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                      <span className={`material-symbols-outlined ${req.priority === 'High' ? 'text-red-600' : 'text-blue-600'}`}>
                        {req.type === 'Maintenance' ? 'build' : req.type === 'Installation' ? 'solar_power' : 'assignment'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                         <h3 className="text-lg font-bold truncate">{req.title}</h3>
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${req.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>{req.type}</span>
                      </div>
                      <p className="text-sm font-bold text-forest dark:text-white">{req.customer}</p>
                      <p className="text-[#4c9a52] text-xs leading-relaxed line-clamp-2">{req.description || `Request at ${req.address}`}</p>
                      <p className="text-xs text-gray-500 mt-1">Requested: {req.date}</p>
                      <div className="mt-4 flex gap-3">
                        {req.priority === 'High' ? (
                           <button onClick={() => handleDispatch(req.id)} className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">Dispatch Team</button>
                        ) : (
                           <button onClick={() => handleApprove(req.id)} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">Approve</button>
                        )}
                        <button onClick={() => handleDismiss(req.id)} className="px-4 py-1.5 border border-[#cfe7d1] text-[#4c9a52] text-xs font-bold rounded-lg hover:bg-background-light dark:hover:bg-[#1d351f] transition-colors">Dismiss</button>
                      </div>
                    </div>
                 </div>
               )) : (
                 <div className="col-span-2 py-12 text-center border border-dashed border-[#cfe7d1] rounded-xl">
                    <p className="text-gray-500">No pending actions required.</p>
                 </div>
               )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-bold">Quick Inventory Stats</h2>
               <Link to="/admin/inventory" className="text-primary text-sm font-bold hover:underline">Manage Inventory</Link>
            </div>
            <div className="bg-white dark:bg-[#152a17] border border-[#cfe7d1] dark:border-[#2a3d2c] rounded-xl overflow-hidden shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                       <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                       <p className="text-2xl font-bold">{stats.lowStockCount}</p>
                       <p className="text-xs text-[#4c9a52] font-bold uppercase">Items Low Stock</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                       <span className="material-symbols-outlined">pending_actions</span>
                    </div>
                    <div>
                       <p className="text-2xl font-bold">{stats.pendingInstalls}</p>
                       <p className="text-xs text-[#4c9a52] font-bold uppercase">Pending Installs</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                       <span className="material-symbols-outlined">group</span>
                    </div>
                    <div>
                       <p className="text-2xl font-bold">{stats.activeCustomers}</p>
                       <p className="text-xs text-[#4c9a52] font-bold uppercase">Total Customers</p>
                    </div>
                 </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;