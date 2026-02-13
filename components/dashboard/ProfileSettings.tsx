import React, { useState, useEffect } from 'react';
import { useAdmin, UserProfile } from '../../context/AdminContext';
import { Toast } from '../../components/SharedComponents';

const NIGERIAN_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
    "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
    "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
];

const ProfileSettings: React.FC = () => {
    const { activeUser, updateUserProfile } = useAdmin();

    // Initialize form with granular fields if they exist, otherwise fallback or empty
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        firstName: activeUser.firstName,
        fullName: activeUser.fullName,
        email: activeUser.email,
        phone: activeUser.phone || '',
        street: activeUser.street || '',
        city: activeUser.city || '',
        state: activeUser.state || 'Lagos',
        landmark: activeUser.landmark || '',
    });

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Construct full address string for backward compatibility / display
        const fullAddress = `${formData.street}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.city}, ${formData.state}`;

        const updates = {
            ...formData,
            address: fullAddress // Sync full address
        };

        // Simulate API call
        setTimeout(() => {
            updateUserProfile(updates);
            setLoading(false);
            setToast("Profile updated successfully!");
        }, 800);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}

            <div className="flex items-center gap-4 mb-8">
                <div className="size-20 rounded-full bg-cover border-4 border-white dark:border-[#1a2e21] shadow-xl" style={{ backgroundImage: `url('${activeUser.avatar}')` }}></div>
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">{activeUser.fullName}</h2>
                    <p className="text-sm text-primary font-bold">{activeUser.plan}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                    <h3 className="font-bold dark:text-white">Personal Information</h3>
                    <p className="text-xs text-gray-500">Update your contact details and address here.</p>
                </div>

                <div className="p-8 grid gap-6">
                    {/* Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
                            <input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Address</label>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone Number</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🇳🇬</span>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+234..."
                                    className="w-full pl-8 bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-white/5 my-2"></div>

                    {/* Address Section */}
                    <div>
                        <h4 className="font-bold text-sm dark:text-gray-300 mb-4">Delivery & Service Address</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">House Address</label>
                                <input
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    placeholder="e.g. 12, Admiralty Way"
                                    className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">State</label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        <option value="">Select State</option>
                                        {NIGERIAN_STATES.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">City / Capital</label>
                                    <input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="e.g. Lekki"
                                        className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nearest Landmark (Optional)</label>
                                <input
                                    name="landmark"
                                    value={formData.landmark}
                                    onChange={handleChange}
                                    placeholder="e.g. Near Shoprite"
                                    className="w-full bg-background-light dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-forest px-8 py-3 rounded-xl font-bold hover:brightness-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;
