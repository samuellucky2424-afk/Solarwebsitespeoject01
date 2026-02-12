import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGallery } from '../../context/GalleryContext';
import { Toast } from '../../components/SharedComponents';

const AdminGallery: React.FC = () => {
  const { images, addImage, removeImage } = useGallery();
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Residential');
  const [newDescription, setNewDescription] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newTitle) return;

    addImage({
      url: newUrl,
      title: newTitle,
      category: newCategory,
      description: newDescription
    });

    setNewUrl('');
    setNewTitle('');
    setNewDescription('');
    setToastMsg('Image added to gallery successfully');
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Are you sure you want to remove this image?')) {
      removeImage(id);
      setToastMsg('Image removed');
    }
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      
       {/* Sidebar */}
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
             <Link to="/admin/gallery" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-background-dark font-bold shadow-sm">
                <span className="material-symbols-outlined">photo_library</span>
                <span className="text-sm">Gallery Management</span>
             </Link>
          </nav>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 m-4 rounded-xl border border-slate-100 dark:border-slate-800">
             <Link to="/admin" className="w-full block text-center py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">Sign Out</Link>
          </div>
       </aside>

       <main className="md:ml-64 flex-1 min-h-screen pb-20">
          <header className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <span>Admin</span>
                      <span className="material-symbols-outlined text-xs">chevron_right</span>
                      <span className="text-primary font-bold">Gallery</span>
                   </div>
                   <h2 className="text-xl font-bold mt-1">Gallery Manager</h2>
                </div>
             </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto space-y-8">
             
             {/* Upload Section */}
             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Add New Image</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Image URL</label>
                          <input 
                            type="url" 
                            required
                            value={newUrl}
                            onChange={e => setNewUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Project Title</label>
                          <input 
                            type="text" 
                            required
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            placeholder="e.g. Sunnyvale Installation"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                          />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                          <select 
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                          >
                             <option>Residential</option>
                             <option>Commercial</option>
                             <option>Industrial</option>
                          </select>
                      </div>
                      <div className="flex items-end">
                         <button type="submit" className="w-full bg-primary text-forest font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">add_photo_alternate</span> Upload
                         </button>
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
                      <textarea 
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}
                        placeholder="Briefly describe the project..."
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                      ></textarea>
                   </div>
                </form>
             </div>

             {/* Gallery Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map(img => (
                   <div key={img.id} className="group relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                      <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                         <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <a href={img.url} target="_blank" rel="noreferrer" className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40 transition-colors">
                                <span className="material-symbols-outlined">visibility</span>
                             </a>
                             <button onClick={() => handleRemove(img.id)} className="p-2 bg-red-500/80 backdrop-blur rounded-full text-white hover:bg-red-600 transition-colors">
                                <span className="material-symbols-outlined">delete</span>
                             </button>
                         </div>
                      </div>
                      <div className="p-4 flex-1">
                         <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm truncate pr-2">{img.title}</h4>
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
                                {img.category}
                            </span>
                         </div>
                         {img.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                               {img.description}
                            </p>
                         )}
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </main>
    </div>
  );
};

export default AdminGallery;