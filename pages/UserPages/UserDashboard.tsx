import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toast } from '../../components/SharedComponents';

// --- Types ---
interface SystemStat {
  id: number;
  label: string;
  value: string;
  perc: string;
  sub: string;
  trend: 'up' | 'down';
}

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

interface Recommendation {
  id: number;
  title: string;
  sub: string;
  img: string;
  badge?: string;
}

interface UserProfile {
  firstName: string;
  fullName: string;
  plan: string;
  systemName: string;
  avatar: string;
}

// --- Initial Data (Simulated Backend Response) ---
const INITIAL_STATS: SystemStat[] = [
  { id: 1, label: "Current Output", value: "4.2 kW", perc: "5.2%", sub: "Real-time solar collection", trend: 'up' },
  { id: 2, label: "Daily Generation", value: "28.5 kWh", perc: "2.1%", sub: "Total for Today", trend: 'up' },
  { id: 3, label: "Total CO2 Saved", value: "1.2 Tons", perc: "0.8%", sub: "Equivalent to 45 trees planted", trend: 'up' }
];

const INITIAL_SERVICES: ServiceRequest[] = [
  { id: "#GS-9921", title: "Annual Maintenance", date: "July 30, 2024", status: "In Progress", type: "Maintenance" },
  { id: "#GS-9922", title: "Battery Expansion", date: "Aug 15, 2024", status: "Pending Review", type: "Upgrade" }
];

const INITIAL_ORDERS: Order[] = [
  { id: "ORD-001", product: "Smart Inverter Pro", date: "Jun 12, 2024", status: "Shipped", amount: 1299.00 },
  { id: "ORD-002", product: "Solar Cleaning Kit", date: "May 20, 2024", status: "Delivered", amount: 89.50 },
  { id: "ORD-003", product: "Panel Mount Rack (x4)", date: "Apr 05, 2024", status: "Delivered", amount: 450.00 }
];

const RECOMMENDATIONS: Recommendation[] = [
  { id: 1, title: "EcoVault 10kWh Battery", sub: "Backup power for 24 hours.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD45N8JdcJREqjSdTUMp62EwFiMv1iMK5764PhVjEs5_cxnJwMlnWndup6-VQE8EQu7Eg08g8KK6LloJ1Gppr8TaOLeHr-0E8Z1D_Ztlp13B80DeT_xtz95osWwKJShdmen17Fiy0KOG4fW_YUduOQGfVz_ocgsn-cddK8zA8iqS0rOXziIRosbe6mah4VJ0t1rkRFjys8e7A_brOhln_4moDaWnsJrr-MvwauRGkjXBbZZ_pxZWJSqkvKxk5Xe73H-UmVVq4Twe-M", badge: "SALE -20%" },
  { id: 2, title: "Additional Panel XL", sub: "Boost generation by 15%.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-pH4cTSTGj2MMn0_CDbMnLqRdxh37YxSy88LrkhvPeRyo0NsBTAAo_n5kEdUlUPBu6PJfqkRBsjrxvm7FMOqGgPbs2eYeEPfCvDreuvnal7yKxJisvzNQbDZO3IU7T5kxXDqO3IEE-eHkXxPeUrd3Ik1kLLW8tNqn_TLZcaEf6UUb-j7dxOyZKjCbN5geIpqEFXuWY4IfAXozzhQ93XntDGfd_bw7ylfWo1rmtoOB_a1jsDF6flyFnT5A-Uyv-akGbJ1LVWQqb8Y" }
];

