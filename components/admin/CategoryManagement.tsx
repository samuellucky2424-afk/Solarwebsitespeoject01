import React, { useState, useMemo } from 'react';
import { useAdmin, ProductCategory } from '../../context/AdminContext';
import { Toast } from '../../components/SharedComponents';

const CategoryManagement: React.FC = () => {
    const { categories, inventory, addCategory, updateCategory, deleteCategory } = useAdmin();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    // Derived Data
    const filteredCategories = useMemo(() => {
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cat.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    // Count products per category
    const productCountByCategory = useMemo(() => {
        const counts: Record<string, number> = {};
        inventory.forEach(p => {
            const cat = p.category;
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [inventory]);

    // Handlers
    const handleOpenModal = (category?: ProductCategory) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        const productCount = productCountByCategory[name] || 0;
        const warning = productCount > 0
            ? `This category has ${productCount} product(s) associated with it. Deleting the category will NOT delete the products, but they will keep the category name "${name}" until you reassign them.`
            : '';
        if (window.confirm(`Are you sure you want to delete the category "${name}"?\n\n${warning}`)) {
            const success = await deleteCategory(id);
            if (success) {
                setToastMsg('Category deleted successfully');
            } else {
                setToastMsg('Failed to delete category.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setToastMsg('Please enter a category name.');
            return;
        }

        const success = editingCategory
            ? await updateCategory(editingCategory.id, formData.name, formData.description)
            : await addCategory(formData.name, formData.description);

        if (success) {
            setToastMsg(editingCategory ? 'Category updated successfully' : 'Category created successfully');
            setIsModalOpen(false);
        } else {
            setToastMsg(editingCategory
                ? 'Failed to update category. It may be a duplicate name.'
                : 'Failed to create category. It may be a duplicate name.');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Product Categories</h2>
                    <p className="text-[#4c9a52]">Create and manage product categories</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-4 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-full md:w-64"
                        placeholder="Search categories..."
                        type="text"
                    />
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-4">
                    <div className="text-3xl font-bold text-[#4c9a52]">{categories.length}</div>
                    <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider mt-1">Total Categories</div>
                </div>
                <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-4">
                    <div className="text-3xl font-bold text-[#4c9a52]">{inventory.length}</div>
                    <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider mt-1">Total Products</div>
                </div>
                <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-4">
                    <div className="text-3xl font-bold text-[#4c9a52]">
                        {Object.values(productCountByCategory).reduce((a, b) => a + b, 0) > 0
                            ? Object.keys(productCountByCategory).length
                            : 0}
                    </div>
                    <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider mt-1">In Use</div>
                </div>
                <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-4">
                    <div className="text-3xl font-bold text-[#4c9a52]">
                        {categories.filter(c => !(productCountByCategory[c.name] > 0)).length}
                    </div>
                    <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider mt-1">Unused</div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 w-full">
                        <h3 className="text-lg font-bold">All Categories</h3>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-forest font-bold rounded-lg hover:shadow-lg hover:brightness-105 transition-all whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-lg">add</span> <span className="whitespace-nowrap">Add Category</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#e7f3e8] dark:bg-[#1a331c]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Category Name</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Description</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52]">Products</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c9a52] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-primary-dark text-lg">category</span>
                                                </div>
                                                <span className="text-sm font-bold">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[300px]">
                                                {cat.description || 'No description'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                (productCountByCategory[cat.name] || 0) > 0
                                                    ? 'bg-primary/20 text-primary-dark'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    (productCountByCategory[cat.name] || 0) > 0 ? 'bg-primary' : 'bg-slate-300'
                                                }`}></span>
                                                {productCountByCategory[cat.name] || 0} product{(productCountByCategory[cat.name] || 0) !== 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(cat)} className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Edit">
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No categories found. Click "Add Category" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-[#152a17] rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                        <form onSubmit={handleSubmit} className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-forest dark:text-white">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Category Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="e.g. Solar Panels"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Description (Optional)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Brief description of this category..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 border-t border-slate-100 dark:border-white/10 pt-6 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-primary text-forest font-bold rounded-xl hover:shadow-lg hover:brightness-105 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {editingCategory ? 'save' : 'add'}
                                    </span>
                                    {editingCategory ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
