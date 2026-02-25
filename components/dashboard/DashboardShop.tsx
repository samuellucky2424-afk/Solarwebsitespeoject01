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
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    const categories = ["All", ...Array.from(new Set(inventory.map(p => p.category)))];

    const filteredProducts = useMemo(() => {
        return inventory.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [inventory, searchTerm, categoryFilter]);

    const handleAddToCart = (product: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        addToCart(product, 1);
        setToastMessage(`Added ${product.name} to cart`);
        setSelectedProduct(null);
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in">
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold dark:text-white">Shop Products</h2>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Upgrade your system with premium components</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm focus:ring-1 focus:ring-primary outline-none"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filteredProducts.map(product => (
                    <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer"
                    >
                        <div className="aspect-square bg-gray-50 dark:bg-black/20 relative p-3 md:p-4 flex items-center justify-center">
                            <img src={product.img} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                            {product.tag && (
                                <span className="absolute top-2 right-2 bg-primary text-forest text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                                    {product.tag}
                                </span>
                            )}
                        </div>
                        <div className="p-3 md:p-4">
                            <p className="text-[10px] md:text-xs text-primary font-bold uppercase mb-0.5 md:mb-1">{product.category}</p>
                            <h3 className="font-bold text-sm md:text-base text-forest dark:text-white mb-1.5 md:mb-2 line-clamp-1">{product.name}</h3>
                            <div className="flex justify-between items-center mt-2 md:mt-4">
                                <span className="text-sm md:text-lg font-bold">₦{product.price.toLocaleString()}</span>
                                <button
                                    onClick={(e) => handleAddToCart(product, e)}
                                    className="bg-primary/10 text-primary hover:bg-primary hover:text-forest p-1.5 md:p-2 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base md:text-lg">add_shopping_cart</span>
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

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedProduct(null)}
                    ></div>
                    <div className="relative bg-white dark:bg-[#152a17] rounded-3xl p-5 md:p-8 max-w-3xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-3 right-3 md:top-4 md:right-4 p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors z-10"
                        >
                            <span className="material-symbols-outlined text-lg md:text-xl">close</span>
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-2 md:mt-0">
                            <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4 md:p-6 flex items-center justify-center min-h-[250px] md:min-h-[300px]">
                                <img
                                    src={selectedProduct.img}
                                    alt={selectedProduct.name}
                                    className="max-w-full max-h-[250px] md:max-h-[300px] object-contain"
                                />
                            </div>

                            <div className="flex flex-col">
                                <span className="text-primary font-bold text-xs md:text-sm uppercase tracking-wider mb-1 md:mb-2">
                                    {selectedProduct.category}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-black text-forest dark:text-white mb-2 md:mb-4 line-clamp-3">
                                    {selectedProduct.name}
                                </h2>

                                <div className="text-xl md:text-2xl font-bold text-forest dark:text-white mb-4 md:mb-6">
                                    ₦{selectedProduct.price.toLocaleString()}
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-forest dark:text-white mb-1 md:mb-2 text-sm md:text-base">Description</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 whitespace-pre-line">
                                        {selectedProduct.description || "No description available for this product. Contact support for more detailed specifications."}
                                    </p>

                                    {selectedProduct.brand && (
                                        <div className="mb-4 md:mb-6">
                                            <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-bold">Brand</span>
                                            <p className="text-forest dark:text-white font-medium text-sm md:text-base">{selectedProduct.brand}</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleAddToCart(selectedProduct)}
                                    className="w-full bg-primary text-forest py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 mt-auto shadow-md shadow-primary/20"
                                >
                                    <span className="material-symbols-outlined text-lg md:text-xl">add_shopping_cart</span>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardShop;
