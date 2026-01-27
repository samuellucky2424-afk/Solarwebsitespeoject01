import React from 'react';
import { Link } from 'react-router-dom';

const SidebarLink: React.FC<{ to: string, icon: string, label: string, active?: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${active ? 'bg-primary text-forest font-semibold' : 'hover:bg-primary/10 transition-colors text-[#4c9a66] dark:text-gray-300 font-medium'}`}>
    <span className="material-symbols-outlined">{icon}</span>
    <span>{label}</span>
  </Link>
);

const UserDashboard: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d1b12] dark:text-white transition-colors duration-200 font-display">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-72 bg-white dark:bg-[#1a2e21] border-r border-[#e7f3eb] dark:border-white/10 flex flex-col h-screen sticky top-0">
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
                <button className="w-full bg-primary text-[#0d1b12] py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">Refer a Friend</button>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCgMyvPvI1r63Wv2p6ujv8_KbGcV-p94fgN0glHmuWokq901pP_Q9wynjwqM4R-nJpGN4XiVkvbFUk-eCFjnJytYN5BBTVUws__2aKEcKT1L-T_nRjsaBUcysTx4qt4_8KcZgHNVmbQ_h9oqxdh_wgtF0YfLurvL9YtnfHQQs7cfcdwyF8ZVZQxj3yxY8amxxUSR2t923D3oY5Ii5lRlYdL6dESPd331HVCOzw83ZmUTP7TJRMTU-7UdXA2gjcjyXlUFe2eFwul-hw")' }}></div>
                <div>
                  <p className="text-sm font-bold dark:text-white">Alex Johnson</p>
                  <p className="text-xs text-[#4c9a66]">Standard Plan</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-20 bg-white dark:bg-[#1a2e21] border-b border-[#e7f3eb] dark:border-white/10 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c9a66]">search</span>
                <input className="w-full bg-background-light dark:bg-background-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary transition-all" placeholder="Search orders, invoices, or help..." type="text" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg bg-background-light dark:bg-background-dark text-[#0d1b12] dark:text-white relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2e21]"></span>
              </button>
              <button className="p-2 rounded-lg bg-background-light dark:bg-background-dark text-[#0d1b12] dark:text-white">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <section>
              <h1 className="text-4xl font-black tracking-tight mb-2">Welcome back, Alex!</h1>
              <p className="text-[#4c9a66] text-lg">Your system is performing optimally. Here is your energy overview today.</p>
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Current Output", val: "4.2 kW", perc: "5.2%", sub: "Real-time solar collection" },
                { label: "Daily Generation", val: "28.5 kWh", perc: "2.1%", sub: "Total for Jul 24, 2024" },
                { label: "Total CO2 Saved", val: "1.2 Tons", perc: "0.8%", sub: "Equivalent to 45 trees planted" }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-[#1a2e21] p-6 rounded-xl border border-[#cfe7d7] dark:border-white/5 flex flex-col gap-1 shadow-sm">
                  <p className="text-[#4c9a66] text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{stat.val}</span>
                    <span className="text-xs font-bold text-green-500 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-sm">trending_up</span> {stat.perc}
                    </span>
                  </div>
                  <p className="text-xs text-[#4c9a66] mt-2 italic">{stat.sub}</p>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Energy Production History</h3>
                  <select className="bg-background-light dark:bg-background-dark border-none text-xs font-bold rounded-lg py-1 px-3">
                    <option>Last 7 Days</option>
                  </select>
                </div>
                <div className="h-64 flex flex-col">
                   <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 478 150" width="100%" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#production_gradient)"></path>
                      <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#13ec5b" strokeLinecap="round" strokeWidth="3"></path>
                      <defs>
                        <linearGradient id="production_gradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#13ec5b" stopOpacity="0.2"></stop>
                          <stop offset="100%" stopColor="#13ec5b" stopOpacity="0"></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex justify-between mt-4 px-2">
                       {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                         <span key={d} className={`text-xs font-bold ${d==='Wed' ? 'text-primary' : 'text-[#4c9a66]'}`}>{d}</span>
                       ))}
                    </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Service Status</h3>
                <div className="space-y-6">
                  <div className="relative pl-8 border-l-2 border-primary/20">
                    <div className="absolute -left-2.5 top-0 size-5 bg-primary rounded-full border-4 border-white dark:border-[#1a2e21]"></div>
                    <p className="text-sm font-bold">Annual Maintenance</p>
                    <p className="text-xs text-[#4c9a66]">Scheduled: July 30, 2024</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-primary/20 text-[#0d1b12] dark:text-primary text-[10px] font-bold rounded uppercase">In Progress</span>
                  </div>
                   <div className="relative pl-8 border-l-2 border-[#e7f3eb] dark:border-white/10">
                    <div className="absolute -left-2.5 top-0 size-5 bg-[#e7f3eb] dark:bg-white/10 rounded-full"></div>
                    <p className="text-sm font-bold text-gray-400">Battery Expansion</p>
                    <p className="text-xs text-gray-400">Request ID: #GS-9921</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 dark:bg-white/5 text-gray-400 text-[10px] font-bold rounded uppercase">Pending Review</span>
                  </div>
                  <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-[#cfe7d7] dark:border-white/10 rounded-lg text-sm font-bold hover:bg-background-light dark:hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-sm">add_circle</span> Book New Service
                  </button>
                </div>
              </div>
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Order History</h3>
                    <a href="#" className="text-primary text-sm font-bold hover:underline">View All</a>
                  </div>
                  <table className="w-full text-left">
                     <thead className="border-b border-[#e7f3eb] dark:border-white/5">
                        <tr className="text-xs text-[#4c9a66] font-bold uppercase tracking-wider">
                           <th className="pb-3">Product</th><th className="pb-3">Date</th><th className="pb-3">Status</th><th className="pb-3 text-right">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#e7f3eb] dark:divide-white/5">
                        <tr className="text-sm"><td className="py-4 font-medium">Smart Inverter Pro</td><td className="py-4 text-[#4c9a66]">Jun 12, 2024</td><td className="py-4"><span className="text-green-500 font-bold">Shipped</span></td><td className="py-4 text-right font-bold">$1,299.00</td></tr>
                        <tr className="text-sm"><td className="py-4 font-medium">Solar Cleaning Kit</td><td className="py-4 text-[#4c9a66]">May 20, 2024</td><td className="py-4"><span className="text-blue-500 font-bold">Delivered</span></td><td className="py-4 text-right font-bold">$89.50</td></tr>
                        <tr className="text-sm"><td className="py-4 font-medium">Panel Mount Rack (x4)</td><td className="py-4 text-[#4c9a66]">Apr 05, 2024</td><td className="py-4"><span className="text-blue-500 font-bold">Delivered</span></td><td className="py-4 text-right font-bold">$450.00</td></tr>
                     </tbody>
                  </table>
                </div>

                <div className="bg-white dark:bg-[#1a2e21] rounded-xl border border-[#cfe7d7] dark:border-white/5 p-6 shadow-sm">
                   <h3 className="text-lg font-bold mb-6">Recommended for Your Setup</h3>
                   <div className="grid grid-cols-2 gap-4">
                      {[
                        { title: "EcoVault 10kWh Battery", sub: "Backup power for 24 hours.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD45N8JdcJREqjSdTUMp62EwFiMv1iMK5764PhVjEs5_cxnJwMlnWndup6-VQE8EQu7Eg08g8KK6LloJ1Gppr8TaOLeHr-0E8Z1D_Ztlp13B80DeT_xtz95osWwKJShdmen17Fiy0KOG4fW_YUduOQGfVz_ocgsn-cddK8zA8iqS0rOXziIRosbe6mah4VJ0t1rkRFjys8e7A_brOhln_4moDaWnsJrr-MvwauRGkjXBbZZ_pxZWJSqkvKxk5Xe73H-UmVVq4Twe-M", badge: "SALE -20%" },
                        { title: "Additional Panel XL", sub: "Boost generation by 15%.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-pH4cTSTGj2MMn0_CDbMnLqRdxh37YxSy88LrkhvPeRyo0NsBTAAo_n5kEdUlUPBu6PJfqkRBsjrxvm7FMOqGgPbs2eYeEPfCvDreuvnal7yKxJisvzNQbDZO3IU7T5kxXDqO3IEE-eHkXxPeUrd3Ik1kLLW8tNqn_TLZcaEf6UUb-j7dxOyZKjCbN5geIpqEFXuWY4IfAXozzhQ93XntDGfd_bw7ylfWo1rmtoOB_a1jsDF6flyFnT5A-Uyv-akGbJ1LVWQqb8Y", badge: null }
                      ].map((rec, i) => (
                        <div key={i} className="group cursor-pointer">
                           <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                              {rec.badge && <div className="absolute bottom-2 left-2 bg-primary px-2 py-0.5 rounded text-[10px] font-bold text-[#0d1b12]">{rec.badge}</div>}
                              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${rec.img}')` }}></div>
                           </div>
                           <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{rec.title}</h4>
                           <p className="text-xs text-[#4c9a66]">{rec.sub}</p>
                        </div>
                      ))}
                   </div>
                   <div className="mt-6 p-4 bg-background-light dark:bg-white/5 rounded-lg flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold uppercase tracking-widest text-[#4c9a66]">Premium Upgrade</p>
                         <p className="text-sm font-medium">Smart Home Integration Pack</p>
                      </div>
                      <button className="bg-[#0d1b12] dark:bg-primary text-white dark:text-[#0d1b12] px-4 py-2 rounded text-xs font-bold">Learn More</button>
                   </div>
                </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;