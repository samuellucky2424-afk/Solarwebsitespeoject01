import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PublicHeader, PublicFooter, Toast } from '../../components/SharedComponents';
import { useAdmin } from '../../context/AdminContext'; // Use AdminContext instead of static data
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Product, ProductType } from '../../data/products';
import { getPricedProduct, getProductDisplayPrice } from '../../utils/dealerPricing';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// --- Brand Card Configuration ---
// Each brand card renders its own logo. The General card uses the Greenlife
// mark on its dark teal background (as supplied), while Itel and Deye use
// transparent-background wordmarks so they sit cleanly on the card surface.
// `logoScale` keeps very wide wordmarks (e.g. the itel Energy lockup) from
// filling the whole card, leaving room for the label strip below.
const PRODUCT_TYPE_CARDS: {
  type: ProductType;
  label: string;
  logo: string;
  /** 'cover' fills the card (General), 'contain' letterboxes the mark */
  logoFit: 'contain' | 'cover';
  logoPosition: string;
  /** Fraction of the card the logo occupies */
  logoScale: number;
  /** Base tint of the card surface behind the logo */
  surface: string;
  /** Gradient scrim drawn over the logo */
  overlay: string;
  activeBorder: string;
  activeBg: string;
}[] = [
  {
    type: 'general',
    label: 'General Products',
    logo: '/images/brand-general-mark.png',
    logoFit: 'cover',
    logoPosition: '50% 42%',
    logoScale: 1,
    surface: 'bg-[#00383e]',
    overlay: 'from-black/60 via-black/20 to-black/5',
    activeBorder: 'border-primary',
    activeBg: 'bg-primary/10',
  },
  {
    type: 'itel',
    label: 'Itel Products',
    logo: '/images/brand-itel-mark.png',
    logoFit: 'contain',
    logoPosition: '50% 42%',
    logoScale: 0.8,
    surface: 'bg-white',
    overlay: 'from-black/30 via-black/8 to-transparent',
    activeBorder: 'border-[#e5006b]',
    activeBg: 'bg-[#e5006b]/10',
  },
  {
    type: 'deye',
    label: 'Deye Products',
    logo: '/images/brand-deye-mark.png',
    logoFit: 'contain',
    logoPosition: '50% 42%',
    logoScale: 0.66,
    surface: 'bg-white',
    overlay: 'from-black/30 via-black/8 to-transparent',
    activeBorder: 'border-[#3a3695]',
    activeBg: 'bg-[#3a3695]/10',
  },
];

