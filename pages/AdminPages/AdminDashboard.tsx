import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d1b0f] dark:text-white font-display flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#e7f3e8] dark:border-[#2a3d2c] bg-white dark:bg-[#152a17] flex flex-col shrink-0">
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
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f] transition-colors">
            <span className="material-symbols-outlined">request_quote</span>
            <span className="text-sm">Quotation Requests</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c9a52] hover:bg-[#e7f3e8] dark:hover:bg-[#1d351f] transition-colors">
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
              <input className="w-full pl-10 pr-4 py-2 bg-[#e7f3e8] dark:bg-[#1d351f] border-none rounded-lg focus:ring-2 focus:ring-primary text-sm placeholder:text-[#4c9a52]" placeholder="Search orders, products or customers..." type="text" />
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

        <main className="flex-1 overflow-y-auto p-8">
           <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Business Operations Overview</h1>
            <p className="text-[#4c9a52] mt-1">Welcome back. Here is what's happening with Greenlife Solar today.</p>
          </div>

          <section className="mb-10">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">priority_high</span> Action Required
              </h2>
              <button className="text-sm text-primary font-medium hover:underline">View all alerts</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="flex gap-4 p-5 bg-white dark:bg-[#152a17] border border-[#cfe7d1] dark:border-[#2a3d2c] rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="text-lg font-bold">New Quotation Requests</h3>
                    <p className="text-[#4c9a52] text-sm leading-relaxed">5 pending quotes from residential clients in the last 24 hours. Estimated value: $42,500.</p>
                    <div className="mt-4 flex gap-3">
                      <button className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg">Review Quotes</button>
                      <button className="px-4 py-1.5 border border-[#cfe7d1] text-[#4c9a52] text-xs font-bold rounded-lg">Dismiss</button>
                    </div>
                  </div>
               </div>
               <div className="flex gap-4 p-5 bg-white dark:bg-[#152a17] border border-[#cfe7d1] dark:border-[#2a3d2c] rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-red-600">warning</span>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="text-lg font-bold">Urgent Maintenance Alerts</h3>
                    <p className="text-[#4c9a52] text-sm leading-relaxed">3 systems reported inverter failure signals. Immediate dispatch required for maintenance teams.</p>
                    <div className="mt-4 flex gap-3">
                      <button className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg">Dispatch Teams</button>
                      <button className="px-4 py-1.5 border border-[#cfe7d1] text-[#4c9a52] text-xs font-bold rounded-lg">View Details</button>
                    </div>
                  </div>
               </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-bold">Product Inventory</h2>
               <Link to="/admin/inventory" className="text-primary text-sm font-bold">View Full Inventory</Link>
            </div>
            <div className="bg-white dark:bg-[#152a17] border border-[#cfe7d1] dark:border-[#2a3d2c] rounded-xl overflow-hidden shadow-sm">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-[#f8fcf8] dark:bg-[#1d351f] border-b border-[#cfe7d1] dark:border-[#2a3d2c]">
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Product Details</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Stock Level</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Status</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52] text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#e7f3e8] dark:divide-[#2a3d2c]">
                    {[
                      { name: "Mono PERC 450W Panel", sku: "GS-MP450-01", stock: "1,240 Units", status: "In Stock", statusClass: "bg-green-100 text-green-700", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLithCVa-LuJQMOXVxe9KMqehIMobcbcZW0XhhUWrT2ZSgz_dS-G3KgAcoMKim7X5FJokFgPObPQecP4ReIn7t21cU1gGl7uhR9ZqDZZe0UFssRUKrIgzu0qpBRXtQTA9r8FoJOTa1RKwDEersBM6it8xhvTBsSPe1O3p-DkcxuxhqOk8R0spjHm9zc6-X8jKW56n8_xkONaVy6WgarpCofE-hJieoMm9RBW3AFiFzUtPgnvGtGjJ4PFQqACEl4m9QIUQhs0M4YeM" },
                      { name: "Smart Hybrid Inverter 5kW", sku: "GS-INV5K-H", stock: "12 Units", status: "Low Stock", statusClass: "bg-orange-100 text-orange-700", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwHsULDN1b5QX_5o2qzkFNvx_X6Qz1Ix8y7rnyiCdQxV63Q6Lwm8v-4lTYIZ4vWesQBBDuy07ub2TEPZSZ8PZg6epGp2VkmrefWruYDvq_MX1bX79_4WCIKL1HKJudMH4jcbp75A0wepnW9qAY_rWlxzgNS3vbWH8Zbs__wS3_ROU6E26jVy5lZ8qsuDbBA4VZx-ukyeptUw_r0DmOZwt7Wo0X_NluNOzxhkFJsBpGaQUnXxc0bOeGOLNxhgP6lfOsvtl0-3IVNkg" },
                      { name: "Lithium-Ion Wall 10kWh", sku: "GS-LIW10", stock: "0 Units", status: "Out of Stock", statusClass: "bg-red-100 text-red-700", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbL_HuVMOJ4-rnNn0B_tfMmtbGGeVNIIOetL-nWpH81Se08zsE5Yj9aCbC8tRP9r20yl2hRdbC5L3iCS-RzaR-fpGWj0JD-ByqM9RdkSxaSzr5xLIANAoc9m8eIsNwmnS98C-Hh2fNOq_7MMi_zkUdPAStSEox22ICy_9KdMQEkTTcSPoJl-0kregEBXWg4s2ujnck0AKxMTnc6Qu2yRt8jVEigdAUH6PkBWK_ntngZRMKP0PiHIIqY0zLgZ7FzRCjggLLGfevo8M" },
                    ].map((item, i) => (
                      <tr key={i} className="hover:bg-background-light dark:hover:bg-[#1d351f]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-[#e7f3e8] bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${item.img}')` }}></div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{item.name}</span>
                              <span className="text-xs text-[#4c9a52]">SKU: {item.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{item.stock}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.statusClass}`}>{item.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="text-[#4c9a52] hover:text-primary transition-colors">
                              <span className="material-symbols-outlined">edit_square</span>
                           </button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;