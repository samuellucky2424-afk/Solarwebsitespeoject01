import React, { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toast } from '../../components/SharedComponents';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';

// --- Types (Local) ---
interface Order {
  id: string;
  product: string;
  date: string;
  status: 'Shipped' | 'Delivered' | 'Processing';
  amount: number;
}

const INITIAL_ORDERS: Order[] = [
  { id: "ORD-001", product: "Smart Inverter Pro", date: "Jun 12, 2024", status: "Shipped", amount: 1299.00 },
  { id: "ORD-002", product: "Solar Cleaning Kit", date: "May 20, 2024", status: "Delivered", amount: 89.50 },
  { id: "ORD-003", product: "Panel Mount Rack (x4)", date: "Apr 05, 2024", status: "Delivered", amount: 450.00 }
];

const SidebarLink: React.FC<{ to: string, icon: string, label: string, active?: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${active ? 'bg-primary text-forest font-semibold' : 'hover:bg-primary/10 transition-colors text-[#4c9a66] dark:text-gray-300 font-medium'}`}>
    <span className="material-symbols-outlined">{icon}</span>
    <span>{label}</span>
  </Link>
);

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { activeUser, referrals, notifications, markNotificationRead } = useAdmin(); // Use centralized data

  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [orders] = useState<Order[]>(INITIAL_ORDERS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  
  // Theme State
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // --- Close Dropdown on click outside ---
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Calculations ---
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Check Warranty Status
  const warrantyEnd = new Date(activeUser.warrantyEnd);
  const today = new Date();
  const isWarrantyActive = warrantyEnd > today;
  const daysLeft = Math.ceil((warrantyEnd.getTime() - today.getTime()) / (1000 * 3600 * 24));

  // --- Actions ---
  const handleReferralCopy = () => {
    navigator.clipboard.writeText(activeUser.referralCode);
    setToastMessage("Referral link copied! Reward pending.");
  };

  const handleBookService = () => {
    setIsServiceModalOpen(true);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  const handleServiceOption = (option: number) => {
    setIsServiceModalOpen(false);
    if (option === 1) {
      navigate('/service-request?type=maintenance');
    } else if (option === 2) {
      navigate('/consultation');
    } else if (option === 3) {
      navigate('/service-request?type=survey');
    }
  };

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
      setToastMessage("Switched to Light Mode");
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
      setToastMessage("Switched to Dark Mode");
    }
  };

  // --- Filtering ---
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  // --- UI Helpers ---
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Shipped': return 'text-green-500 font-bold';
      case 'Delivered': return 'text-blue-500 font-bold';
      case 'Processing': return 'text-amber-500 font-bold';
      default: return 'text-gray-500';
    }
  };

  const getSystemStatusBadge = (status: string) => {
    switch (status) {
        case 'Operational': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'Maintenance': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        case 'Offline': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'Out of Care': return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d1b12] dark:text-white transition-colors duration-200 font-display">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      
      {/* Service Selection Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsServiceModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#152a17] rounded-3xl p-8 max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-forest dark:text-white mb-2">Select a Service</h2>
              <p className="text-[#4c9a66] dark:text-gray-300">Choose the type of assistance you need today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => handleServiceOption(1)} className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#e7f3eb] dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-1">
                <div className="size-16 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">build_circle</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Maintenance Request</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Report issues with inverters, batteries, or cameras.</p>
              </button>

              <button onClick={() => handleServiceOption(2)} className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#e7f3eb] dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-1">
                <div className="size-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">support_agent</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Consultation Request</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Speak with an expert about upgrades or savings reports.</p>
              </button>

              <button onClick={() => handleServiceOption(3)} className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#e7f3eb] dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-1">
                <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">home_work</span>
                </div>
                <h3 className="text-xl font-bold mb-2">House & Load Survey</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Apply for an on-site professional assessment.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-72 bg-white dark:bg-[#1a2e21] border-r border-[#e7f3eb] dark:border-white/10 flex flex-col h-screen sticky top-0 hidden lg:flex">
          <div className="p-6 flex flex-col h-full">
            <Link to="/" className="flex items-center gap-3 mb-10">
              <div className="bg-primary/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-[#0d1b12] dark:text-primary">wb_sunny</span>
              </div>
              <div>
                <h1 className="text-[#0d1b12] dark:text-white text-lg font-bold leading-tight">Greenlife Solar</h1>
                <p className="text-[#4c9a66] text-xs font-medium">Customer Portal</p>
              </div>
            </Link>
            <nav className="flex flex-col gap-2 grow">
              <SidebarLink to="/dashboard" icon="dashboard" label="Dashboard" active />
              <SidebarLink to="/requests" icon="solar_power" label="My Systems" />
              <SidebarLink to="/requests" icon="shopping_cart" label="Orders" />
              <SidebarLink to="/requests" icon="support_agent" label="Support" />
              <SidebarLink to="/dashboard" icon="person" label="Profile" />
            </nav>
            <div className="mt-auto pt-6 border-t border-[#e7f3eb] dark:border-white/10">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-3 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mb-6">
                <span className="material-symbols-outlined text-lg">logout</span> Log Out
              </button>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-cover" style={{ backgroundImage: `url('${activeUser.avatar}')` }}></div>
                <div>
                  <p className="text-sm font-bold dark:text-white">{activeUser.fullName}</p>
                  <p className="text-xs text-[#4c9a66]">{activeUser.plan}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-20 bg-white dark:bg-[#1a2e21] border-b border-[#e7f3eb] dark:border-white/10 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c9a66]">search</span>
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background-light dark:bg-background-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary transition-all text-forest dark:text-white placeholder:text-gray-400" 
                  placeholder="Search..." 
                  type="text" 
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 rounded-lg bg-background-light dark:bg-background-dark text-[#0d1b12] dark:text-white relative hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2e21]"></span>
                  )}
                </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a2e21] rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 animate-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      {unreadCount > 0 && <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-4 border-b border-gray-100 dark:border-white/5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className={`text-sm font-bold ${!n.read ? 'text-forest dark:text-white' : 'text-gray-500'}`}>{n.title}</p>
                              <span className="text-[10px] text-gray-400">{n.date}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-400 text-xs">No notifications yet.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-background-light dark:bg-background-dark text-[#0d1b12] dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Welcome back, {activeUser.firstName}!</h1>
                <p className="text-[#4c9a66] text-lg">Manage your solar system, orders, and service requests.</p>
              </div>
              <button 
                onClick={handleBookService}
                className="bg-primary text-forest font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add_circle</span> Book Service
              </button>
            </section>
            
            {/* Feature 1: System Information with Warranty & Status */}
            <section className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-8 shadow-sm relative overflow-hidden">
                {/* Status Indicator */}
                <div className="absolute top-0 right-0 p-8">
                   <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${getSystemStatusBadge(activeUser.systemStatus)}`}>
                      <span className={`size-2 rounded-full ${activeUser.systemStatus === 'Operational' ? 'bg-green-500 animate-pulse' : 'bg-current'}`}></span>
                      {activeUser.systemStatus}
                   </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="size-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-5xl text-primary">solar_power</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                             <h2 className="text-2xl font-bold">{activeUser.systemName}</h2>
                        </div>
                        <p className="text-[#4c9a66] dark:text-gray-400 text-lg mb-6">{activeUser.address}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-background-light dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/5">
                                <p className="text-xs text-[#4c9a66] uppercase font-bold mb-1">Installation Date</p>
                                <p className="font-semibold">{activeUser.installDate}</p>
                                {activeUser.installTime && <p className="text-xs text-gray-500">{activeUser.installTime}</p>}
                            </div>
                            <div className={`p-4 rounded-lg border ${isWarrantyActive ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'}`}>
                                <div className="flex justify-between items-center mb-1">
                                   <p className={`text-xs uppercase font-bold ${isWarrantyActive ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>
                                      {isWarrantyActive ? 'In Warranty' : 'Expired'}
                                   </p>
                                   {isWarrantyActive && <span className="text-[10px] font-bold text-green-600">{daysLeft} Days left</span>}
                                </div>
                                <p className="font-semibold text-sm">Ends: {activeUser.warrantyEnd}</p>
                            </div>
                            <div className="p-4 bg-background-light dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/5">
                                <p className="text-xs text-[#4c9a66] uppercase font-bold mb-1">Service Plan</p>
                                <p className="font-semibold">{activeUser.plan}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Feature 2: Referrals & Rewards (NEW) */}
              <section className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-6 shadow-sm flex flex-col h-full">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary">loyalty</span> Referrals
                    </h3>
                    <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">Earn ₦5,000+</span>
                 </div>
                 
                 <div className="bg-gradient-to-r from-forest to-[#1a331c] p-6 rounded-xl text-white mb-6 relative overflow-hidden">
                    <div className="relative z-10">
                       <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Your Unique Code</p>
                       <div className="flex items-center gap-4">
                          <span className="text-3xl font-black tracking-widest">{activeUser.referralCode}</span>
                          <button onClick={handleReferralCopy} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                             <span className="material-symbols-outlined text-white">content_copy</span>
                          </button>
                       </div>
                       <p className="text-xs text-gray-400 mt-2">Share this code. When a friend spends over ₦100,000, you get rewarded.</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                       <span className="material-symbols-outlined text-9xl">savings</span>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto">
                    <h4 className="text-sm font-bold text-[#4c9a66] mb-3 uppercase tracking-wider">Referral History</h4>
                    <div className="space-y-3">
                       {referrals.filter(r => r.referrerId === activeUser.id).length > 0 ? (
                          referrals.filter(r => r.referrerId === activeUser.id).map(ref => (
                             <div key={ref.id} className="flex items-center justify-between p-3 bg-background-light dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/5">
                                <div>
                                   <p className="font-bold text-sm">{ref.refereeName}</p>
                                   <p className="text-xs text-gray-500">{ref.date}</p>
                                </div>
                                <div className="text-right">
                                   <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                                      ref.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                      ref.status === 'Qualified' ? 'bg-blue-100 text-blue-700' : 
                                      'bg-gray-100 text-gray-600'
                                   }`}>
                                      {ref.status}
                                   </span>
                                   {ref.status === 'Approved' && ref.reward && (
                                      <p className="text-xs font-mono text-primary mt-1">{ref.reward.code}</p>
                                   )}
                                </div>
                             </div>
                          ))
                       ) : (
                          <p className="text-sm text-gray-400 italic">No referrals yet. Start sharing!</p>
                       )}
                    </div>
                 </div>
              </section>

              {/* Feature 3: Order History */}
              <section className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-6 shadow-sm flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">shopping_bag</span> Order History
                  </h3>
                  <Link to="/products" className="text-xs font-bold text-primary hover:underline">Shop Now</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="border-b border-[#e7f3eb] dark:border-white/5">
                        <tr className="text-xs text-[#4c9a66] font-bold uppercase tracking-wider">
                           <th className="pb-3 pl-2">Product</th>
                           <th className="pb-3">Status</th>
                           <th className="pb-3 text-right pr-2">Total</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#e7f3eb] dark:divide-white/5">
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map(order => (
                            <tr key={order.id} className="text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="py-4 pl-2 font-medium">
                                 <div className="truncate max-w-[120px]">{order.product}</div>
                                 <div className="text-xs text-[#4c9a66] opacity-70 font-mono">{order.date}</div>
                              </td>
                              <td className="py-4">
                                <span className={`text-xs ${getStatusColor(order.status)}`}>{order.status}</span>
                              </td>
                              <td className="py-4 pr-2 text-right font-bold text-[#0d1b12] dark:text-white">₦{order.amount.toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-gray-400">No orders found.</td>
                          </tr>
                        )}
                     </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;