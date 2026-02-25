import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Product } from '../data/products';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => boolean;
  removeFromCart: (productId: any) => void;
  updateQuantity: (productId: any, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY_PREFIX = 'greenlife_cart_';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prevUserIdRef = useRef<string | null>(null);

  // Build per-user storage key
  const userId = user?.id || null;
  const storageKey = userId ? `${CART_KEY_PREFIX}${userId}` : null;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage when user changes (login/logout)
  useEffect(() => {
    if (userId && userId !== prevUserIdRef.current) {
      // User logged in — load their cart
      try {
        const saved = localStorage.getItem(`${CART_KEY_PREFIX}${userId}`);
        setCartItems(saved ? JSON.parse(saved) : []);
      } catch {
        setCartItems([]);
      }
    } else if (!userId && prevUserIdRef.current) {
      // User logged out — clear displayed cart (data stays in localStorage for next login)
      setCartItems([]);
      setIsCartOpen(false);
    }
    prevUserIdRef.current = userId;
  }, [userId]);

  // Save cart to localStorage whenever it changes (only for logged-in users)
  useEffect(() => {
    if (storageKey && userId) {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    }
  }, [cartItems, storageKey, userId]);

  const addToCart = (product: Product, quantity: number): boolean => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return false;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    return true;
  };

  const removeFromCart = (productId: any) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: any, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, totalPrice, isCartOpen, setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
