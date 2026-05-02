import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isSupabaseConfigured, supabase, loadConfig, getIsSupabaseConfigured } from '../config/supabaseClient';
import { useAuth } from './AuthContext';

// Types
export interface ServiceRequest {
  id: string;
  title: string;
  type:
  | 'Package Request'
  | 'Maintenance Request'
  | 'Site Survey Request'
  | 'System Upgrade Request'
  | 'Consultation Request'
  // Back-compat values (older data)
  | 'Maintenance'
  | 'Installation'
  | 'Survey'
  | 'Upgrade';
  customer: string;
  address: string;
  date: string;
  status:
  | 'New'
  | 'In-progress'
  | 'Completed'
  // Back-compat values (older data)
  | 'Pending'
  | 'Approved'
  | 'In Progress'
  | 'Scheduled';
  priority: 'High' | 'Normal' | 'Low';
  description?: string;
  phone?: string;
  email?: string;
  packageId?: string;
  metadata?: Record<string, any>;
  userId?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description?: string;
  images?: string[];
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
  images?: string[];
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
  systems?: any[]; // Array of solar systems
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
  packagesLoading: boolean;
  activeUser: UserProfile;
  referrals: Referral[];
  notifications: Notification[];
  stats: DashboardStats;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: any, product: Partial<Product>) => Promise<boolean | void>;
  deleteProduct: (id: any) => Promise<boolean>;
  updateRequestStatus: (id: string, status: ServiceRequest['status']) => void;
  deleteRequest: (id: string) => Promise<boolean>;
  addRequest: (request: ServiceRequest) => Promise<boolean>;
  addPackage: (pkg: Omit<SolarPackage, 'id'>) => Promise<boolean>;
  deletePackage: (id: string) => Promise<boolean>;
  updateUserSystem: (updates: Partial<UserProfile>) => void;
  registerUser: (details: Partial<UserProfile>) => void;
  approveReferral: (referralId: string, amount: number, daysValid: number) => void;
  markNotificationRead: (id: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  // Gallery
  gallery: GalleryImage[];
  addGalleryImage: (image: Omit<GalleryImage, 'id'>) => Promise<boolean>;
  removeGalleryImage: (id: string) => Promise<boolean>;
  // Installers
  addInstaller: (installer: UserProfile) => Promise<boolean>;
  deleteInstaller: (id: string) => Promise<boolean>;
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

const LEGACY_DEMO_PACKAGE_IDS = new Set([
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
]);

const DEMO_PACKAGES: SolarPackage[] = [
  {
    id: 'PKG-STARTER-001',
    name: 'Starter Home Package',
    price: 650000,
    description: 'Entry-level hybrid setup for light loads and essential home comfort.',
    appliances: ['LED lights', 'TV', 'Fans', 'Decoder', 'Wi‑Fi router'],
    powerCapacity: '2.5kW Inverter + 5kWh Battery',
    img: 'https://placehold.co/900x600?text=Starter+Package'
  },
  {
    id: 'PKG-FAMILY-002',
    name: 'Family Hybrid Package',
    price: 1450000,
    description: 'Balanced daily power for families with extended runtime and stable performance.',
    appliances: ['LED lights', 'TV', 'Fans', 'Fridge', 'Wi‑Fi router'],
    powerCapacity: '5kW Inverter + 10kWh Battery',
    img: 'https://placehold.co/900x600?text=Family+Package'
  },
  {
    id: 'PKG-BUSINESS-003',
    name: 'SME Business Package',
    price: 2600000,
    description: 'Reliable backup + solar for offices and small businesses to reduce downtime.',
    appliances: ['Computers', 'Printers', 'Lighting', 'CCTV', 'Networking'],
    powerCapacity: '7.5kW Inverter + 15kWh Battery',
    img: 'https://placehold.co/900x600?text=Business+Package'
  }
];

const DEMO_REQUESTS: ServiceRequest[] = [
  {
    id: 'REQ-1001',
    title: 'New installation request',
    type: 'Package Request',
    customer: 'Chidinma Okafor',
    address: 'Lekki Phase 1, Lagos',
    date: new Date().toLocaleDateString(),
    status: 'New',
    priority: 'High',
    description: 'Interested in a family package. Needs install next week.',
    phone: '+234 801 234 5678',
    email: 'chidinma@example.com',
    packageId: 'PKG-FAMILY-002'
  },
  {
    id: 'REQ-1002',
    title: 'Maintenance follow-up',
    type: 'Maintenance Request',
    customer: 'Ibrahim Musa',
    address: 'Wuse 2, Abuja',
    date: new Date(Date.now() - 86400000).toLocaleDateString(),
    status: 'In-progress',
    priority: 'Normal',
    description: 'Battery not holding charge as expected. Please inspect.',
    phone: '+234 802 555 0199',
    email: 'ibrahim@example.com'
  },
  {
    id: 'REQ-1003',
    title: 'Site survey booking',
    type: 'Site Survey Request',
    customer: 'Blessing Nwosu',
    address: 'GRA, Port Harcourt',
    date: new Date(Date.now() - 4 * 86400000).toLocaleDateString(),
    status: 'Completed',
    priority: 'Low',
    description: 'Survey completed. Awaiting quote review.',
    phone: '+234 803 777 8800',
    email: 'blessing@example.com'
  },
  {
    id: 'REQ-1004',
    title: 'System upgrade inquiry',
    type: 'System Upgrade Request',
    customer: 'Tunde Adeyemi',
    address: 'Ibadan, Oyo',
    date: new Date(Date.now() - 2 * 86400000).toLocaleDateString(),
    status: 'New',
    priority: 'Normal',
    description: 'Upgrade from 3kW to 5kW and add more battery capacity.',
    phone: '+234 809 121 3344',
    email: 'tunde@example.com',
    packageId: 'PKG-FAMILY-002'
  },
  {
    id: 'REQ-1005',
    title: 'Consultation request',
    type: 'Consultation Request',
    customer: 'Adaeze Eze',
    address: 'Enugu North, Enugu',
    date: new Date(Date.now() - 6 * 86400000).toLocaleDateString(),
    status: 'Completed',
    priority: 'Low',
    description: 'Wants guidance on solar sizing and payback period.',
    phone: '+234 701 222 0909',
    email: 'adaeze@example.com'
  }
];

const DEMO_GALLERY: GalleryImage[] = [
  {
    id: 'GAL-001',
    url: 'https://placehold.co/900x900?text=Residential+Install',
    title: 'Lekki Residential Install',
    category: 'Residential',
    description: '5kW hybrid system with rooftop panels.'
  },
  {
    id: 'GAL-002',
    url: 'https://placehold.co/900x900?text=Commercial+Install',
    title: 'Office Backup Setup',
    category: 'Commercial',
    description: '7.5kW inverter + battery bank for SME office.'
  },
  {
    id: 'GAL-003',
    url: 'https://placehold.co/900x900?text=Industrial+Install',
    title: 'Industrial Power Support',
    category: 'Industrial',
    description: 'High-demand installation with phased rollout.'
  }
];

const normalizePackageAppliances = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  const [inventory, setInventory] = useState<Product[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [packages, setPackages] = useState<SolarPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [enableRealtime, setEnableRealtime] = useState(false);

  // Shared User State (Demo)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  const stripLegacyDemoPackages = (items: SolarPackage[]) =>
    items.filter((pkg) => !LEGACY_DEMO_PACKAGE_IDS.has(String(pkg.id)));

  const loadDemoData = () => {
    setUsingDemoData(true);
    setEnableRealtime(false);
    setActiveUser(DEMO_USER);
    setPackages(DEMO_PACKAGES);
    setRequests(DEMO_REQUESTS);
    setGallery(DEMO_GALLERY);
    setAllUsers([DEMO_USER]);
  };

  // --- Real-time Data Fetching ---
  const fetchData = async () => {
    setPackagesLoading(true);

    try {
      // Ensure runtime config is loaded before checking credentials
      await loadConfig();

      if (!getIsSupabaseConfigured()) {
        loadDemoData();
        return;
      }
      const { data, error } = await supabase.from('greenlife_hub').select('*');
      if (error) {
        // Ignore AbortError
        if (error.message && (error.message.includes('AbortError') || error.message.includes('signal is aborted'))) {
          return;
        }
        // If the table doesn't exist yet, fall back to demo mode.
        const msg = (error as any)?.message || '';
        const code = (error as any)?.code || '';
        if (code === 'PGRST205' || msg.includes("Could not find the table") || msg.includes('404')) {
          loadDemoData();
          return;
        }
        // For any other error (RLS, network, permission), also fall back to demo data
        // so the homepage always shows content rather than empty sections.
        console.warn("Supabase fetch error, falling back to demo data:", error);
        loadDemoData();
        return;
      }

      if (data) {
        setUsingDemoData(false);
        setEnableRealtime(true);
        const mappedInventory = data.filter((i: any) => i.type === 'product').map(mapToProduct);
        const mappedPackages = stripLegacyDemoPackages(
          data.filter((i: any) => i.type === 'package').map(mapToPackage)
        );
        const mappedRequests = data.filter((i: any) => i.type === 'request').map(mapToRequest);
        const mappedGallery = data.filter((i: any) => i.type === 'gallery').map(mapToGallery);
        const mappedUsers = data.filter((i: any) => i.type === 'user_profile').map(mapToUserProfile);
        const mappedInstallers = data.filter((i: any) => i.type === 'installer').map(mapToUserProfile);

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
      // If anything unexpected happens (network, permissions, missing tables), stay usable.
      loadDemoData();
      console.error("Unexpected fetch error:", err);
    } finally {
      setPackagesLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch from both in parallel for speed
      const [profileRes, hubRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('greenlife_hub').select('*').eq('type', 'user_profile').eq('user_id', userId).maybeSingle()
      ]);

      if (profileRes.data) {
        // If profile exists but is missing key metadata (e.g. systems), try hub as a fallback source of truth.
        const profileHasSystems = Array.isArray((profileRes.data as any)?.metadata?.systems);
        if (!profileHasSystems && hubRes.data) {
          setActiveUser(mapToUserProfile(hubRes.data));
          return;
        }
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
      const isAbort = err.name === 'AbortError' || err.message?.includes('AbortError') || err.message?.includes('signal is aborted');
      if (!isAbort) {
        console.error("Profile fetch error:", err);
      }
    }
  };

  useEffect(() => {
    // Fetch public data immediately regardless of auth status
    fetchData();
  }, [session?.access_token]); // re-fetch if session changes, but also run on mount

  useEffect(() => {
    let mounted = true;

    if (!getIsSupabaseConfigured()) return;

    // Fetch Profile (session is guaranteed to have access_token here)
    if (mounted && session?.user) {
      fetchUserProfile(session.user.id);
    }

    if (!enableRealtime) return;
    if (usingDemoData) return;

    // Subscribe to DB changes (only when backend is confirmed)
    const channel = supabase
      .channel('public:greenlife_hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'greenlife_hub' }, () => {
        if (mounted) fetchData();
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, usingDemoData, session?.access_token]);

  // --- Actions ---

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const { error } = await supabase.from('greenlife_hub').insert([{
      type: 'product',
      user_id: activeUser?.id,
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
        reviews: product.reviews || 0,
        images: product.images && product.images.length ? product.images : (product.img ? [product.img] : [])
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
    const { error } = await supabase.from('greenlife_hub').update({
      user_id: activeUser?.id,
      name: updates.name,
      price: updates.price,
      category: updates.category,
      image_url: updates.img,
      description: updates.spec,
      status: updates.stockStatus || updates.badge || 'In Stock',
      metadata: {
        brand: updates.brand,
        series: updates.series,
        efficiency: updates.eff,
        reviews: updates.reviews || 0,
        images: updates.images && updates.images.length ? updates.images : (updates.img ? [updates.img] : [])
      }
    }).eq('id', id);

    if (!error) {
      if (activeUser) addNotification(activeUser.id, "System", `Product updated.`, "success");
      fetchData(); // Refresh local state
      return true;
    } else {
      console.error("Error updating product:", error);
      return false;
    }
  };

  const deleteProduct = async (id: any) => {
    // In a real scenario, use UUID. Here we need to verify if id is UUID or string
    const { error } = await supabase.from('greenlife_hub').delete().eq('id', id);
    if (!error) {
      if (activeUser) addNotification(activeUser.id, "System", "Product removed.", "info");
      fetchData();
      return true;
    }
    console.error("Error deleting product:", error);
    return false;
  };

  const addRequest = async (req: ServiceRequest) => {
    if (!getIsSupabaseConfigured()) {
      setRequests((prev: ServiceRequest[]) => [req, ...prev]);
      if (activeUser) {
        addNotification(activeUser.id, "Request Received", `We received your ${req.type} request.`, "info");
      }
      return true;
    }

    const requestUserId = session?.user?.id || activeUser?.id;
    if (!requestUserId) {
      console.warn("Cannot add request without an authenticated user.");
      return false;
    }

    const { error } = await supabase.from('greenlife_hub').insert([{
      type: 'request',
      title: req.title,
      status: req.status,
      description: req.description,
      user_id: requestUserId,
      address: { address: req.address, phone: req.phone, email: req.email },
      metadata: {
        type: req.type,
        priority: req.priority,
        customer: req.customer,
        packageId: req.packageId,
        ...(req.metadata || {})
      }
    }]);

    if (error) {
      console.error("Error adding request:", error);
      return false;
    }

    // Optimistically update local state immediately
    setRequests((prev: ServiceRequest[]) => [req, ...prev]);

    if (activeUser) {
      addNotification(activeUser.id, "Request Received", `We received your ${req.type} request.`, "info");
      setTimeout(() => {
        addNotification(activeUser.id, "Support", "We have received your request and will contact you shortly.", "success");
      }, 3000);
    }

    // Send email notifications (non-blocking)
    const sendEmailNotifications = async () => {
      try {
        const authToken = (await supabase.auth.getSession()).data.session?.access_token;
        if (!authToken) {
          console.warn('No auth token available for email sending');
          return;
        }

        // Sanitize tags to only contain ASCII letters, numbers, underscores, or dashes
        const sanitizeTag = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 128);

        // Get correct API URL
        const apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://127.0.0.1:3001'
          : '';
        const emailApiUrl = `${apiBaseUrl}/api/send-email`;

        const customerEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Request Confirmation</h2>
            <p>Hi ${req.customer},</p>
            <p>Thank you for submitting your <strong>${req.type}</strong> request. We have received it and will review your details shortly.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Request Type:</strong> ${req.type}</p>
              <p><strong>Description:</strong> ${req.description}</p>
              <p><strong>Status:</strong> ${req.status}</p>
              <p><strong>Submitted:</strong> ${req.date}</p>
            </div>
            <p>We'll be in touch with you soon!</p>
            <p>Best regards,<br>Greenlife Solar Team</p>
          </div>
        `;

        // Send customer confirmation email
        console.log('📧 Sending customer confirmation email to:', req.email);
        const customerResponse = await fetch(emailApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            to: req.email,
            subject: `${req.type} - Request Confirmation`,
            html: customerEmailHtml,
            tags: {
              type: sanitizeTag(req.type),
              status: 'confirmation'
            }
          }),
        });

        const customerResult = await customerResponse.json();
        if (!customerResponse.ok) {
          console.error('❌ Customer email failed:', customerResponse.status, customerResult);
        } else {
          console.log('✅ Customer email sent successfully:', customerResult.id);
        }

        // Send admin notification email
        const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">New ${req.type} Request</h2>
            <p><strong>Customer:</strong> ${req.customer}</p>
            <p><strong>Email:</strong> ${req.email}</p>
            <p><strong>Phone:</strong> ${req.phone}</p>
            <p><strong>Address:</strong> ${req.address}</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Type:</strong> ${req.type}</p>
              <p><strong>Title:</strong> ${req.title}</p>
              <p><strong>Description:</strong> ${req.description}</p>
              <p><strong>Priority:</strong> ${req.priority}</p>
              <p><strong>Status:</strong> ${req.status}</p>
              <p><strong>Submitted:</strong> ${req.date}</p>
            </div>
            <p>Log in to the admin panel to review and respond.</p>
          </div>
        `;

        console.log('📧 Sending admin notification email');
        const adminResponse = await fetch(emailApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            useAdminEmail: true,
            subject: `New ${req.type} Request from ${req.customer}`,
            html: adminEmailHtml,
            tags: {
              type: sanitizeTag(req.type),
              customer: sanitizeTag(req.customer),
              status: 'admin_notification'
            }
          }),
        });

        const adminResult = await adminResponse.json();
        if (!adminResponse.ok) {
          console.error('❌ Admin email failed:', adminResponse.status, adminResult);
        } else {
          console.log('✅ Admin email sent successfully:', adminResult.id);
        }
      } catch (err) {
        console.error('❌ Error sending email notifications:', err);
      }
    };

    // Send emails in background without blocking
    sendEmailNotifications();

    // Refresh data asynchronously without blocking
    // Add a 10-second timeout to prevent hanging
    const fetchTimeout = Promise.race([
      fetchData(),
      new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), 10000))
    ]).catch(err => {
      console.warn('Failed to refresh data after request:', err);
    });

    return true;
  };

  const updateRequestStatus = async (id: string, status: ServiceRequest['status']) => {
    // Optimistic local update for instant UI feedback
    setRequests((prev: ServiceRequest[]) =>
      prev.map((r: ServiceRequest) => (r.id === id ? { ...r, status } : r))
    );
    const { error } = await supabase.from('greenlife_hub').update({ status }).eq('id', id);
    if (error) {
      console.error('Error updating request status:', error);
    }
    // Refresh from DB to stay in sync
    fetchData();
  };

  const deleteRequest = async (id: string) => {
    // Optimistic local removal for instant UI feedback
    setRequests((prev: ServiceRequest[]) => prev.filter((r: ServiceRequest) => r.id !== id));
    const { error } = await supabase.from('greenlife_hub').delete().eq('id', id);
    if (error) {
      console.error('Error deleting request:', error);
      // Revert by re-fetching from DB
      fetchData();
      return false;
    }
    // Refresh to stay in sync
    fetchData();
    return true;
  };

  const addPackage = async (pkg: Omit<SolarPackage, 'id'>) => {
    const { error } = await supabase.from('greenlife_hub').insert([{
      type: 'package',
      user_id: activeUser?.id,
      name: pkg.name,
      price: pkg.price,
      description: pkg.description,
      image_url: pkg.img,
      metadata: {
        appliances: pkg.appliances,
        powerCapacity: pkg.powerCapacity,
        images: pkg.images && pkg.images.length ? pkg.images : (pkg.img ? [pkg.img] : [])
      }
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
    const { error } = await supabase.from('greenlife_hub').delete().eq('id', id);
    if (!error) {
      fetchData();
      return true;
    }
    console.error("Error deleting package", error);
    return false;
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
    const { error } = await supabase.from('greenlife_hub').delete().eq('id', id);
    if (!error) {
      fetchData();
      return true;
    }
    return false;
  };

  // --- User & Local Logic (Keep local for demo user details for now) ---
  const updateUserSystem = (updates: Partial<UserProfile>) => {
    if (activeUser) {
      setActiveUser((prev: UserProfile | null) => (prev ? { ...prev, ...updates } : null));
      addNotification(activeUser.id, "System Update", "Your solar system details have been updated by admin.", "info");
    }
  };

  const registerUser = (details: Partial<UserProfile>) => {
    // Local only for demo
    setActiveUser((prev: UserProfile | null) => (prev ? { ...prev, ...details } : null));
    addNotification("USR-NEW", "Welcome!", "Welcome to Greenlife Solar.", "success");
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!activeUser) return;
    try {
      // Merge metadata to avoid overwriting fields stored server-side by other flows.
      const mergedMetadata = updates.metadata
        ? { ...(activeUser.metadata || {}), ...(updates.metadata || {}) }
        : (activeUser.metadata || undefined);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName || activeUser.fullName,
          email: updates.email || activeUser.email,
          phone: updates.phone || activeUser.phone,
          address: updates.address || activeUser.address,
          metadata: mergedMetadata,
        })
        .eq('id', activeUser.id);

      if (error) {
        console.error('profiles update failed', error);
        // Fallback to greenlife_hub
        const { error: hubErr } = await supabase
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

        if (hubErr) {
          console.error('greenlife_hub update failed', hubErr);
          throw hubErr;
        }

        throw error;
      } else {
        // Keep hub in sync when profiles update succeeds (best-effort).
        const { error: hubErr } = await supabase
          .from('greenlife_hub')
          .update({
            title: updates.fullName || activeUser.fullName,
            metadata: {
              ...(activeUser.metadata || {}),
              ...(mergedMetadata || {}),
              email: updates.email || activeUser.email,
              phone: updates.phone || activeUser.phone,
              address: updates.address || activeUser.address,
            }
          })
          .eq('type', 'user_profile')
          .eq('user_id', activeUser.id);

        if (hubErr) {
          console.warn('greenlife_hub sync failed (non-fatal)', hubErr);
        }
      }

      setActiveUser((prev: UserProfile | null) => (prev ? { ...prev, ...updates, metadata: mergedMetadata } : null));
      addNotification(activeUser.id, "Profile Updated", "Profile updated successfully.", "success");
    } catch (err) {
      console.error("Error updating profile:", err);
      addNotification(activeUser.id, "Update Failed", "Could not save profile changes.", "alert");
      throw err;
    }
  };

  const approveReferral = (referralId: string, amount: number, daysValid: number) => {
    if (activeUser) {
      addNotification(activeUser.id, "Referral Approved", "Referral approved (Demo).", "success");
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev: Notification[]) => prev.map((n: Notification) => (n.id === id ? { ...n, read: true } : n)));
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
    reviews: item.metadata?.reviews || 0,
    images: Array.isArray(item.metadata?.images) ? item.metadata.images : (item.image_url ? [item.image_url] : [])
  });

  const mapToPackage = (item: any): SolarPackage => ({
    id: item.id,
    name: item.name || item.title || 'Solar Package',
    price: typeof item.price === 'number' ? item.price : Number(item.price || 0),
    description: item.description || item.metadata?.description || '',
    img: item.image_url || item.img,
    appliances: normalizePackageAppliances(item.metadata?.appliances ?? item.appliances),
    powerCapacity: item.metadata?.powerCapacity || item.power_capacity || item.metadata?.capacity,
    images: Array.isArray(item.metadata?.images) ? item.metadata.images : ((item.image_url || item.img) ? [item.image_url || item.img] : [])
  });

  const mapToRequest = (item: any): ServiceRequest => ({
    id: item.id,
    title: item.title,
    type: item.metadata?.type || 'Consultation Request',
    customer: item.metadata?.customer || 'Unknown',
    address: item.address?.address || '',
    phone: item.address?.phone,
    email: item.address?.email,
    date: new Date(item.created_at).toLocaleDateString(),
    status: item.status,
    priority: item.metadata?.priority || 'Normal',
    description: item.description,
    packageId: item.metadata?.packageId,
    metadata: item.metadata || {},
    userId: item.user_id
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
    setNotifications((prev: Notification[]) => [newNotif, ...prev]);
  };

  const stats: DashboardStats = {
    totalSales: 124500, // Placeholder for now, or sum up 'order' types if they existed
    pendingInstalls: requests.filter((r: ServiceRequest) => r.type === 'Installation' && r.status !== 'Completed').length,
    lowStockCount: inventory.filter((p: Product) => p.stockStatus === 'Low Stock' || p.stockStatus === 'Out of Stock').length,
    activeCustomers: allUsers.length
  };

  const addGalleryImage = async (image: Omit<GalleryImage, 'id'>) => {
    const { error } = await supabase.from('greenlife_hub').insert([{
      type: 'gallery',
      user_id: activeUser?.id,
      title: image.title,
      category: image.category,
      description: image.description,
      image_url: image.url,
      metadata: {
        images: image.images && image.images.length ? image.images : (image.url ? [image.url] : [])
      }
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
    const { error } = await supabase.from('greenlife_hub').delete().eq('id', id);
    if (!error) {
      fetchData();
      return true;
    }
    console.error("Error deleting gallery image", error);
    return false;
  };

  const mapToGallery = (item: any): GalleryImage => ({
    id: item.id,
    url: item.image_url,
    title: item.title,
    category: item.category,
    description: item.description,
    images: Array.isArray(item.metadata?.images) ? item.metadata.images : (item.image_url ? [item.image_url] : [])
  });

  const mapToUserProfile = (data: any): UserProfile => {
    // Support both snake_case (from DB) and camelCase (legacy) column names
    const fullName = data.full_name || data.fullName || data.title || 'User';
    return {
      id: data.id || data.user_id,
      firstName: fullName.split(' ')[0],
      fullName,
      email: data.email || data.metadata?.email || '',
      phone: data.phone || data.metadata?.phone || '',
      address: data.address || data.metadata?.address || '',
      plan: data.metadata?.plan || data.plan || 'Standard Plan',
      systemName: data.metadata?.systemName || data.systemName || (data.metadata?.solar_details ? `${data.metadata.solar_details.size || 'Unknown'} System` : 'No System'),
      installDate: data.metadata?.solar_details?.installDate || data.installDate || '',
      installTime: data.metadata?.solar_details?.installTime || data.installTime || '',
      warrantyStart: data.created_at ? new Date(data.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      warrantyEnd: '2030-01-01',
      systemStatus: data.status || data.systemStatus || 'Operational',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgMyvPvI1r63Wv2p6ujv8_KbGcV-p94fgN0glHmuWokq901pP_Q9wynjwqM4R-nJpGN4XiVkvbFUk-eCFjnJytYN5BBTVUws__2aKEcKT1L-T_nRjsaBUcysTx4qt4_8KcZgHNVmbQ_h9oqxdh_wgtF0YfLurvL9YtnfHQQs7cfcdwyF8ZVZQxj3yxY8amxxUSR2t923D3oY5Ii5lRlYdL6dESPd331HVCOzw83ZmUTP7TJRMTU-7UdXA2gjcjyXlUFe2eFwul-hw',
      referralCode: data.referralCode || `REF-${(data.id || data.user_id || 'NEW').substring(0, 8)}`,
      hasSolar: data.hasSolar !== undefined ? data.hasSolar : !!data.metadata?.solar_details,
      inverterType: data.inverterType || data.metadata?.solar_details?.inverter,
      batteryType: data.batteryType || data.metadata?.solar_details?.battery,
      systemSize: data.systemSize || data.metadata?.solar_details?.size,
      street: data.address || data.metadata?.address || '',
      city: data.city || '',
      state: data.state || '',
      landmark: data.landmark || '',
      metadata: data.metadata,
      systems: data.metadata?.systems || []
    };
  };



  return (
    <AdminContext.Provider value={{
      inventory, requests, packages, packagesLoading, stats, activeUser: activeUser as UserProfile, referrals, notifications, gallery,
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
