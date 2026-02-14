import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabaseClient';

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
  phone?: string;
  email?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description?: string;
}

import { Product } from '../data/products';

export interface SolarPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  appliances: string[];
  powerCapacity?: string;
  img?: string;
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
  installTime?: string;
  warrantyStart: string;
  warrantyEnd: string;
  systemStatus: 'Operational' | 'Maintenance' | 'Offline' | 'Out of Care';
  avatar: string;
  address: string;
  street?: string;
  city?: string;
  state?: string;
  landmark?: string;
  referralCode: string;
  hasSolar?: boolean;
  inverterType?: string;
  batteryType?: string;
  systemSize?: string;
  metadata?: any;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeName: string;
  refereePurchaseTotal: number;
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
  activeUser: UserProfile;
  referrals: Referral[];
  notifications: Notification[];
  stats: DashboardStats;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: any, product: Partial<Product>) => void;
  deleteProduct: (id: any) => void;
  updateRequestStatus: (id: string, status: ServiceRequest['status']) => void;
  deleteRequest: (id: string) => void;
  addRequest: (request: ServiceRequest) => void;
  addPackage: (pkg: Omit<SolarPackage, 'id'>) => Promise<boolean>;
  deletePackage: (id: string) => void;
  updateUserSystem: (updates: Partial<UserProfile>) => void;
  registerUser: (details: Partial<UserProfile>) => void;
  approveReferral: (referralId: string, amount: number, daysValid: number) => void;
  markNotificationRead: (id: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  // Gallery
  gallery: GalleryImage[];
  addGalleryImage: (image: Omit<GalleryImage, 'id'>) => Promise<boolean>;
  removeGalleryImage: (id: string) => void;
  // Installers
  addInstaller: (installer: UserProfile) => Promise<boolean>;
  deleteInstaller: (id: string) => void;
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
  warrantyEnd: "2025-03-12",
  systemStatus: "Operational",
  address: "123 Solar Blvd, Sunnyville, CA",
  street: "123 Solar Blvd",
  city: "Sunnyville",
  state: "CA",
  landmark: "Near Central Park",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgMyvPvI1r63Wv2p6ujv8_KbGcV-p94fgN0glHmuWokq901pP_Q9wynjwqM4R-nJpGN4XiVkvbFUk-eCFjnJytYN5BBTVUws__2aKEcKT1L-T_nRjsaBUcysTx4qt4_8KcZgHNVmbQ_h9oqxdh_wgtF0YfLurvL9YtnfHQQs7cfcdwyF8ZVZQxj3yxY8amxxUSR2t923D3oY5Ii5lRlYdL6dESPd331HVCOzw83ZmUTP7TJRMTU-7UdXA2gjcjyXlUFe2eFwul-hw",
  referralCode: "ALEX-SOLAR-24"
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [packages, setPackages] = useState<SolarPackage[]>([]);

  // Shared User State (Demo)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  // --- Real-time Data Fetching ---
  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from('greenlife_hub').select('*');
      if (error) {
        // Ignore AbortError
        if (error.message && (error.message.includes('AbortError') || error.message.includes('signal is aborted'))) {
          return;
        }
        console.error("Supabase Fetch Error:", error);
        return;
      }

      if (data) {
        const mappedInventory = data.filter(i => i.type === 'product').map(mapToProduct);
        const mappedPackages = data.filter(i => i.type === 'package').map(mapToPackage);
        const mappedRequests = data.filter(i => i.type === 'request').map(mapToRequest);
        const mappedGallery = data.filter(i => i.type === 'gallery').map(mapToGallery);
        const mappedUsers = data.filter(i => i.type === 'user_profile').map(mapToUserProfile);
        const mappedInstallers = data.filter(i => i.type === 'installer').map(mapToUserProfile);

        setInventory(mappedInventory);
        setPackages(mappedPackages);
        setRequests(mappedRequests);
        setGallery(mappedGallery);
        setAllUsers(mappedUsers);
        setInstallers(mappedInstallers);
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('AbortError')) {
        return; // Ignore aborts
      }
      console.error("Unexpected fetch error:", err);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch from both in parallel for speed
      const [profileRes, hubRes] = await Promise.all([
        supabase.from('profile').select('*').eq('id', userId).maybeSingle(),
        supabase.from('greenlife_hub').select('*').eq('type', 'user_profile').eq('user_id', userId).maybeSingle()
      ]);

      if (profileRes.data) {
        setActiveUser(mapToUserProfile({ ...profileRes.data, type: 'user_profile' }));
        return;
      }

      if (hubRes.data) {
        setActiveUser(mapToUserProfile(hubRes.data));
      } else {
        // Create initial profile if none exists to unblock UI
        setActiveUser({
          id: userId,
          firstName: 'User',
          fullName: 'New User',
          email: '',
          plan: 'Standard Plan',
          systemName: 'No System',
          installDate: '',
          warrantyStart: new Date().toLocaleDateString(),
          warrantyEnd: '2030-01-01',
          systemStatus: 'Operational',
          avatar: '',
          address: '',
          referralCode: `REF-${userId.substring(0, 8)}`
        });
      }
    } catch (err: any) {
      console.error("Profile fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();

    // Check Current Session & Fetch Profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Subscribe to Auth Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setActiveUser(null);
      }
    });

    // Subscribe to DB changes
    const channel = supabase
      .channel('public:greenlife_hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'greenlife_hub' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  // --- Actions ---

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const { error } = await supabase.from('greenlife_hub').insert([{
      type: 'product',
      name: product.name,
      price: product.price,
      category: product.category,
      image_url: product.img,
      description: product.spec,
      status: product.stockStatus || 'In Stock',
      metadata: {
        brand: product.brand,
        series: product.series,
        efficiency: product.eff,
        reviews: product.reviews || 0
      }
    }]);

    if (!error) {
      if (activeUser) addNotification(activeUser.id, "System", `Product ${product.name} added.`, "success");
      fetchData(); // Refresh local state
      return true;
    } else {
      console.error("Error adding product:", error);
      return false;
    }
  };

  const updateProduct = async (id: any, updates: Partial<Product>) => {
    // Logic would be here, but simpler to omit for MVP speed unless requested
    console.log("Update product", id, updates);
  };

  const deleteProduct = async (id: any) => {
    // In a real scenario, use UUID. Here we need to verify if id is UUID or string
    await supabase.from('greenlife_hub').delete().eq('id', id);
    if (activeUser) addNotification(activeUser.id, "System", "Product removed.", "info");
    fetchData();
  };

  const addRequest = async (req: ServiceRequest) => {
    const { error } = await supabase.from('greenlife_hub').insert([{
      type: 'request',
      title: req.title,
      status: req.status,
      description: req.description,
      user_id: activeUser?.id, 
      address: { address: req.address, phone: req.phone, email: req.email },
      metadata: {
        type: req.type,
        priority: req.priority,
        customer: req.customer
      }
    }]);

    if (!error && activeUser) {
      addNotification(activeUser.id, "Request Received", `We received your ${req.type} request.`, "info");
      setTimeout(() => {
        addNotification(activeUser.id, "Support", "We have received your request and will contact you shortly.", "success");
      }, 3000);
    }
  };

  const updateRequestStatus = async (id: string, status: ServiceRequest['status']) => {
    await supabase.from('greenlife_hub').update({ status }).eq('id', id);
  };

  const deleteRequest = async (id: string) => {
    await supabase.from('greenlife_hub').delete().eq('id', id);
  };

  const addPackage = async (pkg: Omit<SolarPackage, 'id'>) => {
    const { error } = await supabase.from('greenlife_hub').insert([{
      type: 'package',
      name: pkg.name,
      price: pkg.price,
      description: pkg.description,
      image_url: pkg.img,
      metadata: { appliances: pkg.appliances, powerCapacity: pkg.powerCapacity }
    }]);

    if (!error) {
      if (activeUser) addNotification(activeUser.id, "System", `Package ${pkg.name} created.`, "success");
      fetchData();
      return true;
    } else {
      console.error("Error adding package:", error);
      return false;
    }
  };

  const deletePackage = async (id: string) => {
    await supabase.from('greenlife_hub').delete().eq('id', id);
    fetchData();
  };

  // --- Installers / Team ---
  const [installers, setInstallers] = useState<UserProfile[]>([]);

  const addInstaller = async (installer: UserProfile) => {
    const { error } = await supabase.from('greenlife_hub').insert([{
      type: 'installer',
      title: installer.fullName,
      metadata: {
        email: installer.email,
        phone: installer.phone,
        role: 'Installer',
        status: 'Active'
      }
    }]);

    if (!error) {
      if (activeUser) addNotification(activeUser.id, "Team", `Installer ${installer.fullName} added.`, "success");
      fetchData();
      return true;
    } else {
      console.error("Error adding installer:", error);
      return false;
    }
  };

  const deleteInstaller = async (id: string) => {
    await supabase.from('greenlife_hub').delete().eq('id', id);
    fetchData();
  };

  // --- User & Local Logic (Keep local for demo user details for now) ---
  const updateUserSystem = (updates: Partial<UserProfile>) => {
    if (activeUser) {
      setActiveUser(prev => prev ? { ...prev, ...updates } : null);
      addNotification(activeUser.id, "System Update", "Your solar system details have been updated by admin.", "info");
    }
  };

  const registerUser = (details: Partial<UserProfile>) => {
    // Local only for demo
    setActiveUser(prev => prev ? { ...prev, ...details } : null);
    addNotification("USR-NEW", "Welcome!", "Welcome to Greenlife Solar.", "success");
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!activeUser) return;
    try {
      const { error } = await supabase
        .from('profile')
        .update({
          fullName: updates.fullName || activeUser.fullName,
          email: updates.email || activeUser.email,
          phone: updates.phone || activeUser.phone,
          address: updates.address || activeUser.address,
        })
        .eq('id', activeUser.id);

      if (error) {
        // Fallback to greenlife_hub
        await supabase
          .from('greenlife_hub')
          .update({
            title: updates.fullName || activeUser.fullName,
            metadata: {
              ...activeUser.metadata,
              email: updates.email || activeUser.email,
              phone: updates.phone || activeUser.phone,
              address: updates.address || activeUser.address,
            }
          })
          .eq('type', 'user_profile')
          .eq('user_id', activeUser.id);
      }

      setActiveUser(prev => prev ? { ...prev, ...updates } : null);
      addNotification(activeUser.id, "Profile Updated", "Profile updated successfully.", "success");
    } catch (err) {
      console.error("Error updating profile:", err);
      addNotification(activeUser.id, "Update Failed", "Could not save profile changes.", "alert");
    }
  };

  const approveReferral = (referralId: string, amount: number, daysValid: number) => {
    if (activeUser) {
      addNotification(activeUser.id, "Referral Approved", "Referral approved (Demo).", "success");
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // --- Mappers ---
  const mapToProduct = (item: any): Product => ({
    id: item.id,
    name: item.name,
    price: item.price,
    img: item.image_url,
    category: item.category,
    brand: item.metadata?.brand || '',
    series: item.metadata?.series || '',
    stockStatus: item.status || 'In Stock',
    eff: item.metadata?.efficiency || '',
    spec: item.description,
    reviews: item.metadata?.reviews || 0
  });

  const mapToPackage = (item: any): SolarPackage => ({
    id: item.id,
    name: item.name,
    price: item.price,
    description: item.description,
    img: item.image_url,
    appliances: item.metadata?.appliances || [],
    powerCapacity: item.metadata?.powerCapacity
  });

  const mapToRequest = (item: any): ServiceRequest => ({
    id: item.id,
    title: item.title,
    type: item.metadata?.type || 'General',
    customer: item.metadata?.customer || 'Unknown',
    address: item.address?.address || '',
    phone: item.address?.phone,
    email: item.address?.email,
    date: new Date(item.created_at).toLocaleDateString(),
    status: item.status,
    priority: item.metadata?.priority || 'Normal',
    description: item.description
  });

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

  const stats: DashboardStats = {
    totalSales: 124500, // Placeholder for now, or sum up 'order' types if they existed
    pendingInstalls: requests.filter(r => r.type === 'Installation' && r.status !== 'Completed').length,
    lowStockCount: inventory.filter(p => p.stockStatus === 'Low Stock' || p.stockStatus === 'Out of Stock').length,
    activeCustomers: allUsers.length
  };

  const addGalleryImage = async (image: Omit<GalleryImage, 'id'>) => {
    const { error } = await supabase.from('greenlife_hub').insert([{
      type: 'gallery',
      title: image.title,
      category: image.category,
      description: image.description,
      image_url: image.url
    }]);

    if (!error) {
      if (activeUser) addNotification(activeUser.id, "Gallery", "Image added to gallery.", "success");
      fetchData();
      return true;
    } else {
      console.error("Error adding gallery image:", error);
      return false;
    }
  };

  const removeGalleryImage = async (id: string) => {
    await supabase.from('greenlife_hub').delete().eq('id', id);
    fetchData();
  };

  const mapToGallery = (item: any): GalleryImage => ({
    id: item.id,
    url: item.image_url,
    title: item.title,
    category: item.category,
    description: item.description
  });

  const mapToUserProfile = (data: any): UserProfile => {
    // Debug log to see incoming data
    console.log("Mapping user data:", data);
    
    return {
      id: data.id || data.user_id,
      firstName: data.fullName ? data.fullName.split(' ')[0] : (data.title ? data.title.split(' ')[0] : 'User'),
      fullName: data.fullName || data.title || 'User',
      email: data.email || data.metadata?.email || '',
      phone: data.phone || data.metadata?.phone,
      address: data.address || data.metadata?.address || '',
      plan: data.plan || 'Standard Plan',
      systemName: data.systemName || (data.metadata?.solar_details ? `${data.metadata.solar_details.size || 'Unknown'} System` : 'No System'),
      installDate: data.installDate || data.metadata?.solar_details?.installDate || '',
      installTime: data.installTime || data.metadata?.solar_details?.installTime || '',
      warrantyStart: data.created_at ? new Date(data.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      warrantyEnd: '2030-01-01',
      systemStatus: data.status || data.systemStatus || 'Operational',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgMyvPvI1r63Wv2p6ujv8_KbGcV-p94fgN0glHmuWokq901pP_Q9wynjwqM4R-nJpGN4XiVkvbFUk-eCFjnJytYN5BBTVUws__2aKEcKT1L-T_nRjsaBUcysTx4qt4_8KcZgHNVmbQ_h9oqxdh_wgtF0YfLurvL9YtnfHQQs7cfcdwyF8ZVZQxj3yxY8amxxUSR2t923D3oY5Ii5lRlYdL6dESPd331HVCOzw83ZmUTP7TJRMTU-7UdXA2gjcjyXlUFe2eFwul-hw',
      referralCode: data.referralCode || `REF-${(data.id || data.user_id || 'NEW').substring(0, 8)}`,
      hasSolar: data.hasSolar !== undefined ? data.hasSolar : !!data.metadata?.solar_details,
      inverterType: data.inverterType || data.metadata?.solar_details?.inverter,
      batteryType: data.batteryType || data.metadata?.solar_details?.battery,
      systemSize: data.systemSize || data.metadata?.solar_details?.size,
      street: data.address || data.metadata?.address,
      city: data.city || '',
      state: data.state || '',
      landmark: data.landmark || ''
    };
  };

  return (
    <AdminContext.Provider value={{
      inventory, requests, packages, stats, activeUser: activeUser as UserProfile, referrals, notifications, gallery,
      // @ts-ignore
      allUsers, installers,
      addProduct, updateProduct, deleteProduct,
      updateRequestStatus, deleteRequest, addRequest,
      addPackage, deletePackage,
      updateUserSystem, registerUser, approveReferral, markNotificationRead, updateUserProfile,
      addGalleryImage, removeGalleryImage,
      // @ts-ignore
      addInstaller, deleteInstaller
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