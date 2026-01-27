import React from 'react';
import { Link } from 'react-router-dom';

const UserRequests: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#0d1b0f] dark:text-white transition-colors duration-200 h-screen flex flex-col">
       <header className="h-16 border-b border-[#e7f3e8] dark:border-[#1a331c] bg-white dark:bg-[#0d1b0f] px-8 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-4">
             <Link to="/dashboard" className="text-[#0d1b0f] dark:text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">arrow_back</span> Dashboard
             </Link>
         </div>
         <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-[#0d1b0f] dark:text-white leading-none">Sarah Jenkins</p>
               <p className="text-[10px] text-[#4c9a52] font-medium mt-1">Premium Member</p>
            </div>
            <div className="size-10 rounded-full bg-cover bg-center border-2 border-primary" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDlzj-wBAtiEqVcCQkbe1ukZijtD021qgWBiNH64VaQ-3-nag5ikaN7_SbQhXLTkoZWm9JjtttiJpjobiS10QbBaj1yuiKF6NnlApNmKrkG428M-FwNQObpfAo4nzHd5JDuuKBbsj_sh0bfJ4bb7RMsXBeDzeoEPqMmKbPpuODE8MYHADTg0-fpjk3U7Dc2xt76PzBDDZMBxHT-5SVoMknT7sVZ8BSC43iuRk7YFduPhIMy6rZ2kKKOO0nZiWdrY9lUtgbRbWaQUm2KQAv9HNctTOdzapOLppQ")' }}></div>
         </div>
       </header>

       <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
             <div className="mb-8 flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-black">My Requests</h1>
                    <p className="text-[#4c9a52]">Track maintenance and repairs</p>
                 </div>
                 <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold">
                    <span className="material-symbols-outlined">add</span> New Request
                 </button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                   { id: "#GS-9921", date: "Oct 24, 2023", status: "Scheduled", statusStyle: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", title: "Annual Panel Cleaning & Efficiency Check", type: "5kW Hybrid System", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0m3nZ0RBhLRNfyxr_j9C-lR9ERyMyrPqxD-FLq1pU6j2KGgeYHGSEyATg7YjZ2309ZK9dWmvZvV23nVVkiphg8pm3NgXJHHGkCLGCCMnfU3BPPeMhRYbomnx_NeMZEnVTkesWhAS59GaqVKeaxSdbCpENwSwGstJjjY3Emfg9xrW3c4yl8nd2ZIp1xXQQya9LVLDCaB25TqYFr8O1mRBy-37GFTfTgOGRvJedqBvC_KnKm4_-Hu2L7t11VBG6Th3DMgg69_hkP7s" },
                   { id: "#GS-10243", date: "Nov 02, 2023", status: "Pending Approval", statusStyle: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", title: "Inverter Diagnostic Service", type: "8kW Off-Grid Storage", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuACBpLWGOjFcX2jKgzzV6yVTbVcEA5-7300s_DbUia43yGy2Fs-yRo2f9KBmzQn4R2pfs1CsmgujmpeN54LldkGKDM4VEqvrYSpVWMb7oMeeBKcWdy7GZqINGBDiia_sVyFL2a4lIAKTm_8PBib5DcGMBCZUvV14if9MlNJt8dQByrCKb6viG3_Qa-AIYTH0Aa5wCvxjUYAR35NEjKFDtl--8wX3GAdbX5S3HdAKX-jrLFB8mYSdDzdaAZ_pSlkvsxEHiz1ixE7lEA" },
                   { id: "#GS-8842", date: "Sep 15, 2023", status: "Completed", statusStyle: "bg-primary/20 text-primary dark:bg-primary/10", title: "Battery Storage Health Audit", type: "PowerWall 2.0 Install", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK-fqIGeLBzrx2lTS4yBER-H1N21GqzBbAsaY2SoaKhJfqimxM4RVo6VPFzv6FPPi3BZYxFdG2AfXGMZfiO4pS2uHcDWPgEQp5n3FcLqnu13p0a2wlz0ZfPH9x6ZCMPEFFt7sfISYDrgigdk_pmn2RmAtCWgrOeoxmzWx2AcMRK-WIhLBWX2ujnOT8xKbo_nqtoj65VMWHRSEa2Aa7NUf-HgJbid6YuJ_Lehr9KJBNsyHadMPq-0IljlXcaUfYcV5xaSGlRjCXqBQ" },
                   { id: "#GS-11005", date: "Recent", status: "Action Required", statusStyle: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", title: "Emergency Repair: Surge Event", type: "Please confirm on-site access", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgAgey7P1tcOA-XyJWaSwCtDLmNDCn9ayAf_zkFkDC_IUnTjTd6wXy4tQ8pQGwuYsrE8woHgHvg3d-1wc-Tqg04AXL5rN0Ke6-KatoffCoDZ9f4Csu1gl90bwk85mmsxNnyNynneP8G_i-xjXZ1aPSUh5V0ZP3yXd2LU7fWbM6fYhmM1WNEwu5RQtdfYJ9cqFceIDoR3yhAtuzifuWFHuqpqG8tq2SKerrLllrJ2MwgfN1gq7AVhFHtZ3JS7JZF42bnAQtTTjObXU", alert: true }
                ].map((req, i) => (
                   <div key={i} className={`group bg-white dark:bg-[#0d1b0f] rounded-xl border ${req.alert ? 'border-red-100 dark:border-red-900/30' : 'border-[#e7f3e8] dark:border-[#1a331c]'} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex flex-col md:flex-row">
                         <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                               <div className="flex items-center justify-between mb-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${req.statusStyle}`}>{req.status}</span>
                                  <span className="text-[10px] text-[#4c9a52] font-medium">{req.date}</span>
                               </div>
                               <h3 className="text-lg font-bold">{req.id}</h3>
                               <p className="text-sm text-[#4c9a52] mt-1 font-medium">{req.title}</p>
                               <div className={`mt-4 flex items-center gap-2 text-xs ${req.alert ? 'text-red-600 font-semibold' : 'text-[#4c9a52]'}`}>
                                  <span className="material-symbols-outlined text-sm">{req.alert ? 'warning' : 'inventory_2'}</span>
                                  <span>{req.type}</span>
                               </div>
                            </div>
                            <button className={`mt-6 flex items-center justify-center gap-2 w-full ${req.alert ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-background-light dark:bg-[#1a331c] text-[#0d1b0f] dark:text-white'} hover:brightness-95 rounded-lg py-2 text-sm font-bold transition-all`}>
                               <span>{req.alert ? 'Respond Now' : 'View Details'}</span>
                               <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                         </div>
                         <div className="w-full md:w-40 h-40 md:h-auto bg-cover bg-center" style={{ backgroundImage: `url('${req.img}')` }}></div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default UserRequests;