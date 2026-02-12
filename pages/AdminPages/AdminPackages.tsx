import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Toast } from '../../components/SharedComponents';

const AdminPackages: React.FC = () => {
  const { packages, addPackage, deletePackage } = useAdmin();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [appliancesStr, setAppliancesStr] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    addPackage({
      name,
      price: Number(price),
      description,
      appliances: appliancesStr.split(',').map(s => s.trim()).filter(s => s.length > 0)
    });

    setName('');
    setPrice('');
    setDescription('');
    setAppliancesStr('');
    setToastMsg("Package added successfully");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this package?")) {
      deletePackage(id);
      setToastMsg("Package deleted");
    }
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      
      {/* Sidebar (Duplicated for standalone page, ideally refactored) */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-background-dark border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 hidden md:flex">
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
             <Link to="/admin/inventory" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">inventory_2</span>
                <span className="text-sm font-medium">Product Management</span>
             </Link>
             <Link to="/admin/gallery" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">photo_library</span>
                <span className="text-sm font-medium">Gallery Management</span>
             </Link>
             <Link to="/admin/packages" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-background-dark font-bold shadow-sm">
                <span className="material-symbols-outlined">package_2</span>
                <span className="text-sm">Solar Packages</span>
             </Link>
          </nav>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 m-4 rounded-xl border border-slate-100 dark:border-slate-800">
             <Link to="/admin" className="w-full block text-center py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">Sign Out</Link>
          </div>
       </aside>

       <main className="md:ml-64 flex-1 min-h-screen pb-20">
          <header className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-xl font-bold">Package Management</h2>
                   <p className="text-xs text-slate-500">Configure curated solar offers</p>
                </div>
             </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Form */}
             <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-24">
                   <h3 className="font-bold mb-4">Create New Package</h3>
                   <form onSubmit={handleAdd} className="space-y-4">
                      <div>
                         <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Package Name</label>
                         <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-primary focus:ring-2 outline-none" placeholder="e.g. Starter Pack" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Price (₦)</label>
                         <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-primary focus:ring-2 outline-none" placeholder="0.00" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
                         <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-primary focus:ring-2 outline-none resize-none" placeholder="Short summary..." />
                      </div>
                      <div>
                         <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Appliances (Comma Separated)</label>
                         <textarea required value={appliancesStr} onChange={e => setAppliancesStr(e.target.value)} rows={4} className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-primary focus:ring-2 outline-none resize-none" placeholder="5 Lights, 1 TV, 1 Fan..." />
                      </div>
                      <button type="submit" className="w-full bg-primary text-forest font-bold py-2 rounded-lg hover:brightness-105 transition-all">Add Package</button>
                   </form>
                </div>
             </div>

             {/* List */}
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map(pkg => (
                   <div key={pkg.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col relative group">
                      <button onClick={() => handleDelete(pkg.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                         <span className="material-symbols-outlined">delete</span>
                      </button>
                      <h4 className="font-bold text-lg">{pkg.name}</h4>
                      <p className="text-primary font-bold text-xl mb-2">₦{pkg.price.toLocaleString()}</p>
                      <p className="text-sm text-slate-500 mb-4">{pkg.description}</p>
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                         <p className="text-xs font-bold uppercase text-slate-400 mb-2">Power Capacity</p>
                         <div className="flex flex-wrap gap-2">
                            {pkg.appliances.map((app, i) => (
                               <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-medium">{app}</span>
                            ))}
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </main>
    </div>
  );
};

export default AdminPackages;