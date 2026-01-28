import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { productsData, Product } from '../data/products';

// Types
export interface ServiceRequest {
  id: string;
  title: string;
  type: 'Maintenance' | 'Installation' | 'Survey' | 'Upgrade';
  customer: string;
  address: string;
  date: string;
  status: 'Pending' | 'Approved' | 'In Progress' | 'Completed' | 'Scheduled';
  priority: 'High' | 'Normal' | 'Low';
  description?: string;
}

export interface DashboardStats {
  totalSales: number;
  pendingInstalls: number;
  lowStockCount: number;
  activeCustomers: number;
}

interface AdminContextType {
  inventory: Product[];
  requests: ServiceRequest[];
  stats: DashboardStats;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  updateRequestStatus: (id: string, status: ServiceRequest['status']) => void;
  deleteRequest: (id: string) => void;
  addRequest: (request: ServiceRequest) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Initial Mock Data for Requests
const INITIAL_REQUESTS: ServiceRequest[] = [
  { id: "#REQ-101", title: "Inverter Failure", type: "Maintenance", customer: "Sarah Jenkins", address: "123 Maple Dr, Austin TX", date: "2023-10-24", status: "Pending", priority: "High", description: "System showing red light error." },
  { id: "#REQ-102", title: "New Installation Quote", type: "Installation", customer: "Mike Ross", address: "88 Pearson St, NY", date: "2023-10-25", status: "Pending", priority: "Normal", description: "10kW System request." },
  { id: "#REQ-103", title: "Annual Cleaning", type: "Maintenance", customer: "Jessica Pearson", address: "Central Park West", date: "2023-10-23", status: "Scheduled", priority: "Low" }
];

// --- Security Utility Functions (Frontend Simulation) ---
// In a real application, sanitization MUST happen on the server.
// Here we simulate it to prevent XSS in our mock data persistence.
const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Basic escape
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
};

// Simulate Secure Storage (Mocking database encryption)
const secureSave = (key: string, data: any) => {
  try {
    // In production, this would be an encrypted DB call
    const serialized = JSON.stringify(data);
    // Simple base64 encoding to simulate "not plain text" (NOT REAL SECURITY)
    const encoded = btoa(unescape(encodeURIComponent(serialized))); 
    localStorage.setItem(key, encoded);
  } catch (e) {
    console.error("Storage Error:", e);
  }
};

const secureLoad = (key: string, fallback: any) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    // Decode
    const decoded = decodeURIComponent(escape(atob(stored)));
    return JSON.parse(decoded);
  } catch (e) {
    console.warn("Data Corruption detected or format changed. Recovering defaults.");
    return fallback;
  }
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inventory State with Recovery
  const [inventory, setInventory] = useState<Product[]>(() => {
    return secureLoad('greenlife_inventory_secure', productsData);
  });

  // Requests State with Recovery
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    return secureLoad('greenlife_requests_secure', INITIAL_REQUESTS);
  });

  // Persistence Effects (Auto-Save/Backup)
  useEffect(() => {
    secureSave('greenlife_inventory_secure', inventory);
  }, [inventory]);

  useEffect(() => {
    secureSave('greenlife_requests_secure', requests);
  }, [requests]);

  // Actions with Sanitization
  const addProduct = (product: Omit<Product, 'id'>) => {
    const cleanProduct = sanitizeInput(product); // Sanitize inputs
    const newProduct = { ...cleanProduct, id: Date.now() };
    setInventory(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: number, updates: Partial<Product>) => {
    const cleanUpdates = sanitizeInput(updates);
    setInventory(prev => prev.map(p => p.id === id ? { ...p, ...cleanUpdates } : p));
  };

  const deleteProduct = (id: number) => {
    setInventory(prev => prev.filter(p => p.id !== id));
  };

  const addRequest = (req: ServiceRequest) => {
    const cleanReq = sanitizeInput(req);
    setRequests(prev => [cleanReq, ...prev]);
  };

  const updateRequestStatus = (id: string, status: ServiceRequest['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  // Derived Stats
  const stats: DashboardStats = {
    totalSales: 124500, // Static for now, could be dynamic based on orders
    pendingInstalls: requests.filter(r => r.type === 'Installation' && r.status !== 'Completed').length,
    lowStockCount: inventory.filter(p => (p.category === 'Batteries' ? false : false)).length, // Simplified logic
    activeCustomers: 842 + requests.length // Dummy logic
  };

  return (
    <AdminContext.Provider value={{ 
      inventory, requests, stats, 
      addProduct, updateProduct, deleteProduct, 
      updateRequestStatus, deleteRequest, addRequest 
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};