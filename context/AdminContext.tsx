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

export interface SolarPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  appliances: string[];
}

export interface UserProfile {
  id: string;
  firstName: string;
  fullName: string;
  email: string;
  phone?: string;
  plan: string;
  systemName: string;
  installDate: string;
  installTime?: string; // Added field for Time Installed
  warrantyStart: string;
  warrantyEnd: string;
  systemStatus: 'Operational' | 'Maintenance' | 'Offline' | 'Out of Care';
  avatar: string;
  address: string;
  referralCode: string;
  // Extended Details
  hasSolar?: boolean;
  inverterType?: string;
  batteryType?: string;
  systemSize?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeName: string;
  refereePurchaseTotal: number; // Must be >= 100,000 to qualify
  status: 'Pending' | 'Qualified' | 'Approved';
  date: string;
  reward?: {
    code: string;
    amount: number;
    expiryDate: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  date: string;
  read: boolean;
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
  packages: SolarPackage[];
  activeUser: UserProfile; // The demo user shared between dashboards
  referrals: Referral[];
  notifications: Notification[];
  stats: DashboardStats;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  updateRequestStatus: (id: string, status: ServiceRequest['status']) => void;
  deleteRequest: (id: string) => void;
  addRequest: (request: ServiceRequest) => void;
  addPackage: (pkg: Omit<SolarPackage, 'id'>) => void;
  deletePackage: (id: string) => void;
  // New Admin Actions
  updateUserSystem: (updates: Partial<UserProfile>) => void;
  registerUser: (details: Partial<UserProfile>) => void; // New registration action
  approveReferral: (referralId: string, amount: number, daysValid: number) => void;
  markNotificationRead: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Initial Data
const DEMO_USER: UserProfile = {
  id: "USR-001",
  firstName: "Alex",
  fullName: "Alex Johnson",
  email: "alex@example.com",
  plan: "Gold Maintenance Plan",
  systemName: "5kW Hybrid Residential System",
  installDate: "2023-03-12",
  installTime: "09:30",
  warrantyStart: "2023-03-12",
  warrantyEnd: "2025-03-12", // 2 Years default
  systemStatus: "Operational",
  address: "123 Solar Blvd, Sunnyville, CA",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgMyvPvI1r63Wv2p6ujv8_KbGcV-p94fgN0glHmuWokq901pP_Q9wynjwqM4R-nJpGN4XiVkvbFUk-eCFjnJytYN5BBTVUws__2aKEcKT1L-T_nRjsaBUcysTx4qt4_8KcZgHNVmbQ_h9oqxdh_wgtF0YfLurvL9YtnfHQQs7cfcdwyF8ZVZQxj3yxY8amxxUSR2t923D3oY5Ii5lRlYdL6dESPd331HVCOzw83ZmUTP7TJRMTU-7UdXA2gjcjyXlUFe2eFwul-hw",
  referralCode: "ALEX-SOLAR-24"
};

const INITIAL_REQUESTS: ServiceRequest[] = [
  { id: "#REQ-101", title: "Inverter Failure", type: "Maintenance", customer: "Sarah Jenkins", address: "123 Maple Dr, Austin TX", date: "2023-10-24", status: "Pending", priority: "High", description: "System showing red light error." },
  { id: "#REQ-102", title: "New Installation Quote", type: "Installation", customer: "Mike Ross", address: "88 Pearson St, NY", date: "2023-10-25", status: "Pending", priority: "Normal", description: "10kW System request." },
];

const INITIAL_PACKAGES: SolarPackage[] = [
  {
    id: "PKG-001",
    name: "Starter Home",
    price: 850000,
    description: "Perfect for small apartments or essential backup.",
    appliances: ["5 LED Lights", "1 Standing Fan", "1 Laptop Charge", "1 TV (43 inch)", "Phone Charging"]
  }
];

const INITIAL_REFERRALS: Referral[] = [
  { id: "REF-001", referrerId: "USR-001", refereeName: "John Doe", refereePurchaseTotal: 150000, status: "Qualified", date: "2024-02-15" },
  { id: "REF-002", referrerId: "USR-001", refereeName: "Jane Smith", refereePurchaseTotal: 50000, status: "Pending", date: "2024-02-20" }, // Not qualified yet
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "NOT-001", userId: "USR-001", title: "Maintenance Scheduled", message: "Your annual checkup is set for Oct 24.", type: "info", date: "2023-10-20", read: false },
  { id: "NOT-002", userId: "USR-001", title: "New Product Alert", message: "Check out the new Lithium series batteries.", type: "info", date: "2023-10-18", read: true }
];

// --- Security Utility Functions ---
const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) sanitized[key] = sanitizeInput(input[key]);
    return sanitized;
  }
  return input;
};

const secureSave = (key: string, data: any) => {
  try {
    const serialized = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(serialized))); 
    localStorage.setItem(key, encoded);
  } catch (e) { console.error("Storage Error:", e); }
};

