import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Toast } from '../../components/SharedComponents';
import { useAdmin, UserProfile } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Product } from '../../data/products';
import CheckoutPage from '../../pages/UserPages/CheckoutPage';
import OrderHistory from './OrderHistory';

type DealerView = 'shop' | 'orders' | 'checkout' | 'product';

interface DealerWorkspaceProps {
  activeUser: UserProfile;
}

const formatMoney = (amount: number) => `NGN ${Number(amount || 0).toLocaleString()}`;

const getDealerMargin = (product: Product) => {
  const normalPrice = Number(product.normalPrice || product.price || 0);
  const dealerPrice = Number(product.price || 0);

  if (!normalPrice || !dealerPrice || normalPrice <= dealerPrice) return 0;
  return Math.round(((normalPrice - dealerPrice) / normalPrice) * 100);
};

const getStockLabel = (product: Product) => {
  if (typeof product.stock === 'number') {
    return `${product.stock.toLocaleString()} units`;
  }

  return product.stockStatus || product.badge || 'Available';
};

const DealerNavButton: React.FC<{
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}> = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold transition-colors ${active
      ? 'bg-[#e8f7ee] text-[#0c3b20] border border-[#b9e6c8]'
      : 'text-white/68 hover:bg-white/8 hover:text-white'
      }`}
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
    <span>{label}</span>
  </button>
);

const ProductMetric: React.FC<{ label: string; value: string; tone?: 'green' | 'amber' | 'neutral' }> = ({ label, value, tone = 'neutral' }) => {
  const toneClasses = {
    green: 'text-[#0f7a35]',
    amber: 'text-[#a86b00]',
    neutral: 'text-[#17251c]',
  };

  return (
    <div className="rounded-lg border border-[#dbe8df] bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6b7d71]">{label}</p>
      <p className={`mt-1 text-xl font-black ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
};

const DealerProductCard: React.FC<{
  product: Product;
  onOpen: () => void;
  onAdd: () => void;
}> = ({ product, onOpen, onAdd }) => {
  const margin = getDealerMargin(product);
  const normalPrice = Number(product.normalPrice || product.price || 0);

  return (
    <article className="grid min-h-[236px] grid-cols-[124px_1fr] overflow-hidden rounded-lg border border-[#dbe8df] bg-white shadow-sm transition-all hover:border-[#89c99d] hover:shadow-md">
      <button type="button" onClick={onOpen} className="bg-[#f3f7f1] p-4">
        <img src={product.img} alt={product.name} className="h-full max-h-[190px] w-full object-contain" />
      </button>

      <div className="flex min-w-0 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0f7a35]">{product.category}</p>
            <button type="button" onClick={onOpen} className="mt-1 text-left">
              <h3 className="line-clamp-2 text-base font-black leading-tight text-[#17251c]">{product.name}</h3>
            </button>
          </div>
          {margin > 0 && (
            <span className="shrink-0 rounded-md bg-[#fff4d6] px-2 py-1 text-[10px] font-black text-[#7a4d00]">
              {margin}% margin
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6b7d71]">Dealer price</p>
            <p className="mt-1 text-lg font-black text-[#0f7a35]">{formatMoney(product.price)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6b7d71]">Retail price</p>
            <p className="mt-1 text-sm font-bold text-[#17251c]">{formatMoney(normalPrice)}</p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6b7d71]">Inventory</p>
            <p className="truncate text-sm font-bold text-[#17251c]">{getStockLabel(product)}</p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#12351f] px-4 text-sm font-black text-white transition-colors hover:bg-[#0f7a35]"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            Add
          </button>
        </div>
      </div>
    </article>
  );
};

