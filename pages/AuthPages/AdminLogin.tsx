import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/admin/dashboard');
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-forest dark:text-white">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-800 px-6 py-3 bg-white/50 dark:bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-4 text-forest dark:text-white">
          <div className="flex justify-center">
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <img src="/logo.png" alt="Greenlife Solar" className="w-16 h-16 object-contain" />
              </div>
            </Link>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">Greenlife Solar Solutions LTD</h2>
        </Link>
        <div className="flex flex-1 justify-end gap-8">
          <Link to="/consultation" className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-forest text-sm font-bold transition-transform hover:scale-105 active:scale-95">
            <span className="truncate">Help Desk</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-[480px] w-full">
          <div className="text-center mb-8">
            <h1 className="text-forest dark:text-white tracking-tight text-[32px] font-bold leading-tight pb-2">Administrative Access</h1>
            <p className="text-[#4c9a66] text-sm font-medium uppercase tracking-widest">Secure portal for authorized personnel only</p>
          </div>

          <div className="bg-[#1a2e21] rounded-xl shadow-2xl p-8 border border-[#2c4b36]">
            <div className="@container mb-8">
              <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-lg min-h-[140px]" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(26, 46, 33, 0.2), rgba(26, 46, 33, 0.8)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBGkOfVvKAhxN13X_JGSnQn0dxpssdjdLWl-b4IGZkq9RV0chS1YZ2SOzsFLs_uyzznaneifz37OkRkfjGEAWvfHqMqkdKdmwdfAWPg7acrzW70ZOjqPX38ehvQJ2IE3hfX2PqHYp4lAVccGMuilXNW5LdqsUpg8jfJ-vt7AUWrINCqrKIr8ez79P6668G4Kh774_6l4TPodYsvaoE2yxrHljhr4aIQO9VFbfIbtjKSAtc7AOkLu9TSyJz5JHl5QqPqHPiVFKnb9Zc")' }}>
                <div className="p-4">
                  <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded flex items-center gap-2 w-fit">
                    <span className="material-symbols-outlined text-[14px]">encrypted</span>
                    ENCRYPTED CONNECTION
                  </span>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Admin ID / Email
                </label>
                <input className="form-input w-full rounded-lg text-white border border-[#2c4b36] bg-[#0d1b12] focus:ring-2 focus:ring-primary focus:border-transparent h-12 px-4 placeholder:text-gray-600 transition-all" placeholder="Enter your administrator email" type="email" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Password
                </label>
                <input className="form-input w-full rounded-lg text-white border border-[#2c4b36] bg-[#0d1b12] focus:ring-2 focus:ring-primary focus:border-transparent h-12 px-4 placeholder:text-gray-600 transition-all" placeholder="••••••••" type="password" />
              </div>

              <div className="bg-[#0d1b12]/50 border-l-4 border-primary p-4 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">cell_tower</span>
                  <div>
                    <p className="text-white text-xs font-bold">Two-Factor Authentication</p>
                    <p className="text-gray-400 text-[11px]">Prompt will be triggered upon credential verification.</p>
                  </div>
                </div>
              </div>

              <button className="w-full bg-primary hover:bg-primary/90 text-forest font-bold py-3 rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all" type="submit">
                <span>Secure Login</span>
                <span className="material-symbols-outlined">login</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <a className="text-gray-400 hover:text-primary underline decoration-gray-600" href="#">Trouble logging in?</a>
                <span className="text-gray-500">v4.2.1-stable</span>
              </div>
            </form>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 px-4 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed max-w-[320px]">
              Warning: This system is for the use of authorized Greenlife Solar Solutions LTD personnel only. All activities are monitored and logged.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1 text-[#4c9a66]">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span className="text-[10px] font-bold">256-BIT SSL</span>
              </div>
              <div className="flex items-center gap-1 text-[#4c9a66]">
                <span className="material-symbols-outlined text-[16px]">security</span>
                <span className="text-[10px] font-bold">SOC2 COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;