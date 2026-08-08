import React, { useState } from 'react';

const InvoiceGenerator: React.FC = () => {
    const [customerName, setCustomerName] = useState('');
    const [email, setEmail] = useState('');
    const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const [dueDate, setDueDate] = useState(() => nextWeek.toISOString().split('T')[0]);
    
    const [items, setItems] = useState<{name: string, quantity: number, price: number}[]>([
        { name: '', quantity: 1, price: 0 }
    ]);
    
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

    const handleAddItem = () => {
        setItems([...items, { name: '', quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    const handleSendInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setToast(null);

        const invoiceId = `INV-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;

        try {
            const res = await fetch('http://localhost:3001/api/send-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    customerName,
                    items,
                    totalAmount,
                    invoiceId,
                    issueDate,
                    dueDate
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send invoice');

            setToast({ msg: `Invoice ${invoiceId} sent successfully!`, type: 'success' });
            setCustomerName('');
            setEmail('');
            setItems([{ name: '', quantity: 1, price: 0 }]);
        } catch (err: any) {
            console.error(err);
            setToast({ msg: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#152a17] rounded-2xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm p-6 md:p-8 mt-8">
            <h3 className="text-xl font-bold mb-6">Generate Manual Invoice</h3>
            
            {toast && (
                <div className={`mb-6 p-4 rounded-xl font-bold flex items-center justify-between ${toast.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span>{toast.msg}</span>
                    <button onClick={() => setToast(null)}><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
            )}

            <form onSubmit={handleSendInvoice} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold mb-2">Customer Name</label>
                        <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/20" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-2">Customer Email</label>
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/20" placeholder="john@example.com" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-2">Issue Date</label>
                        <input required type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/20" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-2">Due Date</label>
                        <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/20" />
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-200 dark:border-white/10 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-lg">Invoice Items</h4>
                        <button type="button" onClick={handleAddItem} className="px-4 py-2 bg-primary/20 text-primary font-bold rounded-lg text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">add</span> Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold mb-2">Item Description</label>
                                    <input required type="text" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/50" placeholder="Solar Panel 500W" />
                                </div>
                                <div className="w-full md:w-24">
                                    <label className="block text-xs font-bold mb-2">Qty</label>
                                    <input required type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/50" />
                                </div>
                                <div className="w-full md:w-40">
                                    <label className="block text-xs font-bold mb-2">Unit Price (₦)</label>
                                    <input required type="number" min="0" value={item.price} onChange={e => handleItemChange(idx, 'price', Number(e.target.value))} className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/50" />
                                </div>
                                {items.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveItem(idx)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mt-8 p-6 bg-gradient-to-r from-gray-50 to-white dark:from-black/20 dark:to-transparent border border-gray-200 dark:border-white/10 rounded-xl">
                    <div className="text-xl mb-4 md:mb-0">
                        <span className="text-gray-500 text-sm font-bold block mb-1">Total Amount</span>
                        <span className="font-black text-2xl text-primary">₦{totalAmount.toLocaleString()}</span>
                    </div>
                    
                    <button type="submit" disabled={loading} className="px-8 py-4 w-full md:w-auto bg-[#0d1b0f] dark:bg-white text-white dark:text-[#0d1b0f] font-black rounded-xl hover:scale-105 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:hover:scale-100">
                        {loading ? (
                            <><span className="material-symbols-outlined animate-spin">refresh</span> Sending...</>
                        ) : (
                            <><span className="material-symbols-outlined">send</span> Send Invoice Email</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InvoiceGenerator;
