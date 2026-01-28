import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicHeader, PublicFooter, Toast } from '../../components/SharedComponents';
import { productsData } from '../../data/products';
import { useCart } from '../../context/CartContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<typeof productsData[0] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<{ msg: string } | null>(null);
  const { addToCart } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const found = productsData.find(p => p.id === Number(id));
    if (found) setProduct(found);
  }, [id]);

  useGSAP(() => {
    if (!product) return;
    
    // Image enters from left
    gsap.from(".product-image-container", {
      x: -50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });

    // Details enter from right with stagger
    gsap.from(".product-details > *", {
      x: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.1
    });

  }, { scope: containerRef, dependencies: [product] });

  if (!product) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex flex-col items-center justify-center text-forest dark:text-white">
          <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <Link to="/products" className="text-primary mt-4 font-bold hover:underline">Back to Catalog</Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setToast({ msg: `Added ${quantity} x ${product.name} to cart` });
  };

  const handleRequestQuote = () => {
    setToast({ msg: `Quote requested for ${product.name}. Check your email.` });
  };

  return (
    <div ref={containerRef} className="bg-background-light dark:bg-background-dark font-display text-forest dark:text-[#f8fcf8] min-h-screen overflow-x-hidden">
      <PublicHeader />
      {toast && <Toast message={toast.msg} onClose={() => setToast(null)} />}
      
      <main className="max-w-[1280px] mx-auto px-6 py-6">
        <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-[#4c9a52]">
          <Link className="hover:underline" to="/">Home</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link className="hover:underline" to="/products">Products</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-forest dark:text-[#f8fcf8] truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 space-y-4 product-image-container">
            <div className="rounded-xl overflow-hidden bg-white dark:bg-[#1a2e1c] border border-[#e7f3e8] dark:border-[#2a3a2c] aspect-[4/3] relative group">
              <div className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url('${product.img}')` }}></div>
              {product.badge && <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold">{product.badge}</div>}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-5 flex flex-col gap-6 product-details">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">{product.series}</span>
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight mb-2">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex text-primary">
                  {[1,2,3,4,5].map(i=><span key={i} className="material-symbols-outlined filled-icon text-lg">star</span>)}
                </div>
                <span className="text-sm font-medium opacity-70">5.0 (24 Reviews)</span>
              </div>
            </div>
            
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary-dark">₦{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            <p className="text-lg leading-relaxed opacity-80">
              {product.description || "High-efficiency premium power for residential and commercial energy solutions. Engineered with cutting-edge technology for maximum energy harvest."}
            </p>
            
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-[#e7f3e8] dark:border-[#2a3a2c]">
              {[
                { icon: "bolt", label: "Power", val: product.badge || "Standard" },
                { icon: "speed", label: "Efficiency", val: product.eff },
                { icon: "verified_user", label: "Spec", val: product.spec }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  <span className="text-xs font-bold uppercase opacity-60">{item.label}</span>
                  <span className="text-lg font-bold">{item.val}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <div className="flex items-center border border-[#e7f3e8] dark:border-[#2a3a2c] rounded-lg bg-white dark:bg-white/5">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-3 hover:bg-primary/10 transition-colors text-lg"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-lg w-12 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-4 py-3 hover:bg-primary/10 transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-forest font-bold py-4 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
                >
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Add to Cart
                </button>
              </div>
              <button 
                onClick={handleRequestQuote}
                className="w-full border-2 border-primary text-primary font-bold py-4 rounded-lg hover:bg-primary hover:text-forest transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined">request_quote</span>
                Request Installation Quote
              </button>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              {[
                { icon: "local_shipping", text: "Free Shipping" },
                { icon: "eco", text: "Carbon Neutral" },
                { icon: "workspace_premium", text: "Tier 1 Product" }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-semibold opacity-70">
                  <span className="material-symbols-outlined text-[18px]">{badge.icon}</span> {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabbed Info */}
        <div className="mt-20">
          <div className="border-b border-[#e7f3e8] dark:border-[#2a3a2c] flex gap-8">
            <button className="border-b-4 border-primary pb-4 text-sm font-bold tracking-tight">Full Specifications</button>
          </div>
          <div className="py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Technical Parameters</h3>
              <table className="w-full text-left">
                <tbody className="divide-y divide-[#e7f3e8] dark:divide-[#2a3a2c]">
                  {[
                    ["Series", product.series],
                    ["Category", product.category],
                    ["Brand", product.brand],
                    ["Model ID", `GS-PROD-${product.id}`],
                    ["Warranty", "25 Years Linear Performance"]
                  ].map(([k, v], i) => (
                    <tr key={i}>
                      <td className="py-3 text-sm font-medium opacity-60">{k}</td>
                      <td className="py-3 text-sm font-bold">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Key Features</h3>
              <div className="bg-[#e7f3e8] dark:bg-[#1a2e1c] p-6 rounded-xl border border-[#cbe4cf] dark:border-[#2a3a2c]">
                <ul className="space-y-4">
                  {[
                    "Advanced cell technology for high efficiency",
                    "Excellent low light performance",
                    "High reliability and durability",
                    "Certified to withstand harsh environments"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                      <span className="text-sm font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default ProductDetail;