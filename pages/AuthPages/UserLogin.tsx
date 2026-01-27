import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UserLogin: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-forest dark:text-white">
      {/* Visual Panel (Left) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-background-dark">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark/80 via-background-dark/20 to-transparent"></div>
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDywjTY-ACoD5T274KEVbpjZpt1UsEACtIVbJMHCRFz6yvYkav1NDLgGVB_12KHvz-YIZHvQUer2FW__NQSlJOCK6aBQToLrM1_jTtkSfTu3dzqCouMKKe34n-UORwMKpwM_DqoWczq5GQZ_mTkp3jJIYcvRpXWs79XAgX29VkaUNEqffEILxgiOYXS2Ly14ndhnImJeE65WQdbkLJxGkoe6e68SEVHC_hPpQssIcTjsuT8vbXHWHITKEwrs4a-xvJ_6MXOM352ob4')" }}></div>
        <div className="relative z-20 flex flex-col justify-between p-16 w-full">
          <Link to="/" className="flex items-center gap-3">
             <div className="size-10 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
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
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-12 lg:px-24 justify-center">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight">Welcome back</h2>
            <p className="text-primary-dark dark:text-green-300 mt-2">Enter your details to access your dashboard</p>
          </div>
          <div className="mb-8">
            <div className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-200/50 dark:bg-white/5 p-1.5">
              <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 bg-white dark:bg-white/10 shadow-sm text-forest dark:text-white text-sm font-bold transition-all">
                <span className="truncate">Sign In</span>
                <input defaultChecked className="hidden" name="auth-mode" type="radio" value="signin" />
              </label>
              <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-primary-dark text-sm font-bold transition-all">
                <span className="truncate">Create Account</span>
                <input className="hidden" name="auth-mode" type="radio" value="signup" />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
              <img alt="Google logo" className="size-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCANakqiGFM3lZTXJn_yhOLhAK7Ge3nzgSGv20vcWDeMFlt6AL4Qdfyv3Kd4_5cWLknMrwGjsxpoLduxMs3M79YA_PaLxV_51ODcLqyNJN45LWPh6YvP10lPVZ7MYEcA0ZzBNN9LuIs6sfFJ5581_3Mh-dRCOWCJRmsYQMIzqC44U84f9ab6cvigkW38JkNLRMYKu6ET8HLTibnXzEHQC4vuu_-ex2Ggf_LUQ7NMiS2VGWlj-DPoNP1-zLpT6uoxRHNQ6c6A32gN5g" />
              <span className="text-sm font-bold">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-xl">ios</span>
              <span className="text-sm font-bold">Apple</span>
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
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block mb-2 text-sm font-bold">Email Address</label>
              <input className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 placeholder:text-gray-400 focus:ring-primary focus:border-primary transition-all" placeholder="name@company.com" type="email" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold">Password</label>
                <a className="text-xs font-bold text-primary hover:underline" href="#">Forgot password?</a>
              </div>
              <div className="relative">
                <input className="form-input block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-12 px-4 placeholder:text-gray-400 focus:ring-primary focus:border-primary transition-all" placeholder="••••••••" type="password" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" type="button">
                  <span className="material-symbols-outlined text-xl">visibility</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 py-2">
              <input className="size-4 rounded border-gray-300 text-primary focus:ring-primary" id="remember" type="checkbox" />
              <label className="text-sm text-gray-500 dark:text-gray-400" htmlFor="remember">Remember me for 30 days</label>
            </div>
            <button className="w-full bg-primary hover:bg-opacity-90 text-forest font-black h-14 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2" type="submit">
              <span>Sign In to Dashboard</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>
          <div className="mt-12 lg:absolute lg:bottom-8 lg:right-12 text-center lg:text-right">
             <Link to="/requests" className="inline-flex items-center gap-2 text-sm font-bold text-primary-dark dark:text-green-300 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">help</span>
                <span>Need help with your account?</span>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;