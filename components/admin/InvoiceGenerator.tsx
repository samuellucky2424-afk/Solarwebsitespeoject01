import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { productsData } from '../../data/products';
import { toPng } from 'html-to-image';
import { InvoiceLayout } from './InvoiceLayout';
import InvoiceHistory from './InvoiceHistory';

const InvoiceGenerator: React.FC = () => {
    const [view, setView] = useState<'generator' | 'history'>('generator');
    // Sender Details
    const [companyName, setCompanyName] = useState('Greenlife Solar Solutions LTD');
    const [companyAddress, setCompanyAddress] = useState('123 Solar Way, Tech District\nCity, State 12345');
    const [companyEmail, setCompanyEmail] = useState('hello@greenlifesolarsolution.com');
    const [companyPhone, setCompanyPhone] = useState('+234 (0) 123 456 7890');

    // Receiver Details
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    // Invoice Meta
    const [invoiceId, setInvoiceId] = useState(() => `INV-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    
    const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const [dueDate, setDueDate] = useState(() => nextWeek.toISOString().split('T')[0]);

    // Items
    const [items, setItems] = useState<{name: string, description: string, unit: string, quantity: number, price: number}[]>([
        { name: '', description: '', unit: 'Pcs', quantity: 1, price: 0 }
    ]);

    const [activeProductDropdown, setActiveProductDropdown] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveProductDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Notes
    const [terms, setTerms] = useState('Payment is due within 7 days. Late payments may incur additional fees. All equipment remains property of Greenlife Solar until fully paid.\n\nTHANK YOU FOR YOUR BUSINESS');

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleAddItem = () => setItems([...items, { name: '', description: '', unit: 'Pcs', quantity: 1, price: 0 }]);
    const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));
    const handleItemChange = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    const captureRef = useRef<HTMLDivElement>(null);

    const handleSendInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setToast(null);

        try {
            // Wait for any state updates to flush to DOM
            await new Promise(resolve => setTimeout(resolve, 100));

            if (!captureRef.current) throw new Error('Capture area not found');

            const imageData = await toPng(captureRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            });

            const payload = {
                sender: { companyName, companyAddress, companyEmail, companyPhone },
                receiver: { customerName, customerAddress, customerEmail, customerPhone },
                meta: { invoiceId, deliveryAddress, issueDate, dueDate },
                items,
                terms,
                totalAmount,
                imageData
            };

            const res = await fetch('/api/send-invoice', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send invoice');

            setToast({ msg: `Invoice ${invoiceId} sent successfully!`, type: 'success' });
            setCustomerName(''); setCustomerEmail(''); setCustomerAddress(''); setCustomerPhone('');
            setItems([{ name: '', description: '', unit: 'Pcs', quantity: 1, price: 0 }]);
            setInvoiceId(`INV-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`);
            setShowPreview(false);
        } catch (err: any) {
            console.error(err);
            setToast({ msg: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (showPreview) {
        return (
            <div className="bg-gray-100 dark:bg-[#050a06] p-4 md:p-8 rounded-2xl min-h-screen flex justify-center">
                <div className="w-full max-w-4xl">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-bold">
                            <span className="material-symbols-outlined">arrow_back</span> Back to Editor
                        </button>
                        <button onClick={handleSendInvoice} disabled={loading} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50">
                            {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">send</span>}
                            {loading ? 'Sending...' : 'Send Invoice'}
                        </button>
                    </div>

                    {/* A4 Invoice Preview */}
                    <div className="bg-white shadow-2xl overflow-hidden aspect-[1/1.414] text-gray-800 relative select-text w-full max-w-[794px] mx-auto overflow-y-auto max-h-[80vh]">
                        <div style={{ transform: 'scale(1)', transformOrigin: 'top left', width: '794px' }}>
                            <InvoiceLayout 
                                companyName={companyName} companyAddress={companyAddress} companyEmail={companyEmail} companyPhone={companyPhone}
                                customerName={customerName} customerAddress={customerAddress} customerEmail={customerEmail} customerPhone={customerPhone} deliveryAddress={deliveryAddress}
                                invoiceId={invoiceId} issueDate={issueDate} dueDate={dueDate}
                                items={items} terms={terms} totalAmount={totalAmount}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'history') {
        return (
            <div className="bg-white dark:bg-[#050a06] min-h-screen p-4">
                <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                    <button 
                        onClick={() => setView('generator')}
                        className="px-4 py-2 font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Create Invoice
                    </button>
                    <button 
                        className="px-4 py-2 font-bold text-primary border-b-2 border-primary"
                    >
                        Invoice History
                    </button>
                </div>
                <InvoiceHistory />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#152a17] rounded-2xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm p-6 md:p-8 mt-8">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
                <div className="flex gap-4">
                    <button 
                        className="px-4 py-2 font-bold text-primary border-b-2 border-primary"
                    >
                        Create Invoice
                    </button>
                    <button 
                        onClick={() => setView('history')}
                        className="px-4 py-2 font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Invoice History
                    </button>
                </div>
                <button onClick={() => setShowPreview(true)} className="px-4 py-2 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-semibold rounded-lg hover:bg-emerald-600/20 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined">visibility</span> Preview Invoice
                </button>
            </div>
            
            {toast && (
                <div className={`mb-6 p-4 rounded-xl font-bold flex items-center justify-between ${toast.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span>{toast.msg}</span>
                    <button onClick={() => setToast(null)}><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
            )}

            <form onSubmit={handleSendInvoice} className="space-y-10">
                {/* Meta Fields */}
                <div className="p-6 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 space-y-4 lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-3">
                        <span className="material-symbols-outlined text-emerald-600">info</span> Invoice Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Invoice Number</label>
                            <input required type="text" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Issue Date</label>
                            <input required type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Due Date</label>
                            <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" />
                        </div>
                    </div>
                </div>

                {/* SENDER & RECEIVER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sender Details */}
                    <div className="p-6 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-3">
                            <span className="material-symbols-outlined text-emerald-600">store</span> From (Sender)
                        </h4>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Company Name</label>
                            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Address (Use \n for new line)</label>
                            <textarea value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} rows={2} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-500">Email / Website</label>
                                <input type="text" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-500">Phone</label>
                                <input type="text" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Receiver Details */}
                    <div className="p-6 rounded-xl border border-gray-100 dark:border-white/5 bg-emerald-50/50 dark:bg-emerald-900/10 space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-900/30 pb-3">
                            <span className="material-symbols-outlined text-emerald-600">person</span> Invoice To (Receiver)
                        </h4>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Customer / Company Name</label>
                            <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" placeholder="Client Name" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Address (Billing)</label>
                            <textarea required value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={2} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" placeholder="123 Client St..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Delivery Address (Shipping)</label>
                            <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} rows={2} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" placeholder="Same as billing if left empty" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-500">Email</label>
                                <input required type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" placeholder="client@email.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-500">Phone</label>
                                <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" placeholder="+1 234..." />
                            </div>
                        </div>
                    </div>
                </div>


                {/* ITEMS */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-500">list_alt</span> Invoice Items
                        </h4>
                        <button type="button" onClick={handleAddItem} className="px-3 py-1.5 bg-gray-100 dark:bg-black/40 text-gray-900 dark:text-white font-semibold rounded-lg text-xs hover:bg-gray-200 transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">add</span> Add Row
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-start bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                <div className="w-full md:flex-1 space-y-3">
                                    <div className="flex items-center gap-2 relative">
                                        <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center shrink-0">
                                            {idx + 1}
                                        </div>
                                        <input 
                                            required 
                                            type="text" 
                                            value={item.name} 
                                            onFocus={() => setActiveProductDropdown(idx)}
                                            onChange={e => {
                                                handleItemChange(idx, 'name', e.target.value);
                                                setActiveProductDropdown(idx);
                                            }}
                                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                                            placeholder="Search Product or Service Name..." 
                                        />

                                        {/* Dropdown */}
                                        {activeProductDropdown === idx && (
                                            <div ref={dropdownRef} className="absolute top-full left-8 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50">
                                                {productsData.filter(p => p.name.toLowerCase().includes(item.name.toLowerCase())).map(product => (
                                                    <div 
                                                        key={product.id} 
                                                        className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                                                        onClick={() => {
                                                            const newItems = [...items];
                                                            newItems[idx] = {
                                                                ...newItems[idx],
                                                                name: product.name,
                                                                description: product.description || '',
                                                                price: product.discountPrice || product.price,
                                                            };
                                                            setItems(newItems);
                                                            setActiveProductDropdown(null);
                                                        }}
                                                    >
                                                        <div className="font-bold text-sm text-gray-900 dark:text-white">{product.name}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5 truncate">{product.description}</div>
                                                        <div className="text-emerald-600 font-bold mt-1 text-xs">₦{(product.discountPrice || product.price).toLocaleString()}</div>
                                                    </div>
                                                ))}
                                                {productsData.filter(p => p.name.toLowerCase().includes(item.name.toLowerCase())).length === 0 && (
                                                    <div className="p-3 text-sm text-gray-500 text-center">No products found for "{item.name}"</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <input type="text" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-xs ml-8 w-[calc(100%-2rem)] text-gray-500" placeholder="Small description (Lorem ipsum dolor sit amet...)" />
                                </div>
                                <div className="w-24">
                                    <label className="block text-[10px] font-bold mb-1 text-gray-500">Unit</label>
                                    <input required type="text" value={item.unit} onChange={e => handleItemChange(idx, 'unit', e.target.value)} className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm text-center" placeholder="Pcs, Hour" />
                                </div>
                                <div className="w-24">
                                    <label className="block text-[10px] font-bold mb-1 text-gray-500">Amount (Qty)</label>
                                    <input required type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm text-center" />
                                </div>
                                <div className="w-32">
                                    <label className="block text-[10px] font-bold mb-1 text-gray-500">Rate (₦)</label>
                                    <input required type="number" min="0" value={item.price} onChange={e => handleItemChange(idx, 'price', Number(e.target.value))} className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm text-right" />
                                </div>
                                <div className="w-32">
                                    <label className="block text-[10px] font-bold mb-1 text-gray-500">Price</label>
                                    <div className="w-full p-2 rounded-lg border border-transparent text-sm text-right font-bold text-gray-900 dark:text-white bg-gray-100/50 dark:bg-black/10">
                                        ₦{(item.quantity * item.price).toLocaleString()}
                                    </div>
                                </div>
                                <div className="pt-5">
                                    {items.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TERMS & TOTALS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                        <label className="block text-xs font-bold mb-2 text-gray-500">Terms & Conditions / Notes</label>
                        <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={4} className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm leading-relaxed" />
                    </div>
                    <div className="bg-gray-50 dark:bg-black/20 p-6 rounded-xl border border-gray-200 dark:border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-500 font-semibold uppercase tracking-wider text-sm">Total Amount</span>
                            <span className="font-bold text-3xl text-emerald-600">₦{totalAmount.toLocaleString()}</span>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:hover:scale-100">
                            {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">send</span>}
                            {loading ? 'Sending Invoice...' : 'Send Invoice Email'}
                        </button>
                    </div>
                </div>
            </form>
            
            {/* Hidden component for capturing image */}
            <div style={{ position: 'fixed', top: -9999, left: -9999, pointerEvents: 'none' }}>
                <div ref={captureRef} style={{ width: '794px' }}>
                    <InvoiceLayout 
                        companyName={companyName} companyAddress={companyAddress} companyEmail={companyEmail} companyPhone={companyPhone}
                        customerName={customerName} customerAddress={customerAddress} customerEmail={customerEmail} customerPhone={customerPhone} deliveryAddress={deliveryAddress}
                        invoiceId={invoiceId} issueDate={issueDate} dueDate={dueDate}
                        items={items} terms={terms} totalAmount={totalAmount}
                    />
                </div>
            </div>
        </div>
    );
};

export default InvoiceGenerator;
