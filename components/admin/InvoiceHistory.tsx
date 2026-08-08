import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';

const InvoiceHistory: React.FC = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const { data, error } = await supabase
                    .from('invoices')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setInvoices(data || []);
            } catch (err: any) {
                console.error('Error fetching invoices:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="material-symbols-outlined animate-spin text-4xl text-emerald-600">refresh</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl">
                Error loading invoices: {error}. Did you run the Supabase SQL script?
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#152a17] rounded-2xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm p-6 md:p-8 mt-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">Sent Invoices</h3>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                            <th className="py-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Invoice #</th>
                            <th className="py-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Date</th>
                            <th className="py-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                            <th className="py-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Total Amount</th>
                            <th className="py-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                            <th className="py-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">
                                    No invoices have been sent yet.
                                </td>
                            </tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-black/20 transition-colors">
                                    <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{inv.invoice_number}</td>
                                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                                        {new Date(inv.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="font-semibold text-gray-900 dark:text-white">{inv.customer_name}</div>
                                        <div className="text-xs text-gray-500">{inv.customer_email}</div>
                                    </td>
                                    <td className="py-4 px-4 font-bold text-emerald-600">
                                        ₦{Number(inv.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                            Sent
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        {inv.image_url ? (
                                            <button 
                                                onClick={() => setSelectedImage(inv.image_url)}
                                                className="text-primary hover:text-emerald-700 flex items-center gap-1 font-semibold text-sm"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">image</span> View Image
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-sm">No Image</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-t-xl border-b border-gray-200 dark:border-slate-800">
                            <h3 className="font-bold text-lg dark:text-white">Invoice Image</h3>
                            <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full dark:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="bg-gray-100 dark:bg-black overflow-y-auto rounded-b-xl flex justify-center p-4">
                            <img src={selectedImage} alt="Invoice" className="max-w-full shadow-2xl rounded" />
                        </div>
                        <div className="mt-4 flex justify-center">
                            <a 
                                href={selectedImage} 
                                download="Invoice.png" 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors"
                            >
                                <span className="material-symbols-outlined">download</span> Download Image
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceHistory;
