import React, { useEffect, useState } from 'react';

const SettingsPanel: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-[#4c9a52]">Basic admin preferences (ready to extend for roles, invoices, notifications)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-6 shadow-sm">
          <h3 className="font-black mb-2">Appearance</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Toggle dashboard theme.</p>

          <button
            type="button"
            onClick={() => setDarkMode((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-forest font-black hover:brightness-105 transition-all"
          >
            <span className="material-symbols-outlined text-lg">{darkMode ? 'dark_mode' : 'light_mode'}</span>
            {darkMode ? 'Dark mode on' : 'Light mode on'}
          </button>
        </div>

        <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-6 shadow-sm">
          <h3 className="font-black mb-2">Company</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This section is intentionally lightweight; you can wire these fields to Supabase when you’re ready.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#4c9a52] mb-1">Company name</label>
              <input
                disabled
                value="GreenLife Solar Solutions"
                className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#4c9a52] mb-1">Timezone</label>
              <input
                disabled
                value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg border border-dashed border-[#cfe7d1] dark:border-[#2a3d2c] text-sm text-gray-500">
            Future-ready: installation scheduling, invoices, notifications, and role-based access can plug into this page.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

