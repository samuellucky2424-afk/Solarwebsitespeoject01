import React from 'react';
import { Link } from 'react-router-dom';

const ProductInventory: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
       {/* Sidebar */}
       <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-background-dark border-r border-slate-200 dark:border-slate-800 flex flex-col z-50">
          <div className="p-6 flex items-center gap-3">
             <Link to="/" className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                <span className="material-symbols-outlined font-bold">solar_power</span>
             </Link>
             <div className="flex flex-col">
                <h1 className="text-sm font-bold leading-tight uppercase tracking-wider">Greenlife Solar</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Solutions LTD</p>
             </div>
          </div>
          <nav className="flex-1 px-4 mt-4 space-y-1">
             <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">dashboard</span>
                <span className="text-sm font-medium">Dashboard</span>
             </Link>
             <Link to="/admin/inventory" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-background-dark font-bold shadow-sm">
                <span className="material-symbols-outlined">inventory_2</span>
                <span className="text-sm">Product Management</span>
             </Link>
             <Link to="/admin/gallery" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">photo_library</span>
                <span className="text-sm font-medium">Gallery</span>
             </Link>
             <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">group</span>
                <span className="text-sm font-medium">Users</span>
             </a>
          </nav>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 m-4 rounded-xl border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden">
                   <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZpM-BB1eD6FvPJXVd0GMIW3W5pcPeBhP72Af_kklEGB3_T5_K12gfZjHWznP0xgn1OFevnqrgz_cdU4ssat6lX8gme2qFV3oZk3q8VJ75usikd-haqjztI5u8_W8mtLFNrhxIY-V3kpmC2n6bApO27cLc1ZS0Gk046FMtwWrP-vaV_j_VFJ2T-4qg8ltjusKgWnj-xmTNjT0M-M3ff9Mv1HLiEq5NQDDPfgLswl-krcbD_41VVMdFV2R8S6SbTfvM-5Zkhx9N_4o" alt="Admin" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold truncate">Alex Sterling</p>
                   <p className="text-[10px] text-slate-500 truncate">System Admin</p>
                </div>
             </div>
             <Link to="/admin" className="w-full block text-center py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">Sign Out</Link>
          </div>
       </aside>

       <main className="ml-64 flex-1 min-h-screen">
          <header className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <span>Admin</span>
                      <span className="material-symbols-outlined text-xs">chevron_right</span>
                      <span className="text-primary font-bold">Product Management</span>
                   </div>
                   <h2 className="text-xl font-bold mt-1">Product Inventory</h2>
                </div>
                <div className="flex items-center gap-4">
                   <div className="relative w-64">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                      <input className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="Search products..." type="text" />
                   </div>
                </div>
             </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto space-y-8">
             {/* Stats */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                   { label: "Total Sales", val: "$124,500.00", badge: "+12.5%", icon: "payments", color: "text-primary", bg: "bg-primary/10" },
                   { label: "Pending Installations", val: "18", badge: null, icon: "engineering", color: "text-blue-500", bg: "bg-blue-500/10" },
                   { label: "Inventory Alerts", val: "4 Low Stock", badge: null, icon: "warning", color: "text-amber-500", bg: "bg-amber-500/10" },
                   { label: "Active Customers", val: "842", badge: "+5.2%", icon: "group", color: "text-emerald-500", bg: "bg-emerald-500/10" }
                ].map((stat, i) => (
                   <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                         <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                            <span className="material-symbols-outlined">{stat.icon}</span>
                         </div>
                         {stat.badge && <span className={`text-[10px] font-bold ${stat.color} px-2 py-0.5 ${stat.bg} rounded-full`}>{stat.badge}</span>}
                      </div>
                      <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-bold">{stat.val}</h3>
                   </div>
                ))}
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                   <div className="flex-1">
                      <h3 className="text-lg font-bold">Solar Products</h3>
                      <p className="text-xs text-slate-500">Manage your product catalog and availability</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                         <span className="material-symbols-outlined text-lg">filter_list</span> Filter
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark font-bold rounded-lg hover:shadow-lg hover:brightness-105 transition-all">
                         <span className="material-symbols-outlined text-lg">add</span> Add Product
                      </button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50">
                         <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product Info</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Stock Level</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Unit Price</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {[
                           { name: "Monocrystalline Panel 400W", sku: "GS-400-MONO", cat: "Solar Panels", stock: "124 Units", price: "$249.00", status: "In Stock", color: "bg-primary/20 text-primary", dot: "bg-primary", icon: "solar_power" },
                           { name: "Lithium-ion Battery 5kWh", sku: "GS-BATT-5K", cat: "Energy Storage", stock: "5 Units", price: "$1,850.00", status: "Low Stock", color: "bg-amber-500/20 text-amber-600 dark:text-amber-400", dot: "bg-amber-500", icon: "battery_charging_full" },
                           { name: "Hybrid Inverter 10kW", sku: "GS-INV-10H", cat: "Power Control", stock: "42 Units", price: "$920.00", status: "In Stock", color: "bg-primary/20 text-primary", dot: "bg-primary", icon: "electric_bolt" }
                         ].map((item, i) => (
                           <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                       <span className="material-symbols-outlined text-slate-400">{item.icon}</span>
                                    </div>
                                    <div>
                                       <p className="text-sm font-bold">{item.name}</p>
                                       <p className="text-[10px] text-slate-400">SKU: {item.sku}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded">{item.cat}</span></td>
                              <td className="px-6 py-4"><p className="text-sm font-medium">{item.stock}</p></td>
                              <td className="px-6 py-4"><p className="text-sm font-bold">{item.price}</p></td>
                              <td className="px-6 py-4">
                                 <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${item.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`}></span> {item.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button className="p-1.5 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                    <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
       </main>
    </div>
  );
};

export default ProductInventory;