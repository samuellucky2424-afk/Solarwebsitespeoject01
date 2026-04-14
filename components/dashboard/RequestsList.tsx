import React, { useMemo, useState } from 'react';
import { useAdmin, ServiceRequest } from '../../context/AdminContext';

const RequestsList: React.FC = () => {
    const { requests, activeUser } = useAdmin();
    const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);

    const userRequests = useMemo(() => {
        if (!activeUser) return [];
        return requests.filter(req => req.userId === activeUser.id || req.phone === activeUser.phone || req.email === activeUser.email);
    }, [requests, activeUser]);

    const getStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('scheduled') || s.includes('new')) return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
        if (s.includes('pending') || s.includes('progress')) return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
        if (s.includes('completed') || s.includes('approved')) return "bg-primary/20 text-primary dark:bg-primary/10";
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getFallbackImage = (type: string) => {
        if (type.includes('Cleaning')) return "https://lh3.googleusercontent.com/aida-public/AB6AXuD0m3nZ0RBhLRNfyxr_j9C-lR9ERyMyrPqxD-FLq1pU6j2KGgeYHGSEyATg7YjZ2309ZK9dWmvZvV23nVVkiphg8pm3NgXJHHGkCLGCCMnfU3BPPeMhRYbomnx_NeMZEnVTkesWhAS59GaqVKeaxSdbCpENwSwGstJjjY3Emfg9xrW3c4yl8nd2ZIp1xXQQya9LVLDCaB25TqYFr8O1mRBy-37GFTfTgOGRvJedqBvC_KnKm4_-Hu2L7t11VBG6Th3DMgg69_hkP7s";
        if (type.includes('Diagnostic')) return "https://lh3.googleusercontent.com/aida-public/AB6AXuACBpLWGOjFcX2jKgzzV6yVTbVcEA5-7300s_DbUia43yGy2Fs-yRo2f9KBmzQn4R2pfs1CsmgujmpeN54LldkGKDM4VEqvrYSpVWMb7oMeeBKcWdy7GZqINGBDiia_sVyFL2a4lIAKTm_8PBib5DcGMBCZUvV14if9MlNJt8dQByrCKb6viG3_Qa-AIYTH0Aa5wCvxjUYAR35NEjKFDtl--8wX3GAdbX5S3HdAKX-jrLFB8mYSdDzdaAZ_pSlkvsxEHiz1ixE7lEA";
        if (type.includes('Health Audit') || type.includes('Maintenance')) return "https://lh3.googleusercontent.com/aida-public/AB6AXuDK-fqIGeLBzrx2lTS4yBER-H1N21GqzBbAsaY2SoaKhJfqimxM4RVo6VPFzv6FPPi3BZYxFdG2AfXGMZfiO4pS2uHcDWPgEQp5n3FcLqnu13p0a2wlz0ZfPH9x6ZCMPEFFt7sfISYDrgigdk_pmn2RmAtCWgrOeoxmzWx2AcMRK-WIhLBWX2ujnOT8xKbo_nqtoj65VMWHRSEa2Aa7NUf-HgJbid6YuJ_Lehr9KJBNsyHadMPq-0IljlXcaUfYcV5xaSGlRjCXqBQ";
        if (type.includes('Emergency') || type.includes('Repair')) return "https://lh3.googleusercontent.com/aida-public/AB6AXuBgAgey7P1tcOA-XyJWaSwCtDLmNDCn9ayAf_zkFkDC_IUnTjTd6wXy4tQ8pQGwuYsrE8woHgHvg3d-1wc-Tqg04AXL5rN0Ke6-KatoffCoDZ9f4Csu1gl90bwk85mmsxNnyNynneP8G_i-xjXZ1aPSUh5V0ZP3yXd2LU7fWbM6fYhmM1WNEwu5RQtdfYJ9cqFceIDoR3yhAtuzifuWFHuqpqG8tq2SKerrLllrJ2MwgfN1gq7AVhFHtZ3JS7JZF42bnAQtTTjObXU";
        return "https://placehold.co/600x400?text=Service+Request";
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in relative">
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold">My Requests</h2>
                <button className="flex items-center gap-1.5 bg-primary text-forest font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:brightness-105 text-xs md:text-sm">
                    <span className="material-symbols-outlined text-base md:text-lg">add</span> New Request
                </button>
            </div>

            {userRequests.length === 0 ? (
                 <div className="p-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-center">
                     <span className="material-symbols-outlined text-4xl text-gray-400 mb-2 block">assignment</span>
                     <p className="text-gray-500 dark:text-gray-400 mb-4">You have no active requests.</p>
                 </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {userRequests.map((req, i) => {
                        const style = getStatusStyle(req.status);
                        const isAlert = req.priority === 'High';
                        const image = getFallbackImage(req.title || req.type);

                        return (
                            <div key={req.id} className={`group flex flex-col md:flex-row bg-white dark:bg-[#0d1b0f] rounded-xl border ${isAlert ? 'border-red-100 dark:border-red-900/30' : 'border-[#e7f3e8] dark:border-[#1a331c]'} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                                <div className="flex-1 p-4 md:p-5 flex flex-col justify-between order-2 md:order-1">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${style}`}>{req.status}</span>
                                            <span className="text-[9px] md:text-[10px] text-[#4c9a52] font-medium">{req.date}</span>
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold">{req.id.substring(0, 10)}...</h3>
                                        <p className="text-xs md:text-sm text-[#4c9a52] mt-1 font-medium">{req.title}</p>
                                        <div className={`mt-3 md:mt-4 flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs ${isAlert ? 'text-red-600 font-semibold' : 'text-[#4c9a52]'}`}>
                                            <span className="material-symbols-outlined text-xs md:text-sm">{isAlert ? 'warning' : 'inventory_2'}</span>
                                            <span>{req.type}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedReq(req)}
                                        className={`mt-4 md:mt-6 flex items-center justify-center gap-1.5 md:gap-2 w-full ${isAlert ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-background-light dark:bg-[#1a331c] text-[#0d1b0f] dark:text-white'} hover:brightness-95 rounded-lg py-1.5 md:py-2 text-xs md:text-sm font-bold transition-all`}>
                                        <span>{isAlert ? 'Respond Now' : 'View Details'}</span>
                                        <span className="material-symbols-outlined text-xs md:text-sm">arrow_forward</span>
                                    </button>
                                </div>
                                <div className="w-full h-32 md:h-auto md:w-32 lg:w-40 bg-cover bg-center order-1 md:order-2 shrink-0" style={{ backgroundImage: `url('${image}')` }}></div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal for Request Details */}
            {selectedReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#0d1b0f] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-2xl relative">
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedReq(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        
                        {/* Cover Image inside modal */}
                        <div 
                            className="h-48 w-full bg-cover bg-center rounded-t-2xl" 
                            style={{ backgroundImage: `url('${getFallbackImage(selectedReq.title || selectedReq.type)}')` }}
                        />

                        <div className="p-6 md:p-8 space-y-6">
                            {/* Header info */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(selectedReq.status)}`}>
                                        {selectedReq.status}
                                    </span>
                                    <span className="text-xs font-semibold text-[#4c9a52]">ID: {selectedReq.id}</span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-[#0d1b0f] dark:text-white leading-tight">
                                    {selectedReq.title || selectedReq.type}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Submitted on {selectedReq.date}</p>
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-background-light dark:bg-[#1a331c] p-4 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-1">Service Type</p>
                                    <p className="font-bold text-sm text-[#0d1b0f] dark:text-white flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-primary">inventory_2</span>
                                        {selectedReq.type}
                                    </p>
                                </div>
                                <div className="bg-background-light dark:bg-[#1a331c] p-4 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-1">Priority</p>
                                    <p className={`font-bold text-sm flex items-center gap-1.5 ${selectedReq.priority === 'High' ? 'text-red-500' : 'text-[#0d1b0f] dark:text-white'}`}>
                                        <span className="material-symbols-outlined text-sm">{selectedReq.priority === 'High' ? 'warning' : 'info'}</span>
                                        {selectedReq.priority}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedReq.description && (
                                <div>
                                    <h3 className="text-sm font-bold text-[#0d1b0f] dark:text-white mb-2">Issue Description</h3>
                                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {selectedReq.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Contact info (If we have an address available) */}
                            {selectedReq.address && (
                                <div>
                                    <h3 className="text-sm font-bold text-[#0d1b0f] dark:text-white mb-2">Service Location</h3>
                                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-4 flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {selectedReq.address}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="pt-4 border-t border-[#cfe7d1] dark:border-[#2a3d2c] flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedReq(null)}
                                    className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    Close
                                </button>
                                {selectedReq.priority === 'High' && (
                                    <button className="px-5 py-2.5 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md shadow-red-500/20">
                                        Respond to Alert
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestsList;

