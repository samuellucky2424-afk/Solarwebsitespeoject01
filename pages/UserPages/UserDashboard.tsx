import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toast } from '../../components/SharedComponents';
import { useAuth } from '../../context/AuthContext';

// --- Types ---
interface ServiceRequest {
  id: string;
  title: string;
  date: string;
  status: 'In Progress' | 'Pending Review' | 'Scheduled' | 'Completed';
  type: string;
}

interface Order {
  id: string;
  product: string;
  date: string;
  status: 'Shipped' | 'Delivered' | 'Processing';
  amount: number;
}

interface UserProfile {
  firstName: string;
  fullName: string;
  plan: string;
  systemName: string;
  installDate: string;
  systemStatus: 'Operational' | 'Maintenance' | 'Offline';
  avatar: string;
  address: string;
}

// --- Initial Data (Simulated Backend Response) ---
const INITIAL_SERVICES: ServiceRequest[] = [
  { id: "#GS-9921", title: "Annual Maintenance", date: "July 30, 2024", status: "In Progress", type: "Maintenance" },
  { id: "#GS-9922", title: "Battery Expansion Consultation", date: "Aug 15, 2024", status: "Pending Review", type: "Upgrade" },
  { id: "#GS-8842", title: "Site Survey Request", date: "Sep 15, 2023", status: "Completed", type: "Survey" }
];

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

  // --- State ---
  const [user] = useState<UserProfile>({
    firstName: "Alex",
    fullName: "Alex Johnson",
    plan: "Gold Maintenance Plan",
    systemName: "5kW Hybrid Residential System",
    installDate: "March 12, 2023",
    systemStatus: "Operational",
    address: "123 Solar Blvd, Sunnyville, CA",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgMyvPvI1r63Wv2p6ujv8_KbGcV-p94fgN0glHmuWokq901pP_Q9wynjwqM4R-nJpGN4XiVkvbFUk-eCFjnJytYN5BBTVUws__2aKEcKT1L-T_nRjsaBUcysTx4qt4_8KcZgHNVmbQ_h9oqxdh_wgtF0YfLurvL9YtnfHQQs7cfcdwyF8ZVZQxj3yxY8amxxUSR2t923D3oY5Ii5lRlYdL6dESPd331HVCOzw83ZmUTP7TJRMTU-7UdXA2gjcjyXlUFe2eFwul-hw"
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [services] = useState<ServiceRequest[]>(INITIAL_SERVICES);
  const [orders] = useState<Order[]>(INITIAL_ORDERS);
  const [notifications, setNotifications] = useState(3);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  
  // Theme State
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // --- Actions ---
  const handleReferral = () => {
    setNotifications(prev => prev + 1);
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

  const filteredServices = useMemo(() => {
    return services.filter(s => 
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  // --- UI Helpers ---
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Shipped': return 'text-green-500 font-bold';
      case 'Delivered': return 'text-blue-500 font-bold';
      case 'Processing': return 'text-amber-500 font-bold';
      default: return 'text-gray-500';
    }
  };

  const getServiceStatusStyles = (status: string) => {
    switch(status) {
      case 'In Progress': return 'bg-primary/20 text-[#0d1b12] dark:text-primary';
      case 'Pending Review': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      case 'Scheduled': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'Completed': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
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
              <button 
                onClick={() => handleServiceOption(1)}
                className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#e7f3eb] dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-1"
              >
                <div className="size-16 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">build_circle</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Maintenance Request</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Report issues with inverters, batteries, or cameras. Schedule repairs.</p>
              </button>

              <button 
                onClick={() => handleServiceOption(2)}
                className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#e7f3eb] dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-1"
              >
                <div className="size-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">support_agent</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Consultation Request</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Speak with an expert about upgrades, savings reports, or general advice.</p>
              </button>

              <button 
                onClick={() => handleServiceOption(3)}
                className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#e7f3eb] dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-1"
              >
                <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">home_work</span>
                </div>
                <h3 className="text-xl font-bold mb-2">House & Load Survey</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Apply for an on-site professional assessment of your property.</p>
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
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-3 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mb-6"
              >
                <span className="material-symbols-outlined text-lg">logout</span> Log Out
              </button>

              <div className="bg-primary/10 rounded-xl p-4 mb-4">
                <p className="text-xs text-[#0d1b12] dark:text-white font-bold mb-2 uppercase tracking-wider">Referral Program</p>
                <p className="text-xs text-[#4c9a66] dark:text-gray-400 mb-3">Earn ₦100,000 for every friend who goes solar.</p>
                <button onClick={handleReferral} className="w-full bg-primary text-[#0d1b12] py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">Refer a Friend</button>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-cover" style={{ backgroundImage: `url('${user.avatar}')` }}></div>
                <div>
                  <p className="text-sm font-bold dark:text-white">{user.fullName}</p>
                  <p className="text-xs text-[#4c9a66]">{user.plan}</p>
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
              <button className="p-2 rounded-lg bg-background-light dark:bg-background-dark text-[#0d1b12] dark:text-white relative hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                {notifications > 0 && (
                  <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2e21]"></span>
                )}
              </button>
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
                <h1 className="text-4xl font-black tracking-tight mb-2">Welcome back, {user.firstName}!</h1>
                <p className="text-[#4c9a66] text-lg">Manage your solar system, orders, and service requests.</p>
              </div>
              <button 
                onClick={handleBookService}
                className="bg-primary text-forest font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add_circle</span> Book Service
              </button>
            </section>
            
            {/* Feature 1: System Information */}
            <section className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="size-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-5xl text-primary">solar_power</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                             <h2 className="text-2xl font-bold">{user.systemName}</h2>
                             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.systemStatus === 'Operational' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'}`}>
                                {user.systemStatus}
                             </span>
                        </div>
                        <p className="text-[#4c9a66] dark:text-gray-400 text-lg mb-4">{user.address}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-background-light dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/5">
                                <p className="text-xs text-[#4c9a66] uppercase font-bold mb-1">Installation Date</p>
                                <p className="font-semibold">{user.installDate}</p>
                            </div>
                            <div className="p-4 bg-background-light dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/5">
                                <p className="text-xs text-[#4c9a66] uppercase font-bold mb-1">Service Plan</p>
                                <p className="font-semibold">{user.plan}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Feature 2: Request List */}
              <section className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-6 shadow-sm flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">support_agent</span> My Requests
                  </h3>
                  <button onClick={handleBookService} className="text-xs font-bold text-primary hover:underline">New Request</button>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px]">
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <div key={service.id} className="p-4 rounded-xl bg-background-light dark:bg-white/5 border border-[#e7f3eb] dark:border-white/5 hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <p className="font-bold text-lg">{service.title}</p>
                              <p className="text-xs text-[#4c9a66] font-mono">{service.id}</p>
                           </div>
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getServiceStatusStyles(service.status)}`}>
                             {service.status}
                           </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#4c9a66]">
                           <span className="material-symbols-outlined text-sm">event</span>
                           <span>{service.date}</span>
                           <span className="mx-1">•</span>
                           <span>{service.type}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">No service requests found.</div>
                  )}
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
                           <th className="pb-3">Date</th>
                           <th className="pb-3">Status</th>
                           <th className="pb-3 text-right pr-2">Total</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#e7f3eb] dark:divide-white/5">
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map(order => (
                            <tr key={order.id} className="text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="py-4 pl-2 font-medium">
                                 <div>{order.product}</div>
                                 <div className="text-xs text-[#4c9a66] opacity-70 font-mono">{order.id}</div>
                              </td>
                              <td className="py-4 text-[#4c9a66] text-xs">{order.date}</td>
                              <td className="py-4">
                                <span className={`text-xs ${getStatusColor(order.status)}`}>{order.status}</span>
                              </td>
                              <td className="py-4 pr-2 text-right font-bold text-[#0d1b12] dark:text-white">₦{order.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-gray-400">No orders found.</td>
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