import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';

const UserLogin: React.FC = () => {
  const { login } = useAuth();
  const { registerUser } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auth Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    hasSolar: false,
    inverterType: '',
    batteryType: '',
    systemSize: '1kW',
    installDate: '',
    installTime: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'signup') {
      if (signUpData.password !== signUpData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Register user in mock DB context
      registerUser({
        fullName: signUpData.fullName,
        firstName: signUpData.fullName.split(' ')[0],
        email: signUpData.email,
        phone: signUpData.phone,
        address: signUpData.address,
        hasSolar: signUpData.hasSolar,
        inverterType: signUpData.hasSolar ? signUpData.inverterType : undefined,
        batteryType: signUpData.hasSolar ? signUpData.batteryType : undefined,
        systemSize: signUpData.hasSolar ? signUpData.systemSize : undefined,
        installDate: signUpData.hasSolar ? signUpData.installDate : undefined,
        installTime: signUpData.hasSolar ? signUpData.installTime : undefined
      });
    }

    // Perform Login
    login();

    // Redirect to where the user came from or dashboard
    const from = location.state?.from || '/dashboard';
    navigate(from);
  };

  useGSAP(() => {
    // Animate Left Panel
    gsap.from(".visual-panel", {
      x: -100,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    // Animate Right Panel Content
    gsap.from(".auth-content", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.2
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="flex min-h-screen bg-background-light dark:bg-background-dark text-forest dark:text-white overflow-x-hidden">
      {/* Visual Panel (Left) */}
      <div className="visual-panel hidden lg:flex lg:w-1/2 relative overflow-hidden bg-background-dark fixed inset-y-0 left-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark/80 via-background-dark/20 to-transparent"></div>
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDywjTY-ACoD5T274KEVbpjZpt1UsEACtIVbJMHCRFz6yvYkav1NDLgGVB_12KHvz-YIZHvQUer2FW__NQSlJOCK6aBQToLrM1_jTtkSfTu3dzqCouMKKe34n-UORwMKpwM_DqoWczq5GQZ_mTkp3jJIYcvRpXWs79XAgX29VkaUNEqffEILxgiOYXS2Ly14ndhnImJeE65WQdbkLJxGkoe6e68SEVHC_hPpQssIcTjsuT8vbXHWHITKEwrs4a-xvJ_6MXOM352ob4')" }}></div>
        <div className="relative z-20 flex flex-col justify-between p-16 w-full h-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-10 text-primary">
              <img src="/logo.png" alt="Greenlife Solar" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-white text-2xl font-bold tracking-tight">Greenlife Solar</h2>
          </Link>
          <div className="max-w-md">
            <h1 className="text-white text-5xl font-bold leading-tight mb-6">Powering a sustainable future, one panel at a time.</h1>
            <p className="text-gray-300 text-lg">Join over 10,000 households and businesses making the switch to clean, renewable energy with Greenlife Solutions.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex -space-x-2">
              <div className="size-8 rounded-full border-2 border-background-dark bg-gray-400"></div>
              <div className="size-8 rounded-full border-2 border-background-dark bg-gray-500"></div>
              <div className="size-8 rounded-full border-2 border-background-dark bg-gray-600"></div>
            </div>
            <span className="text-white text-sm font-medium">Trusted by industry leaders worldwide</span>
          </div>
        </div>
      </div>

      {/* Authentication Panel (Right) */}
      <div className="w-full lg:w-1/2 lg:ml-auto flex flex-col min-h-screen">
        {/* Back Button for Mobile/Desktop */}
        <div className="p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-forest/60 dark:text-white/60 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Home
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 pb-12">
          <div className="auth-content mx-auto w-full max-w-[480px]">
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight">{authMode === 'signin' ? 'Welcome back' : 'Create Account'}</h2>
              <p className="text-primary-dark dark:text-green-300 mt-2">
                {authMode === 'signin' ? 'Enter your details to access your dashboard' : 'Join Greenlife for a brighter future'}
              </p>
            </div>

            {/* Toggle */}
            <div className="mb-8">
              <div className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-200/50 dark:bg-white/5 p-1.5">
                <button
                  onClick={() => setAuthMode('signin')}
                  className={`flex h-full grow items-center justify-center rounded-lg px-2 text-sm font-bold transition-all ${authMode === 'signin' ? 'bg-white dark:bg-white/10 shadow-sm text-forest dark:text-white' : 'text-forest/60 dark:text-white/60'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex h-full grow items-center justify-center rounded-lg px-2 text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-white dark:bg-white/10 shadow-sm text-forest dark:text-white' : 'text-forest/60 dark:text-white/60'}`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Social Login (Google only now) */}
            <div className="mb-8">
              <button className="flex w-full items-center justify-center gap-2 h-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                <img alt="Google logo" className="size-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCANakqiGFM3lZTXJn_yhOLhAK7Ge3nzgSGv20vcWDeMFlt6AL4Qdfyv3Kd4_5cWLknMrwGjsxpoLduxMs3M79YA_PaLxV_51ODcLqyNJN45LWPh6YvP10lPVZ7MYEcA0ZzBNN9LuIs6sfFJ5581_3Mh-dRCOWCJRmsYQMIzqC44U84f9ab6cvigkW38JkNLRMYKu6ET8HLTibnXzEHQC4vuu_-ex2Ggf_LUQ7NMiS2VGWlj-DPoNP1-zLpT6uoxRHNQ6c6A32gN5g" />
                <span className="text-sm font-bold">Continue with Google</span>
              </button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background-light dark:bg-background-dark px-3 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleAuth}>
              {authMode === 'signin' ? (
                // --- LOGIN FORM ---
                <>
                  <div>
                    <label className="block mb-2 text-sm font-bold">Email Address</label>
                    <input required className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 placeholder:text-gray-400 focus:ring-primary focus:border-primary transition-all" placeholder="name@company.com" type="email" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold">Password</label>
                      <a className="text-xs font-bold text-primary hover:underline" href="#">Forgot password?</a>
                    </div>
                    <div className="relative">
                      <input required className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 placeholder:text-gray-400 focus:ring-primary focus:border-primary transition-all" placeholder="••••••••" type="password" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" type="button">
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <input className="size-4 rounded border-gray-300 text-primary focus:ring-primary" id="remember" type="checkbox" />
                    <label className="text-sm text-gray-500 dark:text-gray-400" htmlFor="remember">Remember me for 30 days</label>
                  </div>
                </>
              ) : (
                // --- SIGN UP FORM ---
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Full Name</label>
                    <input required name="fullName" value={signUpData.fullName} onChange={handleInputChange} className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="John Doe" type="text" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Phone</label>
                      <input required name="phone" value={signUpData.phone} onChange={handleInputChange} className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="08012345678" type="tel" />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Email</label>
                      <input required name="email" value={signUpData.email} onChange={handleInputChange} className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="john@example.com" type="email" />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Address</label>
                    <input required name="address" value={signUpData.address} onChange={handleInputChange} className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="123 Solar Street, Lagos" type="text" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Password</label>
                      <input required name="password" value={signUpData.password} onChange={handleInputChange} className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="••••••••" type="password" />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Confirm Password</label>
                      <input required name="confirmPassword" value={signUpData.confirmPassword} onChange={handleInputChange} className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="••••••••" type="password" />
                    </div>
                  </div>

                  {/* Solar System Toggle */}
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="hasSolar" checked={signUpData.hasSolar} onChange={handleInputChange} className="size-5 rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="text-sm font-bold text-forest dark:text-white">I already have a solar system installed</span>
                    </label>

                    {signUpData.hasSolar && (
                      <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Date Installed</label>
                            <input required={signUpData.hasSolar} name="installDate" type="date" value={signUpData.installDate} onChange={handleInputChange} className="form-input block w-full rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-10 px-3 text-sm focus:ring-primary focus:border-primary" />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Time Installed</label>
                            <input name="installTime" type="time" value={signUpData.installTime} onChange={handleInputChange} className="form-input block w-full rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-10 px-3 text-sm focus:ring-primary focus:border-primary" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Inverter Type</label>
                            <input name="inverterType" value={signUpData.inverterType} onChange={handleInputChange} className="form-input block w-full rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-10 px-3 text-sm focus:ring-primary focus:border-primary" placeholder="e.g. Hybrid 5kW" type="text" />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Battery Type</label>
                            <input name="batteryType" value={signUpData.batteryType} onChange={handleInputChange} className="form-input block w-full rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-10 px-3 text-sm focus:ring-primary focus:border-primary" placeholder="e.g. Lithium Ion" type="text" />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-bold uppercase text-gray-500">System Size</label>
                          <select name="systemSize" value={signUpData.systemSize} onChange={handleInputChange} className="form-input block w-full rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-10 px-3 text-sm focus:ring-primary focus:border-primary appearance-none">
                            <option value="1kW">1 kW System</option>
                            <option value="3kW">3 kW System</option>
                            <option value="5kW">5 kW System</option>
                            <option value="10kW">10 kW System</option>
                            <option value="Above 10kW">Above 10 kW</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button className="w-full bg-primary hover:bg-opacity-90 text-forest font-black h-14 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95" type="submit">
                <span>{authMode === 'signin' ? 'Sign In to Dashboard' : 'Create Account'}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/requests" className="inline-flex items-center gap-2 text-sm font-bold text-primary-dark dark:text-green-300 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">help</span>
                <span>Need help with your account?</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;