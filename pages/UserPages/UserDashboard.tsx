import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Toast } from '../../components/SharedComponents';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import DashboardOverview from '../../components/dashboard/DashboardOverview';
import MySystems from '../../components/dashboard/MySystems';
import OrderHistory from '../../components/dashboard/OrderHistory';
import RequestsList from '../../components/dashboard/RequestsList';
import DashboardShop from '../../components/dashboard/DashboardShop';
import UpgradeRequest from '../../components/dashboard/UpgradeRequest';
import ProfileSettings from '../../components/dashboard/ProfileSettings';
import DashboardGallery from '../../components/dashboard/DashboardGallery';
import DashboardPackages from '../../components/dashboard/DashboardPackages';

// --- Types (Local) ---
type DashboardView = 'overview' | 'systems' | 'orders' | 'profile' | 'requests' | 'shop' | 'upgrade' | 'service' | 'gallery' | 'packages';

const SidebarLink: React.FC<{
  active: boolean,
  onClick: () => void,
  icon: string,
  label: string
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${active ? 'bg-primary text-forest font-semibold shadow-sm' : 'hover:bg-primary/10 text-[#4c9a66] dark:text-gray-300 font-medium'}`}
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span>{label}</span>
  </button>
);

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { activeUser, notifications, markNotificationRead } = useAdmin();

  // --- State ---
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Theme State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));


  // --- Effects ---
  // Handle Query Params for Deep Linking
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view');
    if (viewParam && ['overview', 'systems', 'orders', 'profile', 'requests', 'shop', 'upgrade', 'gallery', 'packages'].includes(viewParam)) {
      setCurrentView(viewParam as DashboardView);
    }
  }, [location.search]);

  // Update URL when view changes
  const handleViewChange = (view: DashboardView) => {
    setCurrentView(view);
    navigate(`/dashboard?view=${view}`, { replace: true });
  };

  // --- Close Dropdown on click outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Calculations ---
  const unreadCount = notifications.filter(n => !n.read).length;

  // --- Actions ---
  const handleBookService = () => {
    setIsServiceModalOpen(true);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  const handleServiceOption = (option: number) => {
    setIsServiceModalOpen(false);
    if (option === 1) {
      navigate('/service-request?type=maintenance');
    } else if (option === 2) {
      navigate('/consultation');
    } else if (option === 3) {
      navigate('/service-request?type=survey');
    }
  };

  // Custom Handler for Upgrade from Modal
  const handleUpgradeSelect = () => {
    setIsServiceModalOpen(false);
    handleViewChange('upgrade');
  };

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
      setToastMessage("Switched to Light Mode");
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
      setToastMessage("Switched to Dark Mode");
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d1b12] dark:text-white transition-colors duration-200 font-display">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* Service Selection Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsServiceModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#152a17] rounded-3xl p-8 max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-forest dark:text-white mb-2">Select a Service</h2>
              <p className="text-[#4c9a66] dark:text-gray-300">Choose the type of assistance you need today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button onClick={() => handleServiceOption(1)} className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#e7f3eb] dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-1">
                <div className="size-14 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">build_circle</span>
                </div>
                <h3 className="text-lg font-bold mb-1">Maintenance</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Repairs & checks</p>
              </button>

              <button onClick={() => handleServiceOption(3)} className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#e7f3eb] dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-1">
                <div className="size-14 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">home_work</span>
                </div>
                <h3 className="text-lg font-bold mb-1">Audit / Survey</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Load assessment</p>
              </button>

              <button onClick={handleUpgradeSelect} className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#e7f3eb] dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-1">
                <div className="size-14 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">upgrade</span>
                </div>
                <h3 className="text-lg font-bold mb-1">System Upgrade</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add batteries/panels</p>
              </button>

              <button onClick={() => handleServiceOption(2)} className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#e7f3eb] dark:border-white/10 hover:border-primary hover:bg-primary/5 transition-all hover:-translate-y-1">
                <div className="size-14 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">support_agent</span>
                </div>
                <h3 className="text-lg font-bold mb-1">Consultation</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Talk to expert</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar Content */}
        <div className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-[260px] bg-white dark:bg-[#1a2e21] shadow-2xl transition-transform duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-10 px-2 justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-[#0d1b12] dark:text-white text-lg font-bold leading-tight">Greenlife Solar</h1>
                  <p className="text-[#4c9a66] text-xs font-medium">Customer App</p>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-2 grow overflow-y-auto">
              <SidebarLink
                active={currentView === 'overview'}
                onClick={() => { handleViewChange('overview'); setIsMobileMenuOpen(false); }}
                icon="dashboard"
                label="Dashboard"
              />
              <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-4"></div>
              <p className="px-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Manage</p>
              <SidebarLink
                active={currentView === 'systems'}
                onClick={() => { handleViewChange('systems'); setIsMobileMenuOpen(false); }}
                icon="solar_power"
                label="My Systems"
              />
              <SidebarLink
                active={currentView === 'upgrade'}
                onClick={() => { handleViewChange('upgrade'); setIsMobileMenuOpen(false); }}
                icon="upgrade"
                label="Request Upgrade"
              />
              <SidebarLink
                active={currentView === 'requests'}
                onClick={() => { handleViewChange('requests'); setIsMobileMenuOpen(false); }}
                icon="assignment"
                label="Service Requests"
              />

              <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-4"></div>
              <p className="px-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Store</p>
              <SidebarLink
                active={currentView === 'shop'}
                onClick={() => { handleViewChange('shop'); setIsMobileMenuOpen(false); }}
                icon="storefront"
                label="Shop Products"
              />
              <SidebarLink
                active={currentView === 'packages'}
                onClick={() => { handleViewChange('packages'); setIsMobileMenuOpen(false); }}
                icon="package_2"
                label="Solar Packages"
              />
              <SidebarLink
                active={currentView === 'gallery'}
                onClick={() => { handleViewChange('gallery'); setIsMobileMenuOpen(false); }}
                icon="photo_library"
                label="Project Gallery"
              />
              <SidebarLink
                active={currentView === 'orders'}
                onClick={() => { handleViewChange('orders'); setIsMobileMenuOpen(false); }}
                icon="receipt_long"
                label="Order History"
              />

              <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-4"></div>
              <p className="px-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Settings</p>
              <SidebarLink
                active={currentView === 'profile'}
                onClick={() => { handleViewChange('profile'); setIsMobileMenuOpen(false); }}
                icon="manage_accounts"
                label="Profile & Address"
              />
            </nav>

            <div className="mt-auto pt-6 border-t border-[#e7f3eb] dark:border-white/10">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-3 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mb-6">
                <span className="material-symbols-outlined text-lg">logout</span> Log Out
              </button>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-cover border border-gray-200 dark:border-white/10" style={{ backgroundImage: `url('${activeUser.avatar}')` }}></div>
                <div>
                  <p className="text-sm font-bold dark:text-white line-clamp-1">{activeUser.fullName}</p>
                  <p className="text-xs text-[#4c9a66]">{activeUser.plan}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-72 bg-white dark:bg-[#1a2e21] border-r border-[#e7f3eb] dark:border-white/10 flex flex-col h-screen sticky top-0 hidden lg:flex shrink-0">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-10 px-2">
              <div className="size-10 flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-[#0d1b12] dark:text-white text-lg font-bold leading-tight">Greenlife Solar</h1>
                <p className="text-[#4c9a66] text-xs font-medium">Customer App</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2 grow">
              <SidebarLink
                active={currentView === 'overview'}
                onClick={() => handleViewChange('overview')}
                icon="dashboard"
                label="Dashboard"
              />
              <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-4"></div>
              <p className="px-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Manage</p>
              <SidebarLink
                active={currentView === 'systems'}
                onClick={() => handleViewChange('systems')}
                icon="solar_power"
                label="My Systems"
              />
              <SidebarLink
                active={currentView === 'upgrade'}
                onClick={() => handleViewChange('upgrade')}
                icon="upgrade"
                label="Request Upgrade"
              />
              <SidebarLink
                active={currentView === 'requests'}
                onClick={() => handleViewChange('requests')}
                icon="assignment"
                label="Service Requests"
              />

              <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-4"></div>
              <p className="px-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Store</p>
              <SidebarLink
                active={currentView === 'shop'}
                onClick={() => handleViewChange('shop')}
                icon="storefront"
                label="Shop Products"
              />
              <SidebarLink
                active={currentView === 'packages'}
                onClick={() => handleViewChange('packages')}
                icon="package_2"
                label="Solar Packages"
              />
              <SidebarLink
                active={currentView === 'gallery'}
                onClick={() => handleViewChange('gallery')}
                icon="photo_library"
                label="Project Gallery"
              />
              <SidebarLink
                active={currentView === 'orders'}
                onClick={() => handleViewChange('orders')}
                icon="receipt_long"
                label="Order History"
              />

              <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-4"></div>
              <p className="px-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Settings</p>
              <SidebarLink
                active={currentView === 'profile'}
                onClick={() => handleViewChange('profile')}
                icon="manage_accounts"
                label="Profile & Address"
              />
            </nav>

            <div className="mt-auto pt-6 border-t border-[#e7f3eb] dark:border-white/10">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-3 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mb-6">
                <span className="material-symbols-outlined text-lg">logout</span> Log Out
              </button>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-cover border border-gray-200 dark:border-white/10" style={{ backgroundImage: `url('${activeUser.avatar}')` }}></div>
                <div>
                  <p className="text-sm font-bold dark:text-white line-clamp-1">{activeUser.fullName}</p>
                  <p className="text-xs text-[#4c9a66]">{activeUser.plan}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
          {/* Header */}
          <header className="h-20 bg-white dark:bg-[#1a2e21] border-b border-[#e7f3eb] dark:border-white/10 px-8 flex items-center justify-between sticky top-0 z-30">
            <h2 className="text-xl font-bold dark:text-white capitalize hidden md:block">
              {currentView.replace('-', ' ')}
            </h2>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-[#0d1b12] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="flex items-center gap-4 ml-auto">
              {/* Search Bar - only visible on shop */}
              {currentView === 'shop' && (
                <div className="relative hidden md:block w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                  <input
                    type="text"
                    placeholder="Quick Search..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg text-sm border-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-[#0d1b12] dark:text-white relative hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2e21]"></span>
                  )}
                </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a2e21] rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 animate-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                      <h3 className="font-bold text-sm dark:text-white">Notifications</h3>
                      {unreadCount > 0 && <span className="bg-primary text-forest text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-4 border-b border-gray-100 dark:border-white/5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className={`text-sm font-bold ${!n.read ? 'text-forest dark:text-white' : 'text-gray-500'}`}>{n.title}</p>
                              <span className="text-[10px] text-gray-400">{n.date}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-400 text-xs">No notifications yet.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-[#0d1b12] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
            {currentView === 'overview' && (
              <DashboardOverview
                handleBookService={handleBookService}
                activeUser={activeUser}
                notifications={notifications}
              />
            )}
            {/* New Views */}
            {currentView === 'shop' && <DashboardShop />}
            {currentView === 'packages' && <DashboardPackages />}
            {currentView === 'gallery' && <DashboardGallery />}
            {currentView === 'upgrade' && <UpgradeRequest onSuccess={() => handleViewChange('requests')} />}
            {currentView === 'profile' && <ProfileSettings />}

            {/* Existing Views */}
            {currentView === 'systems' && <MySystems />}
            {currentView === 'orders' && <OrderHistory />}
            {currentView === 'requests' && <RequestsList />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;