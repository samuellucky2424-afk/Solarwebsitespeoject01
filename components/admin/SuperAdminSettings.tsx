import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';

const SuperAdminSettings: React.FC = () => {
    const [staffEmails, setStaffEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        setLoading(true);
        try {
            // we store staff emails in greenlife_hub with type = 'app_settings'
            const { data, error } = await supabase
                .from('greenlife_hub')
                .select('metadata')
                .eq('type', 'app_settings')
                .maybeSingle();

            if (data?.metadata?.staff_emails) {
                setStaffEmails(data.metadata.staff_emails);
            }
        } catch (err) {
            console.error("Failed to load staff emails", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmail = () => {
        if (!newEmail || !newEmail.includes('@')) {
            setToast({ msg: "Please enter a valid email address.", type: 'error' });
            return;
        }
        if (staffEmails.includes(newEmail.toLowerCase())) {
            setToast({ msg: "Email already exists.", type: 'error' });
            return;
        }

        setStaffEmails([...staffEmails, newEmail.toLowerCase()]);
        setNewEmail('');
    };

    const handleRemoveEmail = (email: string) => {
        setStaffEmails(staffEmails.filter(e => e !== email));
    };

    const handleSave = async () => {
        setSaving(true);
        setToast(null);
        try {
            // First try to check if the setting row exists
            const { data: existing } = await supabase
                .from('greenlife_hub')
                .select('id, metadata')
                .eq('type', 'app_settings')
                .maybeSingle();

            if (existing) {
                const { error } = await supabase
                    .from('greenlife_hub')
                    .update({
                        metadata: { ...existing.metadata, staff_emails: staffEmails }
                    })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('greenlife_hub')
                    .insert([{
                        type: 'app_settings',
                        metadata: { staff_emails: staffEmails },
                        title: 'App Settings'
                    }]);
                if (error) throw error;
            }
            
            setToast({ msg: "Staff emails saved successfully.", type: 'success' });
        } catch (err) {
            console.error(err);
            setToast({ msg: "Failed to save settings.", type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 lg:space-y-10 animate-in fade-in max-w-4xl">
            <section>
                <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 px-1">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#0d1b0f] dark:text-white">Staff Notifications</h2>
                        <p className="text-xs sm:text-sm text-[#4c9a66] dark:text-gray-400 mt-1">Manage who receives emails for new orders and requests</p>
                    </div>
                </div>

                {toast && (
                    <div className={`mb-6 p-4 rounded-xl font-bold flex items-center justify-between ${toast.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        <span>{toast.msg}</span>
                        <button onClick={() => setToast(null)}><span className="material-symbols-outlined text-sm">close</span></button>
                    </div>
                )}

                <div className="bg-white dark:bg-[#152a17] rounded-2xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm overflow-hidden p-6 md:p-8">
                    <h3 className="text-lg font-bold mb-4">Notification Recipients</h3>
                    
                    <div className="flex gap-3 mb-6">
                        <input
                            type="email"
                            placeholder="staff@example.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none"
                        />
                        <button onClick={handleAddEmail} className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:brightness-105 transition-colors whitespace-nowrap">
                            Add Email
                        </button>
                    </div>

                    <div className="space-y-3 mb-8">
                        {loading ? (
                            <p className="text-gray-500 font-bold text-sm text-center py-4">Loading emails...</p>
                        ) : staffEmails.length > 0 ? (
                            staffEmails.map((email, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-400">mail</span>
                                        <span className="font-bold">{email}</span>
                                    </div>
                                    <button onClick={() => handleRemoveEmail(email)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 font-bold text-sm text-center py-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">No staff emails configured.</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-white/10">
                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="px-8 py-3 bg-[#0d1b0f] dark:bg-white text-white dark:text-[#0d1b0f] font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {saving ? (
                                <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Saving...</>
                            ) : (
                                <><span className="material-symbols-outlined text-sm">save</span> Save Configuration</>
                            )}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SuperAdminSettings;
