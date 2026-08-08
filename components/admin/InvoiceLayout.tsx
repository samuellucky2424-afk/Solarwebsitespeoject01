import React from 'react';

export const InvoiceLayout = ({
    companyName, companyAddress, companyEmail, companyPhone,
    customerName, customerAddress, customerEmail, customerPhone,
    invoiceId, accountNo, taxId, issueDate, dueDate,
    items, terms, totalAmount
}: any) => {
    return (
        <div className="bg-[#ffffff] overflow-hidden text-[#1f2937] relative select-text w-[794px] h-[1123px] box-border">
            {/* Header Section */}
            <div className="p-12 pb-8 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#059669] flex items-center justify-center rounded text-[#ffffff] text-xl font-bold rounded-tl-xl rounded-br-xl">
                        <span className="material-symbols-outlined text-[20px]">solar_power</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold uppercase text-[#111827] leading-tight tracking-wide">{companyName}</h1>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold uppercase tracking-widest text-[#111827]">INVOICE</h2>
                    <div className="w-full h-0.5 bg-[#059669] mt-2"></div>
                </div>
            </div>

            {/* Middle Section (Addresses & Meta) */}
            <div className="px-12 py-6 flex justify-between items-start gap-12">
                {/* Invoice To */}
                <div className="flex-1">
                    <div className="bg-[#059669] text-[#ffffff] text-[10px] font-semibold uppercase py-1 px-3 inline-block mb-3 tracking-wider">INVOICE TO:</div>
                    <h3 className="text-lg font-semibold text-[#111827] mb-2">{customerName || 'Customer Name'}</h3>
                    <div className="text-sm text-[#4b5563] space-y-1">
                        <p className="flex items-start gap-2 whitespace-pre-line"><span className="w-4 font-medium text-[#9ca3af]">A</span> {customerAddress || 'Customer Address'}</p>
                        <p className="flex items-start gap-2"><span className="w-4 font-medium text-[#9ca3af]">W</span> {customerEmail || 'customer@email.com'}</p>
                        <p className="flex items-start gap-2"><span className="w-4 font-medium text-[#9ca3af]">P</span> {customerPhone || 'Customer Phone'}</p>
                    </div>
                </div>

                {/* Meta Info */}
                <div className="w-64 text-sm">
                    <div className="grid grid-cols-2 gap-y-1 text-[#4b5563]">
                        <span>Invoice</span><span className="text-[#111827]"># {invoiceId}</span>
                        <span>Account</span><span className="text-[#111827]"># {accountNo || 'N/A'}</span>
                        <span>Tax ID</span><span className="text-[#111827]"># {taxId || 'N/A'}</span>
                        <div className="col-span-2 h-4"></div>
                        <span>Date</span><span className="text-[#111827]">: {new Date(issueDate).toLocaleDateString()}</span>
                        <span>Due Date</span><span className="text-[#111827]">: {new Date(dueDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="px-12 py-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#059669] text-[#ffffff] text-left font-semibold text-[11px] uppercase tracking-wider">
                            <th className="p-3 w-12 text-center">SL</th>
                            <th className="p-3">Description</th>
                            <th className="p-3 text-center">Unit</th>
                            <th className="p-3 text-center">Amount</th>
                            <th className="p-3 text-right">Rate</th>
                            <th className="p-3 text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any, idx: number) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-[#f3f4f6]' : 'bg-[#f9fafb]'}>
                                <td className="p-3 text-center text-[#6b7280] font-medium">{(idx + 1).toString().padStart(2, '0')}</td>
                                <td className="p-3">
                                    <div className="font-semibold text-[#111827]">{item.name || 'Item Name'}</div>
                                    <div className="text-xs text-[#6b7280] mt-1 leading-relaxed">{item.description || 'Item description...'}</div>
                                </td>
                                <td className="p-3 text-center text-[#4b5563]">{item.unit || 'Pcs'}</td>
                                <td className="p-3 text-center text-[#4b5563]">{item.quantity}</td>
                                <td className="p-3 text-right text-[#4b5563]">₦{Number(item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="p-3 text-right font-medium text-[#111827]">₦{(item.quantity * item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
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
                        <span className="material-symbols-outlined text-[#111827] text-base">asterisk</span>
                        <h4 className="font-semibold text-[#059669] text-sm">Terms & Conditions/Notes:</h4>
                    </div>
                    <div className="text-xs text-[#6b7280] leading-relaxed whitespace-pre-line ml-6">
                        {terms}
                    </div>
                </div>
                
                {/* Totals & Signature */}
                <div className="w-64">
                    <div className="bg-[#059669] text-[#ffffff] flex justify-between items-center p-3 font-semibold mb-12 rounded">
                        <span>Total:</span>
                        <span className="text-lg tracking-wide">₦{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    
                    <div className="text-center mt-16 pt-2 border-t border-[#111827]">
                        {/* Placeholder for cursive signature, using a script font or simple text for now */}
                        <div className="font-[cursive] text-2xl mb-2 text-[#1f2937]" style={{fontFamily: "'Brush Script MT', cursive"}}>Greenlife</div>
                        <p className="text-xs text-[#6b7280]">Signature of Invoice Holder</p>
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
                <div className="relative z-20 flex justify-between items-center px-12 py-6 text-xs text-[#1f2937] bg-[#f3f4f6] bg-opacity-80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#1f2937] text-[#ffffff] rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">location_on</span></div>
                        <span className="whitespace-pre-line">{companyAddress.replace('\n', ', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#059669] text-[#ffffff] rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">language</span></div>
                        <span>{companyEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#1f2937] text-[#ffffff] rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">call</span></div>
                        <span>{companyPhone}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
