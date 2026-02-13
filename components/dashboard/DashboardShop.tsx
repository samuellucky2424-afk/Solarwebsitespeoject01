import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useCart } from '../../context/CartContext';
import { Toast } from '../../components/SharedComponents';

const DashboardShop: React.FC = () => {
    const { inventory } = useAdmin();
    const { addToCart } = useCart();
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const categories = ["All", ...Array.from(new Set(inventory.map(p => p.category)))];

    const filteredProducts = useMemo(() => {
        return inventory.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [inventory, searchTerm, categoryFilter]);

    const handleAddToCart = (product: any) => {
        addToCart(product, 1);
        setToastMessage(`Added ${product.name} to cart`);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Shop Products</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Upgrade your system with premium components</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden group hover:border-primary/50 transition-colors">
                        <div className="aspect-square bg-gray-50 dark:bg-black/20 relative p-4 flex items-center justify-center">
                            <img src={product.img} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                            {product.tag && (
                                <span className="absolute top-2 right-2 bg-primary text-forest text-[10px] font-bold px-2 py-1 rounded">
                                    {product.tag}
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-primary font-bold uppercase mb-1">{product.category}</p>
                            <h3 className="font-bold text-forest dark:text-white mb-2 line-clamp-1">{product.name}</h3>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-lg font-bold">₦{product.price.toLocaleString()}</span>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="bg-primary/10 text-primary hover:bg-primary hover:text-forest p-2 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12 opacity-50">
                    <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                    <p>No products found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default DashboardShop;
