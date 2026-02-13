import React, { useState, useEffect } from 'react';
import { useAdmin, ServiceRequest } from '../../context/AdminContext';
import { Toast } from '../../components/SharedComponents';

// --- Constants ---
const BATTERY_TYPES = ['Tubular', 'Lithium Ion'];
const BATTERY_CAPACITIES = ['2.5kWh', '3.5kWh', '5kWh', '6kWh', '10kWh', '15kWh', '17kWh', '17.5kWh'];

const INVERTER_TYPES = ['Transformer Base', 'Hybrid'];
const INVERTER_CAPACITIES = ['1kVA', '2.5kW', '3.5kW', '5kW', '8kW', '10kW', '12kW', '16kW'];

const PANEL_WATTAGES = ['300W', '400W', '450W', '550W', '600W', '650W', '700W'];

const UpgradeRequest: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const { activeUser, addRequest } = useAdmin();
    const [upgradeType, setUpgradeType] = useState<'Full' | 'Battery' | 'Inverter' | 'Panel'>('Battery');

    // Dynamic Fields State
    const [batteryDetails, setBatteryDetails] = useState({ type: 'Lithium Ion', capacity: '5kWh', quantity: 1 });
    const [inverterDetails, setInverterDetails] = useState({ type: 'Hybrid', capacity: '5kW', quantity: 1 });
    const [panelDetails, setPanelDetails] = useState({ wattage: '450W', quantity: 4 });

    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // Reset details when type changes
    useEffect(() => {
        // Optional: Could reset state here if needed, but keeping selections might be user-friendly
    }, [upgradeType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Construct Technical Specifications String
        let specs = "";
        switch (upgradeType) {
            case 'Battery':
                specs = `Type: ${batteryDetails.type}, Capacity: ${batteryDetails.capacity}, Qty: ${batteryDetails.quantity}`;
                break;
            case 'Inverter':
                specs = `Type: ${inverterDetails.type}, Capacity: ${inverterDetails.capacity}, Qty: ${inverterDetails.quantity}`;
                break;
            case 'Panel':
                specs = `Wattage: ${panelDetails.wattage}, Qty: ${panelDetails.quantity}`;
                break;
            case 'Full':
                specs = "Full System Upgrade Requested";
                break;
        }

        setTimeout(() => {
            const newRequest: ServiceRequest = {
                id: `REQ-${Date.now()}`,
                title: `${upgradeType} Upgrade Request`,
                type: 'Upgrade',
                customer: activeUser.fullName,
                address: activeUser.address,
                phone: activeUser.phone,
                email: activeUser.email,
                date: new Date().toISOString().split('T')[0],
                status: 'Pending',
                priority: 'Normal',
                description: `${specs}.\n\nAdditional Notes: ${description}`
            };

            addRequest(newRequest);
            setLoading(false);
            setToast("Upgrade request submitted successfully!");
            setTimeout(() => {
                onSuccess();
            }, 1500);
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}

            <div className="text-center mb-8">
                <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <span className="material-symbols-outlined text-3xl">upgrade</span>
                </div>
                <h2 className="text-2xl font-bold dark:text-white">System Upgrade</h2>
                <p className="text-gray-500">Customize your upgrade with specific components.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 p-8 rounded-2xl border border-gray-100 dark:border-white/10 shadow-lg">
                <div className="grid gap-8">
                    {/* 1. Select Upgrade Category */}
                    <div>
                        <label className="block text-sm font-bold mb-3 dark:text-gray-300">Upgrade Category</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Battery', 'Inverter', 'Panel', 'Full'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setUpgradeType(type as any)}
                                    className={`p-3 rounded-lg border text-sm font-bold transition-all ${upgradeType === type
                                            ? 'bg-primary text-forest border-primary shadow-md'
                                            : 'border-gray-200 dark:border-white/10 hover:border-primary/50 dark:text-gray-300 bg-gray-50 dark:bg-black/20'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-white/5"></div>

                    {/* 2. Dynamic Options */}
                    {upgradeType === 'Battery' && (
                        <div className="space-y-4 animate-in fade-in">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">battery_charging_full</span>
                                Battery Specifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Battery Type</label>
                                    <select
                                        value={batteryDetails.type}
                                        onChange={(e) => setBatteryDetails({ ...batteryDetails, type: e.target.value })}
                                        className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        {BATTERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Capacity</label>
                                    <select
                                        value={batteryDetails.capacity}
                                        onChange={(e) => setBatteryDetails({ ...batteryDetails, capacity: e.target.value })}
                                        className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        {BATTERY_CAPACITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={batteryDetails.quantity}
                                        onChange={(e) => setBatteryDetails({ ...batteryDetails, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {upgradeType === 'Inverter' && (
                        <div className="space-y-4 animate-in fade-in">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">electric_bolt</span>
                                Inverter Specifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Inverter Type</label>
                                    <select
                                        value={inverterDetails.type}
                                        onChange={(e) => setInverterDetails({ ...inverterDetails, type: e.target.value })}
                                        className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        {INVERTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Capacity</label>
                                    <select
                                        value={inverterDetails.capacity}
                                        onChange={(e) => setInverterDetails({ ...inverterDetails, capacity: e.target.value })}
                                        className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        {INVERTER_CAPACITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={inverterDetails.quantity}
                                        onChange={(e) => setInverterDetails({ ...inverterDetails, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {upgradeType === 'Panel' && (
                        <div className="space-y-4 animate-in fade-in">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">solar_power</span>
                                Panel Specifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Wattage</label>
                                    <select
                                        value={panelDetails.wattage}
                                        onChange={(e) => setPanelDetails({ ...panelDetails, wattage: e.target.value })}
                                        className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        {PANEL_WATTAGES.map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={panelDetails.quantity}
                                        onChange={(e) => setPanelDetails({ ...panelDetails, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {upgradeType === 'Full' && (
                        <div className="animate-in fade-in p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
                            <span className="material-symbols-outlined text-3xl text-primary mb-2">check_circle</span>
                            <h3 className="font-bold text-forest dark:text-white">Full System Upgrade</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Our team will assess your current setup and recommend a complete overhaul.</p>
                        </div>
                    )}

                    {/* 3. Common Fields */}
                    <div>
                        <label className="block text-sm font-bold mb-2 dark:text-gray-300">Address (Auto-filled)</label>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/20 p-3 rounded-lg text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined text-lg">location_on</span>
                            {activeUser.address}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 dark:text-gray-300">Additional Notes</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={upgradeType === 'Full' ? "Describe your power needs..." : "Any specific brands or preferences?"}
                            className="w-full h-32 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4 resize-none focus:ring-2 focus:ring-primary outline-none text-sm"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-forest text-white py-4 rounded-xl font-bold hover:bg-forest/90 transition-transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-forest/20"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                        {!loading && <span className="material-symbols-outlined">send</span>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpgradeRequest;