const SidebarLink: React.FC<{ to: string, icon: string, label: string, active?: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${active ? 'bg-primary text-forest font-semibold' : 'hover:bg-primary/10 transition-colors text-[#4c9a66] dark:text-gray-300 font-medium'}`}>
    <span className="material-symbols-outlined">{icon}</span>
    <span>{label}</span>
  </Link>
);

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  // --- State ---
  // User Profile State (Replaces hardcoded JSX)
  const [user] = useState<UserProfile>({
    firstName: "Alex",
    fullName: "Alex Johnson",
    plan: "Standard Plan",
    systemName: "5kW Residential System",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgMyvPvI1r63Wv2p6ujv8_KbGcV-p94fgN0glHmuWokq901pP_Q9wynjwqM4R-nJpGN4XiVkvbFUk-eCFjnJytYN5BBTVUws__2aKEcKT1L-T_nRjsaBUcysTx4qt4_8KcZgHNVmbQ_h9oqxdh_wgtF0YfLurvL9YtnfHQQs7cfcdwyF8ZVZQxj3yxY8amxxUSR2t923D3oY5Ii5lRlYdL6dESPd331HVCOzw83ZmUTP7TJRMTU-7UdXA2gjcjyXlUFe2eFwul-hw"
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<ServiceRequest[]>(INITIAL_SERVICES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [stats] = useState<SystemStat[]>(INITIAL_STATS);
  const [notifications, setNotifications] = useState(3);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Theme State
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // --- Actions ---
  const handleReferral = () => {
    setNotifications(prev => prev + 1);
    setToastMessage("Referral link copied! Reward pending.");
  };

  const handleBookService = () => {
    // Navigate to the booking/consultation page
    navigate('/consultation');
  };

  const handleScheduleNew = () => {
    // Navigate to the schedule/consultation page
    navigate('/consultation');
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
      case 'Pending Review': return 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400';
      case 'Scheduled': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d1b12] dark:text-white transition-colors duration-200 font-display">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      
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
              <div className="bg-primary/10 rounded-xl p-4 mb-4">
                <p className="text-xs text-[#0d1b12] dark:text-white font-bold mb-2 uppercase tracking-wider">Referral Program</p>
                <p className="text-xs text-[#4c9a66] dark:text-gray-400 mb-3">Earn $100 for every friend who goes solar.</p>
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
                  placeholder="Search orders, services, or products..." 
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
                <p className="text-[#4c9a66] text-lg">Your system is performing optimally. Here is your energy overview today.</p>
              </div>
              <button 
                onClick={handleBookService}
                className="bg-primary text-forest font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add_circle</span> Book Service
              </button>
            </section>
            
            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.id} className="bg-white dark:bg-[#1a2e21] p-6 rounded-xl border border-[#cfe7d7] dark:border-white/5 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[#4c9a66] text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                    <span className={`text-xs font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'} flex items-center gap-0.5`}>
                      <span className="material-symbols-outlined text-sm">{stat.trend === 'up' ? 'trending_up' : 'trending_down'}</span> {stat.perc}
                    </span>
                  </div>
                  <p className="text-xs text-[#4c9a66] mt-2 italic">{stat.sub}</p>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Service Status Column */}
              <div className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Service Status</h3>
                  <span className="text-xs font-bold text-[#4c9a66] bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                    {filteredServices.length} Active
                  </span>
                </div>
                
                <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px]">
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <div key={service.id} className="relative pl-8 border-l-2 border-[#e7f3eb] dark:border-white/10 group">
                        <div className={`absolute -left-[9px] top-0 size-4 rounded-full border-2 border-white dark:border-[#1a2e21] ${service.status === 'In Progress' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-bold group-hover:text-primary transition-colors">{service.title}</p>
                          <p className="text-xs text-[#4c9a66]">ID: {service.id} • {service.date}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase w-fit ${getServiceStatusStyles(service.status)}`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">No services found matching "{searchTerm}"</div>
                  )}
                </div>
                
                <button 
                  onClick={handleScheduleNew}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-[#cfe7d7] dark:border-white/10 rounded-lg text-sm font-bold hover:bg-background-light dark:hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">calendar_add_on</span> Schedule New
                </button>
              </div>

              {/* Order History Column */}
              <div className="lg:col-span-2 bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Order History</h3>
                  <Link to="/requests" className="text-primary text-sm font-bold hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="border-b border-[#e7f3eb] dark:border-white/5">
                        <tr className="text-xs text-[#4c9a66] font-bold uppercase tracking-wider">
                           <th className="pb-3">Order ID</th>
                           <th className="pb-3">Product</th>
                           <th className="pb-3">Date</th>
                           <th className="pb-3">Status</th>
                           <th className="pb-3 text-right">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#e7f3eb] dark:divide-white/5">
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map(order => (
                            <tr key={order.id} className="text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="py-4 font-mono text-xs opacity-70">{order.id}</td>
                              <td className="py-4 font-medium">{order.product}</td>
                              <td className="py-4 text-[#4c9a66]">{order.date}</td>
                              <td className="py-4">
                                <span className={getStatusColor(order.status)}>{order.status}</span>
                              </td>
                              <td className="py-4 text-right font-bold">${order.amount.toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-400">No orders found matching "{searchTerm}"</td>
                          </tr>
                        )}
                     </tbody>
                  </table>
                </div>
              </div>
            </section>
            
            {/* Recommendations Section */}
            <section className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-lg font-bold">Recommended for Your Setup</h3>
                    <p className="text-xs text-[#4c9a66]">Personalized based on your {user.systemName}</p>
                 </div>
                 <div className="flex gap-2">
                   <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><span className="material-symbols-outlined">chevron_left</span></button>
                   <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><span className="material-symbols-outlined">chevron_right</span></button>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {RECOMMENDATIONS.map((rec) => (
                    <div key={rec.id} className="group cursor-pointer flex gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                       <div className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0">
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                          {rec.badge && <div className="absolute bottom-1 left-1 bg-primary px-1.5 py-0.5 rounded text-[8px] font-bold text-[#0d1b12]">{rec.badge}</div>}
                          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${rec.img}')` }}></div>
                       </div>
                       <div className="flex flex-col justify-center">
                          <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{rec.title}</h4>
                          <p className="text-xs text-[#4c9a66] mb-2">{rec.sub}</p>
                          <button className="text-xs font-bold text-[#0d1b12] dark:text-white underline decoration-primary hover:text-primary w-fit">View Details</button>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="mt-6 p-4 bg-background-light dark:bg-white/5 rounded-lg flex items-center justify-between border border-[#e7f3eb] dark:border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary/20 rounded-lg text-primary">
                       <span className="material-symbols-outlined">smart_toy</span>
                     </div>
                     <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-[#4c9a66]">Premium Upgrade</p>
                       <p className="text-sm font-medium">Smart Home Integration Pack</p>
                     </div>
                  </div>
                  <button className="bg-[#0d1b12] dark:bg-primary text-white dark:text-[#0d1b12] px-4 py-2 rounded text-xs font-bold hover:opacity-90 transition-opacity">Learn More</button>
               </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;