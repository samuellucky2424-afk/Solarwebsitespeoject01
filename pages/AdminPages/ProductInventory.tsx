import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Product } from '../../data/products';
import { Toast } from '../../components/SharedComponents';

const ProductInventory: React.FC = () => {
   const { inventory, addProduct, updateProduct, deleteProduct, stats } = useAdmin();

   // UI State
   const [searchTerm, setSearchTerm] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
   const [toastMsg, setToastMsg] = useState<string | null>(null);
   const [filterCategory, setFilterCategory] = useState<string>('All');

   // Form State
   const [formData, setFormData] = useState<Partial<Product>>({
      name: '',
      series: '',
      price: 0,
      category: 'Solar Panels',
      brand: '',
      spec: '',
      eff: '',
      img: '',
      badge: 'In Stock' // Hijacking 'badge' for Stock status in this simplified Admin view
   });

   // Derived Data
   const filteredInventory = useMemo(() => {
      return inventory.filter(item => {
         const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.series.toLowerCase().includes(searchTerm.toLowerCase());
         const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
         return matchesSearch && matchesCategory;
      });
   }, [inventory, searchTerm, filterCategory]);

   // Handlers
   const handleOpenModal = (product?: Product) => {
      if (product) {
         setEditingProduct(product);
         setFormData(product);
      } else {
         setEditingProduct(null);
         setFormData({
            name: '', series: '', price: 0, category: 'Solar Panels', brand: '', spec: '', eff: '', img: '', badge: 'In Stock'
         });
      }
      setIsModalOpen(true);
   };

   const handleDelete = (id: any) => {
      if (window.confirm("Are you sure you want to delete this product?")) {
         deleteProduct(id);
         setToastMsg("Product deleted successfully");
      }
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // Basic Validation
      if (!formData.name || !formData.price) return;

      if (editingProduct) {
         updateProduct(editingProduct.id, formData);
         setToastMsg("Product updated successfully");
      } else {
         addProduct({
            ...formData as Product,
            // Ensure required fields are present with defaults if missing
            img: formData.img || 'https://placehold.co/400',
            brand: formData.brand || 'GreenLife',
            eff: formData.eff || 'N/A',
            spec: formData.spec || 'Standard'
         });
         setToastMsg("New product added to inventory");
      }
      setIsModalOpen(false);
   };

   return (
      <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
         {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

         {/* Sidebar */}
         <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-background-dark border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 hidden md:flex">
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

         <main className="md:ml-64 flex-1 min-h-screen pb-20">
            <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4">
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex flex-col">
                     <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <span>Admin</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-primary font-bold">Product Management</span>
                     </div>
                     <h2 className="text-xl font-bold mt-1">Product Inventory</h2>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className="relative w-full md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                           placeholder="Search products..."
                           type="text"
                        />
                     </div>
                  </div>
               </div>
            </header>

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
               {/* Stats */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                     { label: "Total Items", val: inventory.length, icon: "inventory_2", color: "text-primary", bg: "bg-primary/10" },
                     { label: "Pending Installs", val: stats.pendingInstalls, icon: "engineering", color: "text-blue-500", bg: "bg-blue-500/10" },
                     { label: "Inventory Alerts", val: `${stats.lowStockCount} Items`, icon: "warning", color: "text-amber-500", bg: "bg-amber-500/10" },
                     { label: "Active Customers", val: stats.activeCustomers, icon: "group", color: "text-emerald-500", bg: "bg-emerald-500/10" }
                  ].map((stat, i) => (
                     <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                           <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                              <span className="material-symbols-outlined">{stat.icon}</span>
                           </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold">{stat.val}</h3>
                     </div>
                  ))}
               </div>

               <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="flex-1 w-full">
                        <h3 className="text-lg font-bold">Solar Products</h3>
                        <p className="text-xs text-slate-500">Manage your product catalog and availability</p>
                     </div>
                     <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <select
                           value={filterCategory}
                           onChange={(e) => setFilterCategory(e.target.value)}
                           className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 transition-all outline-none"
                        >
                           <option value="All">All Categories</option>
                           <option value="Solar Panels">Solar Panels</option>
                           <option value="Inverters">Inverters</option>
                           <option value="Batteries">Batteries</option>
                           <option value="Accessories">Accessories</option>
                        </select>
                        <button
                           onClick={() => handleOpenModal()}
                           className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-background-dark font-bold rounded-lg hover:shadow-lg hover:brightness-105 transition-all"
                        >
                           <span className="material-symbols-outlined text-lg">add</span> <span className="whitespace-nowrap">Add Product</span>
                        </button>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                           <tr>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product Info</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Unit Price</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Stock Status</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                           {filteredInventory.length > 0 ? (
                              filteredInventory.map((item) => (
                                 <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                             <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                          </div>
                                          <div className="min-w-0">
                                             <p className="text-sm font-bold truncate max-w-[200px]">{item.name}</p>
                                             <p className="text-[10px] text-slate-400">Series: {item.series}</p>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded whitespace-nowrap">{item.category}</span></td>
                                    <td className="px-6 py-4"><p className="text-sm font-bold">₦{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></td>
                                    <td className="px-6 py-4">
                                       <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${item.badge === 'Low Stock' ? 'bg-amber-100 text-amber-700' : 'bg-primary/20 text-primary'}`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${item.badge === 'Low Stock' ? 'bg-amber-500' : 'bg-primary'}`}></span> {item.badge || 'In Stock'}
                                       </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                       <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => handleOpenModal(item)} className="p-1.5 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                       </div>
                                    </td>
                                 </tr>
                              ))
                           ) : (
                              <tr>
                                 <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No products found matching your search.</td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </main>

         {/* Add/Edit Product Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
               <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <form onSubmit={handleSubmit} className="p-8">
                     <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                           <span className="material-symbols-outlined">close</span>
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">Product Name</label>
                           <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Solar Panel X" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">Series</label>
                           <input type="text" value={formData.series} onChange={e => setFormData({ ...formData, series: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Pro Series" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">Category</label>
                           <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary appearance-none">
                              <option>Solar Panels</option>
                              <option>Inverters</option>
                              <option>Batteries</option>
                              <option>Accessories</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">Price (₦)</label>
                           <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">Image URL</label>
                           <input type="url" value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary" placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-slate-500">Stock Status</label>
                           <select value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary appearance-none">
                              <option>In Stock</option>
                              <option>Low Stock</option>
                              <option>Out of Stock</option>
                           </select>
                        </div>
                     </div>

                     <div className="flex justify-end gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-primary text-background-dark font-bold rounded-xl hover:shadow-lg hover:brightness-105 transition-all">
                           {editingProduct ? 'Save Changes' : 'Create Product'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default ProductInventory;