const secureLoad = (key: string, fallback: any) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    const decoded = decodeURIComponent(escape(atob(stored)));
    return JSON.parse(decoded);
  } catch (e) { return fallback; }
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<Product[]>(() => secureLoad('greenlife_inventory_secure', productsData));
  const [requests, setRequests] = useState<ServiceRequest[]>(() => secureLoad('greenlife_requests_secure', INITIAL_REQUESTS));
  const [packages, setPackages] = useState<SolarPackage[]>(() => secureLoad('greenlife_packages_secure', INITIAL_PACKAGES));
  
  // Shared User State (Demo)
  const [activeUser, setActiveUser] = useState<UserProfile>(() => secureLoad('greenlife_active_user', DEMO_USER));
  const [referrals, setReferrals] = useState<Referral[]>(() => secureLoad('greenlife_referrals', INITIAL_REFERRALS));
  const [notifications, setNotifications] = useState<Notification[]>(() => secureLoad('greenlife_notifications', INITIAL_NOTIFICATIONS));

  // Persistence
  useEffect(() => secureSave('greenlife_inventory_secure', inventory), [inventory]);
  useEffect(() => secureSave('greenlife_requests_secure', requests), [requests]);
  useEffect(() => secureSave('greenlife_packages_secure', packages), [packages]);
  useEffect(() => secureSave('greenlife_active_user', activeUser), [activeUser]);
  useEffect(() => secureSave('greenlife_referrals', referrals), [referrals]);
  useEffect(() => secureSave('greenlife_notifications', notifications), [notifications]);

  // --- Actions ---
  const addProduct = (product: Omit<Product, 'id'>) => {
    setInventory(prev => [{ ...sanitizeInput(product), id: Date.now() }, ...prev]);
  };

  const updateProduct = (id: number, updates: Partial<Product>) => {
    setInventory(prev => prev.map(p => p.id === id ? { ...p, ...sanitizeInput(updates) } : p));
  };

  const deleteProduct = (id: number) => setInventory(prev => prev.filter(p => p.id !== id));

  const addRequest = (req: ServiceRequest) => {
    setRequests(prev => [sanitizeInput(req), ...prev]);
    // Auto notification
    addNotification(activeUser.id, "Request Received", `We received your ${req.type} request.`, "info");
  };

  const updateRequestStatus = (id: string, status: ServiceRequest['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    // Trigger notification
    if (status === 'Approved' || status === 'Completed' || status === 'Scheduled') {
       addNotification(activeUser.id, "Status Update", `Your request ${id} is now ${status}.`, "success");
    }
  };

  const deleteRequest = (id: string) => setRequests(prev => prev.filter(r => r.id !== id));

  const addPackage = (pkg: Omit<SolarPackage, 'id'>) => {
    setPackages(prev => [{ ...sanitizeInput(pkg), id: `PKG-${Date.now()}` }, ...prev]);
  };

  const deletePackage = (id: string) => setPackages(prev => prev.filter(p => p.id !== id));

  // --- New User & Referral Actions ---

  const updateUserSystem = (updates: Partial<UserProfile>) => {
    setActiveUser(prev => ({ ...prev, ...updates }));
    addNotification(activeUser.id, "System Update", "Your solar system details have been updated by admin.", "info");
  };

  const registerUser = (details: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      ...DEMO_USER, // Basic defaults
      ...details,
      id: `USR-${Date.now()}`,
      // Derive system name if possible
      systemName: details.hasSolar ? `${details.systemSize} System` : 'No System Registered',
      systemStatus: details.hasSolar ? 'Operational' : 'Out of Care',
      plan: 'Basic Member',
      // Ensure installation data is consistent if provided
      installDate: details.installDate || new Date().toISOString().split('T')[0],
      installTime: details.installTime || undefined
    };
    setActiveUser(newUser);
    // Add welcome notification
    addNotification(newUser.id, "Welcome!", "Welcome to Greenlife Solar. Your account has been created.", "success");
  };

  const approveReferral = (referralId: string, amount: number, daysValid: number) => {
    const code = `REW-${Date.now().toString().slice(-4)}`;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + daysValid);

    setReferrals(prev => prev.map(ref => {
      if (ref.id === referralId) {
        return {
          ...ref,
          status: 'Approved',
          reward: {
            code,
            amount,
            expiryDate: expiry.toLocaleDateString()
          }
        };
      }
      return ref;
    }));

    // Notify User
    addNotification(
      activeUser.id, 
      "Referral Reward Approved!", 
      `Congratulation! You earned a ₦${amount.toLocaleString()} discount. Code: ${code}. Valid for ${daysValid} days.`, 
      "success"
    );
  };

  const addNotification = (userId: string, title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `NOT-${Date.now()}`,
      userId,
      title,
      message,
      type,
      date: new Date().toLocaleDateString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const stats: DashboardStats = {
    totalSales: 124500,
    pendingInstalls: requests.filter(r => r.type === 'Installation' && r.status !== 'Completed').length,
    lowStockCount: inventory.filter(p => (p.category === 'Batteries' ? false : false)).length,
    activeCustomers: 842 + requests.length
  };

  return (
    <AdminContext.Provider value={{ 
      inventory, requests, packages, stats, activeUser, referrals, notifications,
      addProduct, updateProduct, deleteProduct, 
      updateRequestStatus, deleteRequest, addRequest,
      addPackage, deletePackage,
      updateUserSystem, registerUser, approveReferral, markNotificationRead
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