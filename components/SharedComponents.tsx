import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// --- SVGs ---

export const Logo: React.FC<{ className?: string }> = ({ className = "size-8" }) => (
  <img src="/logo.png" alt="Greenlife Solar" className={`${className} object-contain`} />
);

// --- Cart Components ---

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();

  // Close when clicking backdrop
  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white dark:bg-[#0f2015] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-forest dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined">shopping_cart</span> Your Cart
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
              <span className="material-symbols-outlined text-6xl mb-4">production_quantity_limits</span>
              <p className="font-bold text-lg">Your cart is empty</p>
              <button onClick={() => setIsCartOpen(false)} className="mt-4 text-primary font-bold hover:underline">Start Shopping</button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="w-20 h-20 rounded-lg bg-white dark:bg-black/20 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${item.img}')` }}></div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-forest dark:text-white line-clamp-2">{item.name}</h4>
                    <p className="text-xs text-primary font-bold mt-1">₦{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-white dark:bg-black/20 rounded-lg px-2 py-1 border border-gray-200 dark:border-white/10">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-sm font-bold hover:text-primary">-</button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-sm font-bold hover:text-primary">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-forest dark:text-white font-medium">Subtotal</span>
              <span className="text-xl font-bold text-forest dark:text-white">₦{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <Link
              to={isAuthenticated ? "/dashboard?view=checkout" : "/checkout"}
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-primary text-forest font-bold py-4 rounded-xl hover:brightness-105 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              Checkout Now <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export const FloatingCartButton: React.FC = () => {
  const { totalItems, setIsCartOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-6 right-6 z-40 bg-forest text-primary p-4 rounded-full shadow-2xl shadow-forest/40 hover:scale-110 transition-transform animate-in zoom-in duration-300 flex items-center justify-center"
    >
      <span className="material-symbols-outlined text-2xl">shopping_cart</span>
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-background-light dark:border-background-dark">
        {totalItems}
      </span>
    </button>
  );
};

export const Toast: React.FC<{ message: string, onClose: () => void }> = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 right-6 z-[80] bg-forest text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-primary/20 p-1 rounded-full text-primary">
        <span className="material-symbols-outlined text-sm font-bold">check</span>
      </div>
      <div>
        <p className="font-bold text-sm">Success</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};

// --- Layout Wrappers ---

export const PublicHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { setIsCartOpen, totalItems } = useCart();

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-forest/10 dark:border-white/10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
        {/* Increased max-width to 1600px for wider fit */}
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 relative z-50">
            <div className="size-10 flex items-center justify-center">
              <img src="/logo.png" alt="Greenlife Solar" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-forest dark:text-white text-xl font-bold tracking-tight">Greenlife Solar</h2>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            <Link to="/products" className="text-forest/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-semibold transition-colors">Products</Link>
            <Link to="/consultation" className="text-forest/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-semibold transition-colors">Solutions</Link>
            <Link to="/gallery" className="text-forest/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-semibold transition-colors">Gallery</Link>
            <Link to="/requests" className="text-forest/80 dark:text-white/80 hover:text-primary dark:hover:text-primary text-sm font-semibold transition-colors">Support</Link>
          </nav>

          <div className="flex items-center gap-4 relative z-50">
            <Link to="/login" className="text-sm font-bold hover:text-primary hidden sm:block">Sign In</Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-forest dark:text-white hover:text-primary transition-colors hidden sm:block"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 size-4 bg-primary text-[10px] font-bold rounded-full flex items-center justify-center text-forest">
                  {totalItems}
                </span>
              )}
            </button>
            <Link to="/consultation" className="bg-primary hover:bg-primary/90 text-forest px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20 hidden sm:block">
              Get a Free Quote
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-forest dark:text-white hover:bg-forest/5 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Side Drawer */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-700 backdrop-blur-sm lg:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-y-0 right-0 z-[60] w-[85%] max-w-[320px] bg-white dark:bg-[#0f2015] shadow-2xl transform transition-transform duration-700 cubic-bezier(0.33, 1, 0.68, 1) lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
            <h3 className="text-xl font-bold text-forest dark:text-white">Menu</h3>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-forest dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-2">
            {[
              { to: "/products", label: "Products", icon: "inventory_2" },
              { to: "/consultation", label: "Solutions", icon: "solar_power" },
              { to: "/gallery", label: "Our Gallery", icon: "photo_library" },
              { to: "/requests", label: "Support", icon: "support_agent" },
            ].map((link) => (
              <Link
                key={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                to={link.to}
                className="flex items-center gap-4 p-4 rounded-xl text-forest dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
              >
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-forest transition-colors">
                  <span className="material-symbols-outlined">{link.icon}</span>
                </div>
                <span className="text-lg font-bold">{link.label}</span>
                <span className="material-symbols-outlined ml-auto text-gray-300 group-hover:text-primary">chevron_right</span>
              </Link>
            ))}

            <hr className="border-gray-100 dark:border-white/5 my-4" />

            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              to="/login"
              className="flex items-center gap-4 p-4 rounded-xl text-forest/70 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined">login</span>
              <span className="font-bold">Sign In</span>
            </Link>
          </nav>

          <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              to="/consultation"
              className="flex w-full items-center justify-center gap-2 bg-primary text-forest py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              Get a Free Quote
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export const PublicFooter: React.FC = () => (
  <footer className="bg-background-light dark:bg-black py-20 border-t border-forest/5 dark:border-white/5">
    {/* Increased Width */}
    <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="size-10 flex items-center justify-center">
            <img src="/logo.png" alt="Greenlife Solar" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-forest dark:text-white text-xl font-bold tracking-tight">Greenlife Solar</h2>
        </div>
        <p className="text-forest/60 dark:text-white/60">
          Leading the transition to sustainable energy since 2012. Professional solutions for a brighter, cleaner future.
        </p>
        <div className="flex gap-4">
          <a href="https://www.facebook.com/GreenlifeSolarsolution" target="_blank" rel="noopener noreferrer" className="size-10 rounded-full bg-forest/5 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-forest dark:text-white">
            <img src="https://cdn.simpleicons.org/facebook" className="w-4 h-4 opacity-60 hover:opacity-100 dark:invert" alt="facebook" />
          </a>
          <a href="https://www.instagram.com/greenlife_solarsolution?igsh=YjFiZHk0ajc3b2Yx" target="_blank" rel="noopener noreferrer" className="size-10 rounded-full bg-forest/5 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-forest dark:text-white">
            <img src="https://cdn.simpleicons.org/instagram" className="w-4 h-4 opacity-60 hover:opacity-100 dark:invert" alt="instagram" />
          </a>
        </div>
      </div>
      <div>
        <h4 className="font-bold text-lg mb-6 text-forest dark:text-white">Services</h4>
        <ul className="flex flex-col gap-4 text-forest/60 dark:text-white/60 text-sm">
          <li><Link to="/products" className="hover:text-primary transition-colors">Residential Solar</Link></li>
          <li><Link to="/products" className="hover:text-primary transition-colors">Commercial Installation</Link></li>
          <li><Link to="/products" className="hover:text-primary transition-colors">Battery Storage</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-lg mb-6 text-forest dark:text-white">Resources</h4>
        <ul className="flex flex-col gap-4 text-forest/60 dark:text-white/60 text-sm">
          <li><Link to="/gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
          <li><Link to="/requests" className="hover:text-primary transition-colors">Support Center</Link></li>
          <li><Link to="/consultation" className="hover:text-primary transition-colors">Get a Quote</Link></li>
          <li><Link to="/login" className="hover:text-primary transition-colors">Customer Portal</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-lg mb-6 text-forest dark:text-white">Contact</h4>
        <ul className="flex flex-col gap-4 text-forest/60 dark:text-white/60 text-sm">
          <li className="flex gap-3"><span className="material-symbols-outlined text-primary text-sm">location_on</span>Total plaza, 78 Old Lagos -Asaba Rd, Delta</li>
          <li className="flex gap-3"><span className="material-symbols-outlined text-primary text-sm">phone</span>0903 657 0294</li>
          <li className="flex gap-3"><span className="material-symbols-outlined text-primary text-sm">mail</span>infogreenlifetechnology@gmail.com</li>
        </ul>
      </div>
    </div>
    <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-20 pt-8 border-t border-forest/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-forest/40 dark:text-white/40 text-sm">© 2024 Greenlife Solar Solutions LTD. All rights reserved.</p>
    </div>
  </footer>
);

export const SectionHeader: React.FC<{ sub: string, title: string, dark?: boolean }> = ({ sub, title, dark }) => (
  <div className="mb-16">
    <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">{sub}</h2>
    <h3 className={`text-3xl md:text-5xl font-bold leading-tight ${dark ? 'text-white' : 'text-forest dark:text-white'}`}>{title}</h3>
  </div>
);