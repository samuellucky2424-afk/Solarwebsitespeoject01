
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { getSupabase, uploadPrivateFile } from '../../config/supabaseClient';
import { clearAuthPreference, persistAuthPreference, useAuth } from '../../context/AuthContext';
import { applySecureLoginSession, securePasswordLogin, type SecureLoginError } from '../../src/lib/secureLogin';
import TurnstileWidget from '../../src/lib/TurnstileWidget';

const UserLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auth Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const resetCaptchaChallenge = () => {
    setCaptchaToken('');
    setCaptchaError(null);
    setCaptchaResetSignal(signal => signal + 1);
  };

  const handleAuthModeChange = (mode: 'signin' | 'signup') => {
    if (mode !== authMode) {
      setAuthMode(mode);
      resetCaptchaChallenge();
    }
  };

  // Automatically redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User authenticated, redirecting to dashboard...');
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    roleRequested: 'user',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    businessName: '',
    businessAddress: '',
    password: '',
    confirmPassword: '',
    hasSolar: false,
    inverterType: '',
    batteryType: '',
    systemSize: '1kW',
    installDate: '',
    installTime: ''
  });

  const [verificationFiles, setVerificationFiles] = useState<{
    cacDocument: File | null;
    idDocument: File | null;
    storePhoto: File | null;
    storeVideo: File | null;
    workPhoto: File | null;
    workVideo: File | null;
  }>({
    cacDocument: null,
    idDocument: null,
    storePhoto: null,
    storeVideo: null,
    workPhoto: null,
    workVideo: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleVerificationFileChange = (field: keyof typeof verificationFiles, file: File | null) => {
    setVerificationFiles(prev => ({ ...prev, [field]: file }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (signUpData.password !== signUpData.confirmPassword) {
          alert("Passwords do not match");
          setLoading(false);
          return;
        }

        const isDealerRequest = signUpData.roleRequested === 'installer' || signUpData.roleRequested === 'retailer';
        const isInstallerRequest = signUpData.roleRequested === 'installer';
        const isRetailerRequest = signUpData.roleRequested === 'retailer';
        if (isDealerRequest) {
          if (!signUpData.businessName.trim() || !signUpData.businessAddress.trim()) {
            alert("Please enter your business name and business address.");
            setLoading(false);
            return;
          }

          if (isInstallerRequest && (!verificationFiles.cacDocument || !verificationFiles.workPhoto || !verificationFiles.workVideo)) {
            alert("Please upload your CAC document, working photo, and working video.");
            setLoading(false);
            return;
          }

          if (isRetailerRequest && (!verificationFiles.idDocument || !verificationFiles.storePhoto || !verificationFiles.storeVideo)) {
            alert("Please upload your ID document, store photo, and store video.");
            setLoading(false);
            return;
          }
        }

        if (!captchaToken) {
          alert("Please complete the security check.");
          setLoading(false);
          return;
        }

        // 1. Sign Up with Supabase Auth
        const { data: authData, error: authError } = await getSupabase().auth.signUp({
          email: signUpData.email,
          password: signUpData.password,
          options: {
            captchaToken,
            data: {
              full_name: signUpData.fullName,
              phone: signUpData.phone,
              address: signUpData.address,
              role_requested: signUpData.roleRequested
            }
          }
        });

        if (authError) throw authError;

        if (authData.session) {
          persistAuthPreference(false);
        }

        if (authData.user) {
          // The trigger auto-creates a minimal row in 'profiles' (id, email, role, created_at).
          // Now update that row with additional signup details using snake_case column names.
          const { error: profileError } = await getSupabase().from('profiles').upsert({
            id: authData.user.id,
            full_name: signUpData.fullName,
            email: signUpData.email,
            phone: signUpData.phone,
            address: signUpData.address,
            metadata: {
              plan: 'Standard Plan',
              role_requested: signUpData.roleRequested,
              verification_status: isDealerRequest ? 'pending' : null,
              systemName: signUpData.hasSolar ? `${signUpData.systemSize} System` : 'No System',
              solar_details: signUpData.hasSolar ? {
                inverter: signUpData.inverterType,
                battery: signUpData.batteryType,
                size: signUpData.systemSize,
                installDate: signUpData.installDate,
                installTime: signUpData.installTime
              } : null
            }
          });

          if (profileError) {
            console.error("Profile upsert error:", profileError);
          }

          if (isDealerRequest) {
            if (!authData.session) {
              alert("Account created. Please verify your email, then sign in to submit your dealer verification documents.");
              return;
            }

            const folder = `${authData.user.id}/dealer-verifications`;
            const uploadRequiredFile = async (file: File | null, label: string) => {
              if (!file) return null;
              const result = await uploadPrivateFile(file, 'greenlife-verifications', folder);
              if (!result.path) {
                throw new Error(result.error || `Could not upload ${label}.`);
              }
              return result.path;
            };

            const [
              cacDocumentUrl,
              idDocumentUrl,
              storePhotoUrl,
              storeVideoUrl,
              workPhotoUrl,
              workVideoUrl,
            ] = await Promise.all([
              uploadRequiredFile(isInstallerRequest ? verificationFiles.cacDocument : null, 'CAC document'),
              uploadRequiredFile(isRetailerRequest ? verificationFiles.idDocument : null, 'ID document'),
              uploadRequiredFile(isRetailerRequest ? verificationFiles.storePhoto : null, 'store photo'),
              uploadRequiredFile(isRetailerRequest ? verificationFiles.storeVideo : null, 'store video'),
              uploadRequiredFile(isInstallerRequest ? verificationFiles.workPhoto : null, 'working photo'),
              uploadRequiredFile(isInstallerRequest ? verificationFiles.workVideo : null, 'working video'),
            ]);

            const { error: verificationError } = await getSupabase()
              .from('role_verification_requests')
              .insert({
                user_id: authData.user.id,
                role_requested: signUpData.roleRequested,
                business_name: signUpData.businessName.trim(),
                business_address: signUpData.businessAddress.trim(),
                cac_document_url: cacDocumentUrl,
                id_document_url: idDocumentUrl,
                store_photo_url: storePhotoUrl,
                store_video_url: storeVideoUrl,
                work_photo_url: workPhotoUrl,
                work_video_url: workVideoUrl,
                status: 'pending',
              });

            if (verificationError) throw verificationError;
          }

          alert(isDealerRequest
            ? "Account created and verification submitted for admin review."
            : "Account created! Please check your email for verification.");
        }

      } else {
        // --- LOGIN ---
        // Using direct state for email/password from the "signin" part of the form
        // But the form uses same state object or different inputs?
        // Looking at the JSX below (lines 175+), the login inputs are separate and NOT controlled by `signUpData` state currently?
        // PRO TIP: The original code had uncontrolled inputs for login (lines 181, 189).
        // I need to start controlling them or use refs. 
        // I will use refs for simplicity in this refactor since the original was uncontrolled.
      }
    } catch (error: any) {
      alert(error.message || "Authentication failed");
    } finally {
      resetCaptchaChallenge();
      setLoading(false);
    }
  };

  // Login Refs
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) {
      alert("Please enter email and password");
      setLoading(false);
      return;
    }

    if (!captchaToken) {
      alert("Please complete the security check.");
      setLoading(false);
      return;
    }

    try {
      const loginData = await securePasswordLogin(email, password, captchaToken);
      const data = await applySecureLoginSession(loginData);
      persistAuthPreference(rememberMe);

      if (data.session) {
        const from = location.state?.from || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      clearAuthPreference();
      console.error("Login error:", err);
      const loginError = err as SecureLoginError;

      if (loginError.details?.suspended) {
        alert(loginError.message || "This account is suspended. Please contact an admin.");
        return;
      }

      if (loginError.details?.failed_login_attempts) {
        alert(`Invalid credentials. Failed attempt ${loginError.details.failed_login_attempts} of 5. ${loginError.details.attempts_remaining || 0} attempt(s) remaining.`);
        return;
      }

      alert(err.message || "Failed to login. Please check your email and password.");
    } finally {
      resetCaptchaChallenge();
      setLoading(false);
    }
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
            <div className="size-10 text-primary rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <img src="/logo.png" alt="Greenlife Solar" className="w-full h-full object-cover" />
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
                  onClick={() => handleAuthModeChange('signin')}
                  className={`flex h-full grow items-center justify-center rounded-lg px-2 text-sm font-bold transition-all ${authMode === 'signin' ? 'bg-white dark:bg-white/10 shadow-sm text-forest dark:text-white' : 'text-forest/60 dark:text-white/60'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleAuthModeChange('signup')}
                  className={`flex h-full grow items-center justify-center rounded-lg px-2 text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-white dark:bg-white/10 shadow-sm text-forest dark:text-white' : 'text-forest/60 dark:text-white/60'}`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <form className="space-y-5" onSubmit={authMode === 'signin' ? handleLoginSubmit : handleAuth}>
              {authMode === 'signin' ? (
                // --- LOGIN FORM ---
                <>
                  <div>
                    <label className="block mb-2 text-sm font-bold">Email Address</label>
                    <input ref={emailRef} required className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 placeholder:text-gray-400 focus:ring-primary focus:border-primary transition-all" placeholder="name@company.com" type="email" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold">Password</label>
                      <Link className="text-xs font-bold text-primary hover:underline" to="/forgot-password">Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <input ref={passwordRef} required className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 placeholder:text-gray-400 focus:ring-primary focus:border-primary transition-all" placeholder="••••••••" type="password" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" type="button">
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <input
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                      id="remember"
                      type="checkbox"
                    />
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
                  <div>
                    <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Account Type</label>
                    <select
                      required
                      name="roleRequested"
                      value={signUpData.roleRequested}
                      onChange={handleInputChange}
                      className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 focus:ring-primary focus:border-primary appearance-none"
                    >
                      <option value="user">Consumer</option>
                      <option value="installer">Installer</option>
                      <option value="retailer">Retailer</option>
                    </select>
                  </div>
                  {(signUpData.roleRequested === 'installer' || signUpData.roleRequested === 'retailer') && (
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Business Name</label>
                          <input required name="businessName" value={signUpData.businessName} onChange={handleInputChange} className="form-input block w-full rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-10 px-3 text-sm focus:ring-primary focus:border-primary" placeholder="Business name" type="text" />
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Business Address</label>
                          <input required name="businessAddress" value={signUpData.businessAddress} onChange={handleInputChange} className="form-input block w-full rounded-lg border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-10 px-3 text-sm focus:ring-primary focus:border-primary" placeholder="Shop or office address" type="text" />
                        </div>
                      </div>
                      {signUpData.roleRequested === 'installer' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-xs font-bold uppercase text-gray-500">CAC Document</label>
                            <input required accept="image/*,.pdf" type="file" onChange={e => handleVerificationFileChange('cacDocument', e.target.files?.[0] || null)} className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-forest" />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Working Photo</label>
                            <input required accept="image/*" type="file" onChange={e => handleVerificationFileChange('workPhoto', e.target.files?.[0] || null)} className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-forest" />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Working Video</label>
                            <input required accept="video/*" type="file" onChange={e => handleVerificationFileChange('workVideo', e.target.files?.[0] || null)} className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-forest" />
                          </div>
                        </div>
                      )}
                      {signUpData.roleRequested === 'retailer' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Store Photo</label>
                            <input required accept="image/*" type="file" onChange={e => handleVerificationFileChange('storePhoto', e.target.files?.[0] || null)} className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-forest" />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-bold uppercase text-gray-500">Store Video</label>
                            <input required accept="video/*" type="file" onChange={e => handleVerificationFileChange('storeVideo', e.target.files?.[0] || null)} className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-forest" />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-bold uppercase text-gray-500">ID Document</label>
                            <input required accept="image/*,.pdf" type="file" onChange={e => handleVerificationFileChange('idDocument', e.target.files?.[0] || null)} className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-forest" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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

              <div className="pt-1">
                <TurnstileWidget
                  action={authMode === 'signin' ? 'user_login' : 'user_signup'}
                  className="min-h-[65px] w-full overflow-hidden rounded-lg"
                  resetSignal={captchaResetSignal}
                  theme="auto"
                  onVerify={(token) => {
                    setCaptchaToken(token);
                    setCaptchaError(null);
                  }}
                  onExpire={() => {
                    setCaptchaToken('');
                    setCaptchaError('Security check expired. Please try again.');
                  }}
                  onError={() => {
                    setCaptchaToken('');
                    setCaptchaError('Security check failed to load. Refresh the page and try again.');
                  }}
                />
                {captchaError && (
                  <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-300">{captchaError}</p>
                )}
              </div>

              <button className="w-full bg-primary hover:bg-opacity-90 text-forest font-black h-14 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95" type="submit" disabled={loading}>
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span>{authMode === 'signin' ? 'Sign In to Dashboard' : 'Create Account'}</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