const DealerProductDetail: React.FC<{
  product: Product;
  relatedProducts: Product[];
  onBack: () => void;
  onAdd: (product: Product) => void;
  onCheckout: () => void;
  onOpenProduct: (productId: Product['id']) => void;
}> = ({ product, relatedProducts, onBack, onAdd, onCheckout, onOpenProduct }) => {
  const margin = getDealerMargin(product);
  const normalPrice = Number(product.normalPrice || product.price || 0);

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg border border-[#dbe8df] bg-white px-4 py-2 text-sm font-bold text-[#17251c] hover:border-[#89c99d]"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Products
      </button>

      <section className="grid gap-6 rounded-lg border border-[#dbe8df] bg-white p-5 shadow-sm lg:grid-cols-[minmax(280px,420px)_1fr]">
        <div className="flex min-h-[360px] items-center justify-center rounded-lg bg-[#f3f7f1] p-8">
          <img src={product.img} alt={product.name} className="max-h-[320px] w-full object-contain" />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#e8f7ee] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#0f7a35]">
              {product.category}
            </span>
            {product.badge && (
              <span className="rounded-md bg-[#edf0ec] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#435246]">
                {product.badge}
              </span>
            )}
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-[#17251c] md:text-4xl">{product.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f7064]">
            {product.description || product.spec || 'Professional-grade solar product available for approved trade partners.'}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ProductMetric label="Dealer price" value={formatMoney(product.price)} tone="green" />
            <ProductMetric label="Retail price" value={formatMoney(normalPrice)} />
            <ProductMetric label="Margin" value={margin > 0 ? `${margin}%` : 'Standard'} tone="amber" />
          </div>

          <div className="mt-6 grid gap-3 border-t border-[#e6eee8] pt-6 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6b7d71]">Brand</p>
              <p className="mt-1 font-bold text-[#17251c]">{product.brand || 'Greenlife'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6b7d71]">Series</p>
              <p className="mt-1 font-bold text-[#17251c]">{product.series || 'Trade Stock'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6b7d71]">Availability</p>
              <p className="mt-1 font-bold text-[#17251c]">{getStockLabel(product)}</p>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
            <button
              type="button"
              onClick={() => onAdd(product)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#12351f] px-5 text-sm font-black text-white transition-colors hover:bg-[#0f7a35]"
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              Add to Trade Cart
            </button>
            <button
              type="button"
              onClick={() => {
                onAdd(product);
                onCheckout();
              }}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-lg border border-[#b9e6c8] bg-[#e8f7ee] px-5 text-sm font-black text-[#0c3b20] transition-colors hover:bg-[#d9f0e1]"
            >
              Checkout
            </button>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#17251c]">Related trade stock</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <button
                key={relatedProduct.id}
                type="button"
                onClick={() => onOpenProduct(relatedProduct.id)}
                className="rounded-lg border border-[#dbe8df] bg-white p-4 text-left transition-colors hover:border-[#89c99d]"
              >
                <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-[#f3f7f1] p-3">
                  <img src={relatedProduct.img} alt={relatedProduct.name} className="h-full w-full object-contain" />
                </div>
                <p className="line-clamp-2 min-h-[40px] text-sm font-black text-[#17251c]">{relatedProduct.name}</p>
                <p className="mt-2 text-sm font-black text-[#0f7a35]">{formatMoney(relatedProduct.price)}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const DealerWorkspace: React.FC<DealerWorkspaceProps> = ({ activeUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams<{ productId: string }>();
  const { inventory } = useAdmin();
  const { role, signOut } = useAuth();
  const { addToCart, totalItems, totalPrice, setIsCartOpen } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortMode, setSortMode] = useState('name');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const params = new URLSearchParams(location.search);
  const requestedView = params.get('view') as DealerView | null;
  const currentView: DealerView = productId
    ? 'product'
    : requestedView === 'orders' || requestedView === 'checkout'
      ? requestedView
      : 'shop';

  const roleLabel = role === 'installer' ? 'Installer Trade' : 'Retail Partner';
  const categories = useMemo(() => (
    ['All', ...Array.from(new Set(inventory.map((product) => product.category).filter(Boolean)))]
  ), [inventory]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const products = inventory.filter((product) => {
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesSearch = !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    return [...products].sort((a, b) => {
      if (sortMode === 'price-low') return Number(a.price || 0) - Number(b.price || 0);
      if (sortMode === 'price-high') return Number(b.price || 0) - Number(a.price || 0);
      if (sortMode === 'margin') return getDealerMargin(b) - getDealerMargin(a);
      return a.name.localeCompare(b.name);
    });
  }, [categoryFilter, inventory, searchTerm, sortMode]);

  const selectedProduct = useMemo(() => {
    if (!productId) return null;
    return inventory.find((product) => String(product.id) === String(productId)) || null;
  }, [inventory, productId]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return inventory
      .filter((product) => product.category === selectedProduct.category && String(product.id) !== String(selectedProduct.id))
      .slice(0, 4);
  }, [inventory, selectedProduct]);

  const inStockCount = inventory.filter((product) => product.stockStatus !== 'Out of Stock').length;
  const categoriesCount = categories.length > 0 ? Math.max(categories.length - 1, 0) : 0;
  const averageMargin = inventory.length
    ? Math.round(inventory.reduce((sum, product) => sum + getDealerMargin(product), 0) / inventory.length)
    : 0;

  const handleViewChange = (view: DealerView) => {
    if (view === 'shop') {
      navigate('/dashboard?view=shop', { replace: true });
    } else if (view === 'orders') {
      navigate('/dashboard?view=orders', { replace: true });
    } else if (view === 'checkout') {
      navigate('/dashboard?view=checkout', { replace: true });
    }
    setMobileNavOpen(false);
  };

  const handleAddToCart = (product: Product) => {
    const added = addToCart(product, 1);
    if (added) {
      setToastMessage(`${product.name} added to trade cart`);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Sign out of dealer workspace?')) return;
    navigate('/login', { replace: true });
    await signOut();
  };

  const navContent = (
    <>
      <div className="flex items-center gap-3 px-1">
        <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-white p-1">
          <img src="/logo.png" alt="Greenlife Solar" className="h-full w-full rounded-md object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-black leading-tight text-white">Greenlife Trade</p>
          <p className="text-xs font-bold text-[#9dd6aa]">{roleLabel}</p>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        <DealerNavButton
          active={currentView === 'shop' || currentView === 'product' || currentView === 'checkout'}
          icon="inventory_2"
          label="Shop Products"
          onClick={() => handleViewChange('shop')}
        />
        <DealerNavButton
          active={currentView === 'orders'}
          icon="receipt_long"
          label="Order History"
          onClick={() => handleViewChange('orders')}
        />
      </nav>

      <div className="mt-8 border-t border-white/10 pt-5">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Account</p>
        <div className="mt-4 rounded-lg border border-white/10 bg-white/6 p-3">
          <p className="line-clamp-1 text-sm font-black text-white">{activeUser.fullName}</p>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-white/58">{activeUser.email}</p>
          <span className="mt-3 inline-flex rounded-md bg-[#d9f0e1] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#0c3b20]">
            Approved
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-black text-red-100 transition-colors hover:bg-red-500/20"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        Log Out
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#eef3ee] text-[#17251c]">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 flex-col bg-[#102016] px-5 py-6 lg:flex">
          {navContent}
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close menu"
              className="absolute inset-0 bg-black/50"
              type="button"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="relative flex h-full w-[82%] max-w-[300px] flex-col bg-[#102016] px-5 py-6 shadow-2xl">
              {navContent}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#d4e1d7] bg-[#f8faf7]/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  className="rounded-lg border border-[#dbe8df] bg-white p-2 text-[#17251c] lg:hidden"
                >
                  <span className="material-symbols-outlined text-[20px]">menu</span>
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0f7a35]">Business Workspace</p>
                  <h1 className="truncate text-xl font-black text-[#17251c] md:text-2xl">
                    {currentView === 'orders' ? 'Order History' : currentView === 'checkout' ? 'Trade Checkout' : 'Dealer Product Desk'}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="relative inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#b9e6c8] bg-white px-3 text-sm font-black text-[#0c3b20] shadow-sm hover:bg-[#e8f7ee]"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                  <span className="hidden sm:inline">{formatMoney(totalPrice)}</span>
                  {totalItems > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c7372f] px-1 text-[10px] font-black text-white">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-4 md:p-6">
            {currentView !== 'orders' && currentView !== 'checkout' && (
              <section className="rounded-lg border border-[#d4e1d7] bg-[#17251c] p-5 text-white shadow-sm md:p-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#9dd6aa]">Greenlife partner procurement</p>
                    <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight md:text-4xl">
                      Trade inventory, dealer pricing, and order control.
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
                      {roleLabel} access for approved Greenlife Solar business partners.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/10 bg-white/8 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/48">SKUs</p>
                      <p className="mt-2 text-3xl font-black">{inventory.length}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/8 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/48">Avg margin</p>
                      <p className="mt-2 text-3xl font-black">{averageMargin}%</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {currentView === 'shop' && (
              <>
                <section className="grid gap-3 md:grid-cols-4">
                  <ProductMetric label="Available SKUs" value={String(inventory.length)} tone="green" />
                  <ProductMetric label="In Stock" value={String(inStockCount)} />
                  <ProductMetric label="Categories" value={String(categoriesCount)} />
                  <ProductMetric label="Cart Value" value={formatMoney(totalPrice)} tone="amber" />
                </section>

                <section className="rounded-lg border border-[#dbe8df] bg-white p-4 shadow-sm">
                  <div className="grid gap-3 lg:grid-cols-[1fr_220px_200px]">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#6b7d71]">search</span>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search products, brands, categories"
                        className="h-12 w-full rounded-lg border border-[#dbe8df] bg-[#f8faf7] pl-10 pr-4 text-sm font-semibold outline-none focus:border-[#89c99d] focus:ring-2 focus:ring-[#cfeedd]"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                      className="h-12 rounded-lg border border-[#dbe8df] bg-[#f8faf7] px-4 text-sm font-bold outline-none focus:border-[#89c99d] focus:ring-2 focus:ring-[#cfeedd]"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <select
                      value={sortMode}
                      onChange={(event) => setSortMode(event.target.value)}
                      className="h-12 rounded-lg border border-[#dbe8df] bg-[#f8faf7] px-4 text-sm font-bold outline-none focus:border-[#89c99d] focus:ring-2 focus:ring-[#cfeedd]"
                    >
                      <option value="name">Name</option>
                      <option value="margin">Margin</option>
                      <option value="price-low">Price low</option>
                      <option value="price-high">Price high</option>
                    </select>
                  </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                  {filteredProducts.map((product) => (
                    <DealerProductCard
                      key={product.id}
                      product={product}
                      onOpen={() => navigate(`/shop/${product.id}`)}
                      onAdd={() => handleAddToCart(product)}
                    />
                  ))}
                </section>

                {filteredProducts.length === 0 && (
                  <section className="rounded-lg border border-[#dbe8df] bg-white p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-[#9daf9f]">search_off</span>
                    <p className="mt-3 text-base font-black text-[#17251c]">No products found</p>
                  </section>
                )}
              </>
            )}

            {currentView === 'product' && selectedProduct && (
              <DealerProductDetail
                product={selectedProduct}
                relatedProducts={relatedProducts}
                onBack={() => handleViewChange('shop')}
                onAdd={handleAddToCart}
                onCheckout={() => handleViewChange('checkout')}
                onOpenProduct={(id) => navigate(`/shop/${id}`)}
              />
            )}

            {currentView === 'product' && !selectedProduct && (
              <section className="rounded-lg border border-[#dbe8df] bg-white p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-[#9daf9f]">inventory_2</span>
                <p className="mt-3 text-base font-black text-[#17251c]">Product not found</p>
                <button
                  type="button"
                  onClick={() => handleViewChange('shop')}
                  className="mt-5 rounded-lg bg-[#12351f] px-5 py-3 text-sm font-black text-white"
                >
                  Back to Products
                </button>
              </section>
            )}

            {currentView === 'orders' && (
              <OrderHistory />
            )}

            {currentView === 'checkout' && (
              <CheckoutPage isEmbedded={true} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DealerWorkspace;
