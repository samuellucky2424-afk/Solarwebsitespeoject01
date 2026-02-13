import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Link } from 'react-router-dom';

const MySystems: React.FC = () => {
    // Access the shared active user state from AdminContext
    // This ensures that when Admin updates the user's system, it reflects here immediately.
    const { activeUser } = useAdmin();

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Systems</h2>
                <Link to="/consultation" className="bg-primary text-forest font-bold px-4 py-2 rounded-lg hover:brightness-105 transition-all">
                    + Request New System
                </Link>
            </div>

            {/* Check if the user has a system registered (based on systemStatus or similar) */}
            {activeUser.systemStatus === 'Out of Care' || activeUser.systemName === 'No System Registered' ? (
                <div className="p-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">solar_power</span>
                    <p className="text-gray-500 mb-4">No active systems found linked to your account.</p>
                    <Link to="/consultation" className="text-primary font-bold hover:underline">Get a free quote today</Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {/* Display the Active User's System */}
                    <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-9xl">solar_power</span>
                        </div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold text-forest dark:text-white">{activeUser.systemName}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {activeUser.address}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${activeUser.systemStatus === 'Operational' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    activeUser.systemStatus === 'Maintenance' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {activeUser.systemStatus}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm relative z-10">
                            <div className="bg-background-light dark:bg-background-dark p-3 rounded-lg">
                                <p className="text-[#4c9a66] text-xs uppercase font-bold mb-1">System Size</p>
                                <p className="font-bold text-lg">{activeUser.systemSize || 'N/A'}</p>
                            </div>
                            <div className="bg-background-light dark:bg-background-dark p-3 rounded-lg">
                                <p className="text-[#4c9a66] text-xs uppercase font-bold mb-1">Inverter</p>
                                <p className="font-semibold">{activeUser.inverterType || 'Standard Inverter'}</p>
                            </div>
                            <div className="bg-background-light dark:bg-background-dark p-3 rounded-lg">
                                <p className="text-[#4c9a66] text-xs uppercase font-bold mb-1">Battery Bank</p>
                                <p className="font-semibold">{activeUser.batteryType || 'None'}</p>
                            </div>
                            <div className="bg-background-light dark:bg-background-dark p-3 rounded-lg">
                                <p className="text-[#4c9a66] text-xs uppercase font-bold mb-1">Warranty Ends</p>
                                <p className="font-semibold">{activeUser.warrantyEnd}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3 relative z-10">
                            <Link to="/service-request?type=maintenance" className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">warning</span> Report Issue
                            </Link>
                            <Link to="/service-request?type=upgrade" className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">upgrade</span> Request Upgrade
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySystems;
