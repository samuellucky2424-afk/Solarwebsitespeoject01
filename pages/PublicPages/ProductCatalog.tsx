import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader, PublicFooter, Toast } from '../../components/SharedComponents';
import { productsData, Product } from '../../data/products';
import { useCart } from '../../context/CartContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ProductCatalog: React.FC = () => {
  // --- State Management ---
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>("Popularity");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const itemsPerPage = 20; // Increased to accommodate denser grid
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setToastMessage(`Added ${product.name} to cart.`);
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceMax(5000);
    setSortBy("Popularity");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // --- Derived Data Logic ---
  const filteredProducts = useMemo(() => {
    return productsData.filter(product => {
      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchPrice = product.price <= priceMax;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.series.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchBrand && matchPrice && matchSearch;
    });
  }, [selectedCategories, selectedBrands, priceMax, searchQuery]);

  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    if (sortBy === "Price: Low to High") {
      return products.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      return products.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Name") {
      return products.sort((a, b) => a.name.localeCompare(b.name));
    }
    return products; // Default Popularity (as is in array)
  }, [filteredProducts, sortBy]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // --- GSAP Animations ---
  useGSAP(() => {
    // Animate grid items whenever paginatedProducts changes
    gsap.fromTo(".product-item", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }
    );
  }, { scope: containerRef, dependencies: [paginatedProducts] });

  useGSAP(() => {
     gsap.from(".filter-sidebar > *", {
       opacity: 0, x: -20, duration: 0.6, stagger: 0.05, ease: "power2.out"
     });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body overflow-x-hidden">
      <PublicHeader />
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      
      <main className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link to="/" className="text-primary-dark hover:underline">Home</Link>
          <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
          <span className="text-slate-500 dark:text-slate-400">Solar Product Catalog</span>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 py-3 rounded-lg font-bold text-forest dark:text-white"
          >
            <span className="material-symbols-outlined">filter_list</span>
            {isFilterOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`filter-sidebar ${isFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300 lg:animate-none`}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2 text-forest dark:text-white">
                <span className="material-symbols-outlined text-primary-dark">filter_list</span>
                Filters
              </h2>
              <button onClick={handleReset} className="text-xs text-primary-dark font-bold hover:underline">Reset All</button>
            </div>
            
             {/* Search */}
             <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400" 
                />
             </div>

            {/* Category Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Category</h3>
              <div className="space-y-2">
                {['Solar Panels', 'Inverters', 'Batteries', 'Accessories'].map((cat) => (
                   <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="h-5 w-5 rounded border-slate-300 dark:border-white/10 text-primary-dark focus:ring-primary/20 bg-white dark:bg-white/5" 
                      type="checkbox" 
                    />
                    <span className={`text-sm transition-colors ${selectedCategories.includes(cat) ? 'font-bold text-primary-dark' : 'text-slate-700 dark:text-gray-300'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {/* Price Range Slider */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Max Price</h3>
                 <span className="text-xs font-bold text-primary-dark">${priceMax}</span>
              </div>
              <div className="relative pt-1 px-2">
                <input 
                  type="range" 
                  min="0" 
                  max="5000" 
                  step="100" 
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-dark"
                />
                <div className="flex justify-between mt-2 text-xs font-medium text-slate-600 dark:text-gray-400">
                  <span>$0</span>
                  <span>$5,000+</span>
                </div>
              </div>
            </div>
             {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Brand</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {['EcoVolt', 'SunMaster', 'GreenTech', 'Lumina Solar'].map(brand => (
                   <label key={brand} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-5 w-5 rounded border-slate-300 dark:border-white/10 text-primary-dark focus:ring-primary/20 bg-white dark:bg-white/5" 
                      type="checkbox" 
                    />
                    <span className={`text-sm transition-colors ${selectedBrands.includes(brand) ? 'font-bold text-primary-dark' : 'text-slate-700 dark:text-gray-300'}`}>
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Grid Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-forest dark:text-white">Solar Products</h1>
                <p className="text-slate-500 text-sm">
                  Showing {paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
                </p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <label className="text-sm font-medium shrink-0 text-slate-700 dark:text-gray-300">Sort By:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-48 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm px-4 py-2 focus:ring-primary/20 focus:border-primary text-slate-700 dark:text-white outline-none"
                >
                  <option>Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Name</option>
                </select>
              </div>
            </div>

            {/* Product Grid - 3 cols mobile, 4 cols tablet, 5 cols desktop */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="product-item group bg-white dark:bg-white/5 rounded-xl overflow-hidden border border-slate-100 dark:border-white/10 hover:border-primary-dark/50 transition-all hover:shadow-xl flex flex-col">
                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={product.img} alt={product.name} />
                      {product.tag && (
                        <div className="absolute top-2 left-2 md:top-4 md:left-4">
                          <span className="bg-primary-dark text-forest text-[8px] md:text-[10px] font-bold uppercase px-1.5 py-0.5 md:px-2 md:py-1 rounded">{product.tag}</span>
                        </div>
                      )}
                      {product.badge && (
                        <div className="absolute top-2 right-2 md:top-4 md:right-4">
                          <span className="bg-white/90 dark:bg-background-dark/90 backdrop-blur-sm text-[8px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-forest dark:text-white">{product.badge}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 md:p-4 flex flex-col flex-1">
                      <div className="text-primary-dark text-[10px] md:text-xs font-bold uppercase mb-1 truncate">{product.series}</div>
                      <Link to={`/product/${product.id}`} className="text-xs md:text-sm lg:text-base font-bold mb-2 group-hover:text-primary-dark transition-colors text-forest dark:text-white leading-tight line-clamp-2" title={product.name}>{product.name}</Link>
                      
                      <div className="flex gap-2 md:gap-4 mb-2 md:mb-4 mt-auto">
                        <div className="text-[10px] md:text-[11px] text-slate-500 flex-1 min-w-0">
                          <span className="block font-bold text-slate-800 dark:text-slate-200 truncate">{product.eff}</span>
                          <span className="hidden sm:inline">Efficiency</span>
                          <span className="sm:hidden">Eff</span>
                        </div>
                        <div className="text-[10px] md:text-[11px] text-slate-500 border-l border-slate-200 dark:border-white/10 pl-2 md:pl-4 flex-1 min-w-0">
                          <span className="block font-bold text-slate-800 dark:text-slate-200 truncate">{product.spec}</span>
                          Specs
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-slate-50 dark:border-white/5 mt-2 md:mt-4">
                        <div className="text-sm md:text-xl font-bold text-forest dark:text-white">${product.price.toFixed(2)}</div>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="bg-primary-dark text-forest hover:bg-[#0dbb1d] p-1.5 md:p-2 rounded-lg transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-base md:text-xl">add_shopping_cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                 <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                 <h3 className="text-xl font-bold">No products found</h3>
                 <p className="text-sm">Try adjusting your filters or search criteria.</p>
                 <button onClick={handleReset} className="mt-4 text-primary-dark font-bold hover:underline">Clear Filters</button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`size-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
                        currentPage === page 
                        ? 'bg-primary-dark text-forest' 
                        : 'border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default ProductCatalog;