const ProductCatalog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const categoryParam = searchParams.get('category');

  // --- State Management ---
  const { inventory, categories } = useAdmin(); // Get dynamic inventory and categories
  const [selectedProductType, setSelectedProductType] = useState<ProductType | 'all'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(5000000); // Increased max price for solar items
  const [sortBy, setSortBy] = useState<string>("Popularity");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const { addToCart } = useCart();
  const { role } = useAuth();
  const itemsPerPage = 20;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (filterParam === 'best-seller') {
      setFeaturedOnly(true);
    }

    if (categoryParam) {
      let mappedCategory = "";
      if (categoryParam === "inverters") mappedCategory = "Inverters";
      else if (categoryParam === "batteries") mappedCategory = "Batteries";
      else if (categoryParam === "panels") mappedCategory = "Solar Panels";
      else if (categoryParam === "generators") mappedCategory = "Solar Kits"; // Often grouped as Kits or Generators depending on inventory
      else mappedCategory = categoryParam;
      
      if (mappedCategory) {
        setSelectedCategories([mappedCategory]);
      }
    }
  }, [filterParam, categoryParam]);

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
    const success = addToCart(getPricedProduct(product, role), 1);
    if (success) {
      setToastMessage(`Added ${product.name} to cart.`);
    }
  };

  const handleReset = () => {
    setSelectedProductType('all');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceMax(5000000);
    setSortBy("Popularity");
    setSearchQuery("");
    setFeaturedOnly(false);
    setCurrentPage(1);
  };

  // --- Derived Data Logic ---
  const filteredProducts = useMemo(() => {
    return inventory.filter(product => {
      // Filter by product type (brand card selection)
      const matchProductType = selectedProductType === 'all' || (product.productType || 'general') === selectedProductType;
      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchPrice = getProductDisplayPrice(product, role) <= priceMax;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.series.toLowerCase().includes(searchQuery.toLowerCase());

      const matchFeatured = featuredOnly ? product.tag === "Best Seller" : true;

      // Filter out Out of Stock items
      const isInStock = product.badge !== 'Out of Stock';

      return matchProductType && matchCategory && matchBrand && matchPrice && matchSearch && matchFeatured && isInStock;
    });
  }, [inventory, selectedProductType, selectedCategories, selectedBrands, priceMax, searchQuery, featuredOnly, role]);

  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    if (sortBy === "Price: Low to High") {
      return products.sort((a, b) => getProductDisplayPrice(a, role) - getProductDisplayPrice(b, role));
    } else if (sortBy === "Price: High to Low") {
      return products.sort((a, b) => getProductDisplayPrice(b, role) - getProductDisplayPrice(a, role));
    } else if (sortBy === "Name") {
      return products.sort((a, b) => a.name.localeCompare(b.name));
    }
    return products; // Default Popularity (as is in array)
  }, [filteredProducts, sortBy, role]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Derive unique brands/categories from inventory for filters.
  // Use admin-managed categories from context, merged with any found in inventory.
  const uniqueCategories = useMemo(() => {
    const fromContext = categories.map(c => c.name);
    const fromInventory = inventory.map(p => p.category).filter(Boolean);
    return Array.from(new Set([...fromContext, ...fromInventory]));
  }, [categories, inventory]);
  const uniqueBrands = useMemo(() => Array.from(new Set(inventory.map(p => p.brand).filter(Boolean))), [inventory]);


  // --- GSAP Animations ---
  useGSAP(() => {
    // Force items to be visible first to avoid them getting stuck
    gsap.set(".product-item", { opacity: 0, y: 30 });

    // Animate grid items whenever paginatedProducts changes
    gsap.to(".product-item", {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.out",
      clearProps: "transform" // Clean up transform to prevent blurriness
    });
  }, { scope: containerRef, dependencies: [paginatedProducts] });

  useGSAP(() => {
    gsap.fromTo(".filter-sidebar > *",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.05, ease: "power2.out" }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body overflow-x-hidden">
      <PublicHeader />
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* Full width container */}
      <main className="w-full max-w-[1920px] mx-auto px-4 lg:px-6 py-6 flex-1">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/" className="text-primary-dark hover:underline">Home</Link>
          <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
          <span className="text-slate-500 dark:text-slate-400">Solar Product Catalog</span>
        </div>

        {/* Brand Category Cards - General / Itel / Deye */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* All Products card */}
          <div
            onClick={() => { setSelectedProductType('all'); setCurrentPage(1); }}
            className={`cursor-pointer rounded-xl border-2 flex flex-col items-center justify-center transition-all hover:shadow-md ${selectedProductType === 'all' ? 'border-primary bg-primary/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5'}`}
            style={{ width: '100px', height: '60px' }}
          >
            <span className={`material-symbols-outlined text-lg ${selectedProductType === 'all' ? 'text-primary-dark' : 'text-slate-400'}`}>apps</span>
            <span className={`text-[9px] font-bold leading-tight text-center mt-0.5 ${selectedProductType === 'all' ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'}`}>All Products</span>
          </div>
          {PRODUCT_TYPE_CARDS.map(card => (
            <div
              key={card.type}
              onClick={() => { setSelectedProductType(card.type); setCurrentPage(1); }}
              className={`cursor-pointer rounded-xl border-2 overflow-hidden relative flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                selectedProductType === card.type
                  ? `${card.activeBorder} ${card.activeBg} shadow-lg`
                  : 'border-slate-200 dark:border-white/10'
              }`}
              style={{ width: '100px', height: '60px' }}
            >
              {/* Brand logo panel */}
              <div className={`relative flex-1 w-full ${card.surface} overflow-hidden`}>
                <img
                  src={card.logo}
                  alt={card.label}
                  loading="lazy"
                  className={`absolute inset-0 pointer-events-none transition-transform duration-300 ${card.logoFit === 'cover' ? 'w-full h-full' : 'm-auto max-w-full max-h-full'}`}
                  style={card.logoFit === 'cover'
                    ? { objectFit: 'cover', objectPosition: card.logoPosition }
                    : {
                        width: `${card.logoScale * 100}%`,
                        height: 'auto',
                        maxHeight: `${card.logoScale * 100}%`,
                        objectFit: 'contain',
                      }}
                />
                {/* Dark scrim so the logo reads clearly against the card */}
                <div className={`absolute inset-0 bg-gradient-to-b ${card.overlay} pointer-events-none`}></div>
              </div>
              {/* Label strip */}
              <div className={`relative z-10 text-[9px] font-bold leading-tight text-center px-1 py-1 ${
                card.type === 'general'
                  ? 'bg-[#00383e] text-white'
                  : selectedProductType === card.type
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-300'
              }`} style={card.type !== 'general' && selectedProductType === card.type
                ? { backgroundColor: card.type === 'itel' ? '#e5006b' : '#3a3695' }
                : card.type === 'itel'
                  ? { backgroundColor: '#fde8f0' }
                  : card.type === 'deye'
                    ? { backgroundColor: '#e8e8f5' }
                    : undefined
              }>
                {card.label}
              </div>
            </div>
          ))}
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

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className={`filter-sidebar ${isFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300 lg:animate-none`}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2 text-forest dark:text-white">
                <span className="material-symbols-outlined text-primary-dark text-lg">filter_list</span>
                Filters
              </h2>
              <button onClick={handleReset} className="text-[10px] uppercase tracking-wider text-primary-dark font-bold hover:underline">Reset All</button>
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

            {/* Special Filters */}
            {featuredOnly && (
              <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-center justify-between">
                <span className="text-sm font-bold text-forest dark:text-white">Showing Top Products</span>
                <button onClick={() => setFeaturedOnly(false)} className="text-xs text-primary hover:underline">Clear</button>
              </div>
            )}

            {/* Category Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-500">Category</h3>
              <div className="space-y-2">
                {uniqueCategories.map((cat) => (
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-500">Max Price</h3>
                <span className="text-xs font-bold text-primary-dark">₦{priceMax.toLocaleString()}</span>
              </div>
              <div className="relative pt-1 px-2">
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="5000"
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-dark"
                />
                <div className="flex justify-between mt-2 text-xs font-medium text-slate-600 dark:text-gray-400">
                  <span>₦0</span>
                  <span>₦5M+</span>
                </div>
              </div>
            </div>
            {/* Brand Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-500">Brand</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {uniqueBrands.map(brand => (
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-xl font-bold text-forest dark:text-white">
                  {selectedProductType === 'all' ? 'Solar Products' :
                   selectedProductType === 'general' ? 'General Products' :
                   selectedProductType === 'itel' ? 'Itel Products' :
                   'Deye Products'}
                </h1>
                <p className="text-slate-500 text-xs">
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

            {/* Product Grid - Responsive Columns */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-5">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="product-item group bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 hover:border-primary-dark/30 transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.3)] hover:-translate-y-2 flex flex-col">
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
                    <div className="p-3 flex flex-col flex-1">
                      <div className="text-primary-dark text-[9px] md:text-[10px] font-bold uppercase mb-1 truncate">{product.series}</div>
                      <Link to={`/product/${product.id}`} className="text-[11px] md:text-sm font-bold mb-2 group-hover:text-primary-dark transition-colors text-forest dark:text-white leading-tight line-clamp-2" title={product.name}>{product.name}</Link>

                      <div className="flex gap-2 md:gap-3 mb-2 md:mb-3 mt-auto">
                        <div className="text-[9px] md:text-[10px] text-slate-500 flex-1 min-w-0">
                          <span className="block font-bold text-slate-800 dark:text-slate-200 truncate">{product.eff}</span>
                          <span className="hidden sm:inline">Efficiency</span>
                          <span className="sm:hidden">Eff</span>
                        </div>
                        <div className="text-[9px] md:text-[10px] text-slate-500 border-l border-slate-200 dark:border-white/10 pl-2 md:pl-3 flex-1 min-w-0">
                          <span className="block font-bold text-slate-800 dark:text-slate-200 truncate">{product.spec}</span>
                          Specs
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-white/5 mt-2">
                        <div className="text-sm md:text-lg font-bold text-forest dark:text-white">₦{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-primary-dark text-forest hover:bg-[#0dbb1d] p-1 md:p-1.5 rounded-lg transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-sm md:text-base">add_shopping_cart</span>
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
                      className={`size-10 flex items-center justify-center rounded-lg font-bold transition-colors ${currentPage === page
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
