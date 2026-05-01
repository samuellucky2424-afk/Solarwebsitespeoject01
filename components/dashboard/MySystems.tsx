import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { supabase } from '../../config/supabaseClient';

interface SolarSystem {
    id: string;
    name: string;
    address: string;
    systemSize: string;
    inverterType: string;
    batteryType: string;
    installDate: string;
    status: string;
}

const MySystems: React.FC = () => {
    const { activeUser } = useAdmin();

    const [dbSystems, setDbSystems] = useState<SolarSystem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!activeUser?.id) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('user_systems')
                    .select('*')
                    .eq('user_id', activeUser.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const mapped: SolarSystem[] = (data || []).map((row: any) => {
                    const systemData = row.system_data || {};
                    return {
                        id: row.id,
                        name: row.name || systemData.name || 'Solar System',
                        address: systemData.address || '',
                        systemSize: row.capacity || systemData.systemSize || 'N/A',
                        inverterType: systemData.inverterType || 'Standard Inverter',
                        batteryType: systemData.batteryType || 'None',
                        installDate: row.installation_date || systemData.installDate || '',
                        status: row.status || 'Operational',
                    };
                });
                setDbSystems(mapped);
            } catch (err) {
                console.error('Failed to load user systems:', err);
                setDbSystems([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [activeUser?.id]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newSystem, setNewSystem] = useState({
        name: '',
        address: '',
        systemSize: '1kW',
        inverterType: '',
        batteryType: '',
        installDate: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewSystem(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddSystem = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeUser?.id) {
            console.warn('No active user found; cannot save system');
            alert('Please sign in again. We could not find your profile.');
            return;
        }

        if (saving) return;
        setSaving(true);

        const system: Omit<SolarSystem, 'id'> = {
            name: newSystem.name || `${newSystem.systemSize} System`,
            address: newSystem.address,
            systemSize: newSystem.systemSize,
            inverterType: newSystem.inverterType || 'Standard Inverter',
            batteryType: newSystem.batteryType || 'None',
            installDate: newSystem.installDate,
            status: 'Operational',
        };

        // Persist to Supabase (user_systems table)
        try {
            const { data, error } = await supabase
                .from('user_systems')
                .insert({
                    user_id: activeUser.id,
                    name: system.name,
                    capacity: system.systemSize,
                    installation_date: system.installDate || null,
                    status: system.status,
                    system_data: {
                        address: system.address,
                        inverterType: system.inverterType,
                        batteryType: system.batteryType,
                        installDate: system.installDate,
                        systemSize: system.systemSize,
                    }
                })
                .select('*')
                .single();

            if (error) throw error;

            const systemData = (data as any)?.system_data || {};
            const saved: SolarSystem = {
                id: (data as any).id,
                name: (data as any).name || systemData.name || system.name,
                address: systemData.address || system.address,
                systemSize: (data as any).capacity || systemData.systemSize || system.systemSize,
                inverterType: systemData.inverterType || system.inverterType,
                batteryType: systemData.batteryType || system.batteryType,
                installDate: (data as any).installation_date || systemData.installDate || system.installDate,
                status: (data as any).status || system.status,
            };

            // Prepend using the real DB uuid id so rendering keys stay stable.
            setDbSystems(prev => [saved, ...prev]);
            setNewSystem({ name: '', address: '', systemSize: '1kW', inverterType: '', batteryType: '', installDate: '' });
            setShowAddForm(false);
            alert('System saved successfully.');
        } catch (err) {
            console.error('Failed to save system:', err);
            alert('Failed to save system. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Operational': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Maintenance': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0d1b0f] dark:text-white mb-2">My Systems</h2>
                    <p className="text-[#4c9a66] dark:text-gray-400 text-base">Manage and monitor your solar installations</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-primary hover:bg-primary/90 active:scale-95 text-forest font-bold px-6 py-3.5 md:px-8 md:py-4 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center gap-2 text-base whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-2xl font-light">{showAddForm ? 'close' : 'add_circle'}</span>
                    {showAddForm ? 'Cancel' : 'Add System'}
                </button>
            </div>

            {/* Add Existing System Form */}
            {showAddForm && (
                <div className="bg-white dark:bg-[#152a17] p-8 rounded-2xl border border-[#d0e5d5] dark:border-white/10 shadow-lg animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-xl md:text-2xl text-[#0d1b0f] dark:text-white mb-1">Register New System</h3>
                    <p className="text-sm md:text-base text-[#4c9a66] dark:text-gray-400 mb-6">Add details of an existing solar system installation.</p>

                    <form onSubmit={handleAddSystem} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold uppercase text-gray-500 tracking-wider">System Name</label>
                                <input
                                    name="name" value={newSystem.name} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-[#d0e5d5] dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-base font-medium"
                                    placeholder="e.g. Home Solar, Office System"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold uppercase text-gray-500 tracking-wider">Installation Address</label>
                                <input
                                    required name="address" value={newSystem.address} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-[#d0e5d5] dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-base font-medium"
                                    placeholder="123 Solar Street, Lagos"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold uppercase text-gray-500 tracking-wider">System Size</label>
                                <select
                                    name="systemSize" value={newSystem.systemSize} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-[#d0e5d5] dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-base font-medium"
                                >
                                    <option value="1kW">1 kW</option>
                                    <option value="3kW">3 kW</option>
                                    <option value="5kW">5 kW</option>
                                    <option value="10kW">10 kW</option>
                                    <option value="Above 10kW">Above 10 kW</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold uppercase text-gray-500 tracking-wider">Inverter Type</label>
                                <input
                                    name="inverterType" value={newSystem.inverterType} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-[#d0e5d5] dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-base font-medium"
                                    placeholder="e.g. Hybrid 5kW"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold uppercase text-gray-500 tracking-wider">Battery Type</label>
                                <input
                                    name="batteryType" value={newSystem.batteryType} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-[#d0e5d5] dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-base font-medium"
                                    placeholder="e.g. Lithium Ion 200Ah"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold uppercase text-gray-500 tracking-wider">Installation Date</label>
                                <input
                                    name="installDate" type="date" value={newSystem.installDate} onChange={handleInputChange}
                                    className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-[#d0e5d5] dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-base font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button" onClick={() => setShowAddForm(false)}
                                className="px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-bold text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className={`bg-primary hover:bg-primary/90 active:scale-95 text-forest px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary/30 transition-all flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <span className="material-symbols-outlined text-2xl font-light">add</span>
                                {saving ? 'Saving...' : 'Register System'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Systems List */}
            {loading ? (
                <div className="p-12 border border-gray-100 dark:border-white/10 rounded-xl text-center text-gray-500 dark:text-gray-400">
                    Loading systems...
                </div>
            ) : dbSystems.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2 block">solar_power</span>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No systems registered yet.</p>
                    <button onClick={() => setShowAddForm(true)} className="text-primary font-bold hover:underline">
                        Add your first system
                    </button>
                </div>
            ) : (
                <div className="grid gap-3 md:gap-4">
                    {dbSystems.map((system, index) => (
                        <div key={system.id} className="bg-white dark:bg-white/5 p-4 md:p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-7xl md:text-9xl">solar_power</span>
                            </div>

                            <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg md:text-xl font-bold text-forest dark:text-white">{system.name}</h3>
                                        {index === 0 && (
                                            <span className="text-[9px] md:text-[10px] font-bold uppercase bg-primary/10 text-primary px-1.5 md:px-2 py-0.5 rounded-full">Primary</span>
                                        )}
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 md:mt-1">
                                        <span className="material-symbols-outlined text-xs md:text-sm">location_on</span>
                                        {system.address || 'No address provided'}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${getStatusBadge(system.status)}`}>
                                    {system.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm relative z-10">
                                <div className="bg-background-light dark:bg-background-dark p-2 md:p-3 rounded-lg">
                                    <p className="text-[#4c9a66] text-[10px] md:text-xs uppercase font-bold mb-0.5 md:mb-1">System Size</p>
                                    <p className="font-bold text-base md:text-lg">{system.systemSize}</p>
                                </div>
                                <div className="bg-background-light dark:bg-background-dark p-2 md:p-3 rounded-lg">
                                    <p className="text-[#4c9a66] text-[10px] md:text-xs uppercase font-bold mb-0.5 md:mb-1">Inverter</p>
                                    <p className="font-semibold">{system.inverterType}</p>
                                </div>
                                <div className="bg-background-light dark:bg-background-dark p-2 md:p-3 rounded-lg">
                                    <p className="text-[#4c9a66] text-[10px] md:text-xs uppercase font-bold mb-0.5 md:mb-1">Battery Bank</p>
                                    <p className="font-semibold">{system.batteryType}</p>
                                </div>
                                <div className="bg-background-light dark:bg-background-dark p-2 md:p-3 rounded-lg">
                                    <p className="text-[#4c9a66] text-[10px] md:text-xs uppercase font-bold mb-0.5 md:mb-1">Installed</p>
                                    <p className="font-semibold">{system.installDate || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySystems;
