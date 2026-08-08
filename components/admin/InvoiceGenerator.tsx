import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { productsData } from '../../data/products';

const InvoiceGenerator: React.FC = () => {
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
    const [accountNo, setAccountNo] = useState('');
    const [taxId, setTaxId] = useState('');
    
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

    const handleSendInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setToast(null);

        try {
            const payload = {
                sender: { companyName, companyAddress, companyEmail, companyPhone },
                receiver: { customerName, customerAddress, customerEmail, customerPhone },
                meta: { invoiceId, accountNo, taxId, issueDate, dueDate },
                items,
                terms,
                totalAmount
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
                    <div className="bg-white shadow-2xl overflow-hidden aspect-[1/1.414] text-gray-800 relative select-text">
                        {/* Header Section */}
                        <div className="p-12 pb-8 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-600 flex items-center justify-center rounded text-white text-2xl font-black rounded-tl-xl rounded-br-xl">
                                    <span className="material-symbols-outlined">solar_power</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black uppercase text-gray-900 leading-tight">{companyName}</h1>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-black uppercase tracking-widest text-gray-900">INVOICE</h2>
                                <div className="w-full h-1 bg-emerald-600 mt-2"></div>
                            </div>
                        </div>

                        {/* Middle Section (Addresses & Meta) */}
                        <div className="px-12 py-6 flex justify-between items-start gap-12">
                            {/* Invoice To */}
                            <div className="flex-1">
                                <div className="bg-emerald-600 text-white text-xs font-bold uppercase py-1 px-3 inline-block mb-3">INVOICE TO:</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{customerName || 'Customer Name'}</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p className="flex items-start gap-2 whitespace-pre-line"><span className="w-4 font-bold text-gray-400">A</span> {customerAddress || 'Customer Address'}</p>
                                    <p className="flex items-start gap-2"><span className="w-4 font-bold text-gray-400">W</span> {customerEmail || 'customer@email.com'}</p>
                                    <p className="flex items-start gap-2"><span className="w-4 font-bold text-gray-400">P</span> {customerPhone || 'Customer Phone'}</p>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="w-64 text-sm">
                                <div className="grid grid-cols-2 gap-y-1 text-gray-600">
                                    <span>Invoice</span><span className="text-gray-900"># {invoiceId}</span>
                                    <span>Account</span><span className="text-gray-900"># {accountNo || 'N/A'}</span>
                                    <span>Tax ID</span><span className="text-gray-900"># {taxId || 'N/A'}</span>
                                    <div className="col-span-2 h-4"></div>
                                    <span>Date</span><span className="text-gray-900">: {new Date(issueDate).toLocaleDateString()}</span>
                                    <span>Due Date</span><span className="text-gray-900">: {new Date(dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="px-12 py-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-emerald-600 text-white text-left font-bold text-xs uppercase">
                                        <th className="p-3 w-12 text-center">SL</th>
                                        <th className="p-3">Description</th>
                                        <th className="p-3 text-center">Unit</th>
                                        <th className="p-3 text-center">Amount</th>
                                        <th className="p-3 text-right">Rate</th>
                                        <th className="p-3 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'}>
                                            <td className="p-4 text-center text-gray-500 font-medium">{(idx + 1).toString().padStart(2, '0')}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-emerald-600">{item.name || 'Item Name'}</div>
                                                <div className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description || 'Item description...'}</div>
                                            </td>
                                            <td className="p-4 text-center text-gray-600">{item.unit || 'Pcs'}</td>
                                            <td className="p-4 text-center text-gray-600">{item.quantity}</td>
                                            <td className="p-4 text-right text-gray-600">₦{Number(item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                            <td className="p-4 text-right font-medium text-gray-900">₦{(item.quantity * item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total & Signatures */}
                        <div className="px-12 py-6 flex justify-between items-start">
                            {/* Notes */}
                            <div className="flex-1 pr-12">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-gray-900 text-lg">asterisk</span>
                                    <h4 className="font-bold text-emerald-600 text-sm">Terms & Conditions/Notes:</h4>
                                </div>
                                <div className="text-xs text-gray-500 leading-relaxed whitespace-pre-line ml-7">
                                    {terms}
                                </div>
                            </div>
                            
                            {/* Totals & Signature */}
                            <div className="w-64">
                                <div className="bg-emerald-600 text-white flex justify-between items-center p-3 font-bold mb-12">
                                    <span>Total:</span>
                                    <span className="text-lg">₦{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                
                                <div className="text-center mt-16 pt-2 border-t border-gray-900">
                                    {/* Placeholder for cursive signature, using a script font or simple text for now */}
                                    <div className="font-[cursive] text-2xl mb-2 text-gray-800" style={{fontFamily: "'Brush Script MT', cursive"}}>Greenlife</div>
                                    <p className="text-xs text-gray-500">Signature of Invoice Holder</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Graphic & Contacts */}
                        <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden flex flex-col justify-end pointer-events-none">
                            {/* Wavy Shapes */}
                            <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full z-0 translate-y-24 scale-y-150">
                                <path fill="#1a1a1a" fillOpacity="1" d="M0,224L60,202.7C120,181,240,139,360,138.7C480,139,600,181,720,202.7C840,224,960,224,1080,213.3C1200,203,1320,181,1380,170.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                            </svg>
                            <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full z-10 translate-y-16">
                                <path fill="#059669" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,117.3C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                            </svg>
                            
                            {/* Contact Bar */}
                            <div className="relative z-20 flex justify-between items-center px-12 py-6 text-xs text-gray-800 bg-gray-100 bg-opacity-80 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">location_on</span></div>
                                    <span className="whitespace-pre-line">{companyAddress.replace('\n', ', ')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">language</span></div>
                                    <span>{companyEmail}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">call</span></div>
                                    <span>{companyPhone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#152a17] rounded-2xl border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm p-6 md:p-8 mt-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Invoice Editor</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details accurately to match the professional template.</p>
                </div>
                <button onClick={() => setShowPreview(true)} className="px-4 py-2 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg hover:bg-emerald-600/20 transition-all flex items-center gap-2">
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
                {/* SENDER & RECEIVER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sender Details */}
                    <div className="p-6 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 space-y-4">
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-3">
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
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-900/30 pb-3">
                            <span className="material-symbols-outlined text-emerald-600">person</span> Invoice To (Receiver)
                        </h4>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Customer / Company Name</label>
                            <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" placeholder="Client Name" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Address</label>
                            <textarea required value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={2} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" placeholder="123 Client St..." />
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

                {/* META INFO */}
                <div className="p-6 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-3 mb-4">
                        <span className="material-symbols-outlined text-gray-500">info</span> Invoice Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Invoice #</label>
                            <input required type="text" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Account #</label>
                            <input type="text" value={accountNo} onChange={e => setAccountNo(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" placeholder="Optional" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Tax ID</label>
                            <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" placeholder="Optional" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Date</label>
                            <input required type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-500">Due Date</label>
                            <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 dark:bg-black/40 text-sm" />
                        </div>
                    </div>
                </div>

                {/* ITEMS */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-500">list_alt</span> Invoice Items
                        </h4>
                        <button type="button" onClick={handleAddItem} className="px-3 py-1.5 bg-gray-100 dark:bg-black/40 text-gray-900 dark:text-white font-bold rounded-lg text-xs hover:bg-gray-200 transition-colors flex items-center gap-1">
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
                            <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Total Amount</span>
                            <span className="font-black text-3xl text-emerald-600">₦{totalAmount.toLocaleString()}</span>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-white font-black rounded-xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:hover:scale-100">
                            {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">send</span>}
                            {loading ? 'Sending Invoice...' : 'Send Invoice Email'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default InvoiceGenerator;
