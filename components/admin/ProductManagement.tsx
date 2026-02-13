import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Product } from '../../data/products';
import { uploadImage } from '../../config/supabaseClient';
import { Toast } from '../../components/SharedComponents';

const ProductManagement: React.FC = () => {
    const { inventory, addProduct, updateProduct, deleteProduct } = useAdmin();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('All');

    // Upload State
    const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', series: '', price: 0, category: 'Solar Panels', brand: '', spec: '', eff: '', img: '', badge: 'In Stock', description: ''
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

    // Unique Categories for Datalist
    const uniqueCategories = useMemo(() => {
        const cats = new Set(inventory.map(p => p.category));
        return ['Solar Panels', 'Inverters', 'Batteries', 'Accessories', ...Array.from(cats)].filter((v, i, a) => a.indexOf(v) === i);
    }, [inventory]);

    // Handlers
    const handleOpenModal = (product?: Product) => {
        setImageFile(null);
        setImageMode('url');
        if (product) {
            setEditingProduct(product);
            setFormData(product);
            setImageMode(product.img.startsWith('http') && !product.img.includes('supabase') ? 'url' : 'url'); // Default to URL for now, logic can be smarter
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', series: '', price: 0, category: 'Solar Panels', brand: '', spec: '', eff: '', img: '', badge: 'In Stock', description: ''
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        if (!formData.name || !formData.price) return;

        let finalImageUrl = formData.img;

        if (imageMode === 'upload' && imageFile) {
            const uploadedUrl = await uploadImage(imageFile, 'greenlife-assets', 'products');
            if (uploadedUrl) {
                finalImageUrl = uploadedUrl;
            } else {
                setToastMsg("Failed to upload image. Please try again.");
                setUploading(false);
                return;
            }
        }

        const productData = {
            ...formData,
            img: finalImageUrl || 'https://placehold.co/400',
            brand: formData.brand || 'GreenLife',
            eff: formData.eff || 'N/A',
            spec: formData.spec || 'Standard'
        };

        if (editingProduct) {
            updateProduct(editingProduct.id, productData);
            setToastMsg("Product updated successfully");
        } else {
            addProduct(productData as Product);
            setToastMsg("Product created successfully");
        }

        setUploading(false);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Product Inventory</h2>
                    <p className="text-[#4c9a52]">Manage your solar products catalog</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-4 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-full md:w-64"
                        placeholder="Search products..."
                        type="text"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 w-full">
                        <h3 className="text-lg font-bold">All Products</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 transition-all outline-none"
                        >
                            <option value="All">All Categories</option>
                            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-forest font-bold rounded-lg hover:shadow-lg hover:brightness-105 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">add</span> <span className="whitespace-nowrap">Add Product</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#e7f3e8] dark:bg-[#1a331c]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Product Info</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Category</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Unit Price</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52] text-right">Actions</th>
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

            {/* Add/Edit Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-[#152a17] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                        <form onSubmit={handleSubmit} className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-forest dark:text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Product Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Solar Panel X" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Series</label>
                                    <input type="text" value={formData.series} onChange={e => setFormData({ ...formData, series: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Pro Series" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Category</label>
                                    <input
                                        list="categories-list"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Select or Type New..."
                                    />
                                    <datalist id="categories-list">
                                        {uniqueCategories.map(cat => <option key={cat} value={cat} />)}
                                    </datalist>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Price (₦)</label>
                                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary" placeholder="0.00" />
                                </div>

                                {/* Image Selection */}
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Product Image</label>
                                    <div className="flex gap-4 mb-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="imgMode" checked={imageMode === 'url'} onChange={() => setImageMode('url')} className="text-primary focus:ring-primary" />
                                            <span className="text-sm font-medium">Image URL</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="imgMode" checked={imageMode === 'upload'} onChange={() => setImageMode('upload')} className="text-primary focus:ring-primary" />
                                            <span className="text-sm font-medium">Upload File</span>
                                        </label>
                                    </div>

                                    {imageMode === 'url' ? (
                                        <input type="url" value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary" placeholder="https://..." />
                                    ) : (
                                        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary" />
                                    )}
                                </div>

                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Detailed product description..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Stock Status</label>
                                    <select value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary appearance-none">
                                        <option>In Stock</option>
                                        <option>Low Stock</option>
                                        <option>Out of Stock</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 border-t border-slate-100 dark:border-white/10 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                                <button type="submit" disabled={uploading} className="px-8 py-3 bg-primary text-forest font-bold rounded-xl hover:shadow-lg hover:brightness-105 transition-all flex items-center gap-2 disabled:opacity-50">
                                    {uploading && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
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

export default ProductManagement;
