import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin, Referral } from '../../context/AdminContext';
import { Toast } from '../../components/SharedComponents';

const AdminDashboard: React.FC = () => {
  const { requests, updateRequestStatus, deleteRequest, stats, activeUser, updateUserSystem, referrals, approveReferral } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  
  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<string>('');
  const [rewardDays, setRewardDays] = useState<string>('30');
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  // Derived Data
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

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUserSystem({ systemStatus: e.target.value as any });
    setToastMsg("System status updated.");
  };

  const handleWarrantyChange = (field: 'warrantyStart' | 'warrantyEnd', value: string) => {
    updateUserSystem({ [field]: value });
    setToastMsg("Warranty date updated.");
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
    setToastMsg("Reward code generated and sent to user.");
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
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Overview</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f]'}`}>
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm">User Management</span>
          </button>
          <Link to="/admin/inventory" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f] transition-colors">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-sm">Products</span>
          </Link>
          <Link to="/admin/packages" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f] transition-colors">
            <span className="material-symbols-outlined">package_2</span>
            <span className="text-sm">Solar Packages</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between border-b border-[#e7f3e8] dark:border-[#2a3d2c] bg-white dark:bg-[#152a17] px-8 shrink-0">
          <h2 className="text-xl font-bold">{activeTab === 'overview' ? 'Operational Overview' : 'Customer Management'}</h2>
          <div className="flex items-center gap-4">
             <div className="flex flex-col text-right">
                <span className="text-sm font-bold leading-none">Alex Rivera</span>
                <span className="text-xs text-[#4c9a52]">Admin</span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
           
           {/* OVERVIEW TAB */}
           {activeTab === 'overview' && (
             <>
                <section className="mb-10">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-500">priority_high</span> Action Required
                    </h2>
                    <span className="text-sm text-primary font-medium">{filteredRequests.length} Pending Requests</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                     {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                       <div key={req.id} className="flex gap-4 p-5 bg-white dark:bg-[#152a17] border border-[#cfe7d1] dark:border-[#2a3d2c] rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                          <div className={`absolute top-0 left-0 w-1 h-full ${req.priority === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                          <div className="flex flex-col gap-1 flex-1 min-w-0 pl-2">
                            <div className="flex justify-between items-start">
                               <h3 className="text-lg font-bold truncate">{req.title}</h3>
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${req.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>{req.type}</span>
                            </div>
                            <p className="text-sm font-bold text-forest dark:text-white">{req.customer}</p>
                            <p className="text-[#4c9a52] text-xs leading-relaxed line-clamp-2">{req.description || `Request at ${req.address}`}</p>
                            <div className="mt-4 flex gap-3">
                              <button onClick={() => handleApprove(req.id)} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">Approve</button>
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
                    <h2 className="text-xl font-bold">Quick Stats</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c]">
                          <p className="text-2xl font-bold">{stats.lowStockCount}</p>
                          <p className="text-xs text-[#4c9a52] uppercase">Low Stock</p>
                       </div>
                       <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c]">
                          <p className="text-2xl font-bold">{stats.pendingInstalls}</p>
                          <p className="text-xs text-[#4c9a52] uppercase">Pending Installs</p>
                       </div>
                       <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c]">
                          <p className="text-2xl font-bold">{stats.activeCustomers}</p>
                          <p className="text-xs text-[#4c9a52] uppercase">Customers</p>
                       </div>
                  </div>
                </section>
             </>
           )}

           {/* USERS TAB */}
           {activeTab === 'users' && (
             <div className="space-y-6">
                <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] overflow-hidden">
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
                            <button onClick={() => setIsUserModalOpen(true)} className="px-4 py-2 bg-primary text-forest text-sm font-bold rounded-lg hover:brightness-105">
                               Manage User
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </main>
      </div>

      {/* User Management Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
           <div className="relative bg-white dark:bg-[#152a17] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                 <h2 className="text-xl font-bold">Manage: {activeUser.fullName}</h2>
                 <button onClick={() => setIsUserModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
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

export default AdminDashboard;