import React, { useState, useEffect } from 'react';
import { useAffiliate } from '../../context/AffiliateContext';
import { supabase } from '../../config/supabaseClient';

const AffiliateDashboard: React.FC = () => {
  const { affiliateProfile, generateLink, activateAffiliate } = useAffiliate();
  const [stats, setStats] = useState({
    clicks: 0,
    conversions: 0,
    earnings: 0,
    pending: 0
  });
  const [rewards, setRewards] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [activating, setActivating] = useState(false);
  
  // Withdrawal Form State
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [withdrawalMethod, setWithdrawalMethod] = useState('');
  
  const [activeTab, setActiveTab] = useState<'rewards'|'withdrawals'>('rewards');

  useEffect(() => {
    if (!affiliateProfile) return;
    
    fetchDashboardData();
  }, [affiliateProfile]);

  const fetchDashboardData = async () => {
    // Get clicks
    const { count: clicksCount } = await supabase
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('affiliate_id', affiliateProfile.id);
      
    // Get conversions
    const { count: convCount } = await supabase
      .from('affiliate_conversions')
      .select('*', { count: 'exact', head: true })
      .eq('affiliate_id', affiliateProfile.id);
      
    // Get rewards
    const { data: rewardsData } = await supabase
      .from('affiliate_rewards')
      .select(`*, affiliate_conversions(order_id)`)
      .eq('affiliate_id', affiliateProfile.id)
      .order('created_at', { ascending: false });
      
    // Get withdrawals
    const { data: withdrawalsData } = await supabase
      .from('affiliate_withdrawals')
      .select('*')
      .eq('affiliate_id', affiliateProfile.id)
      .order('requested_at', { ascending: false });
      
    if (withdrawalsData) setWithdrawals(withdrawalsData);

    if (rewardsData) {
      setRewards(rewardsData);
      let earnings = 0;
      let pending = 0;
      
      rewardsData.forEach(r => {
        if (r.reward_type === 'cash') {
          if (r.status === 'Available' || r.status === 'Approved' || r.status === 'Paid') {
            earnings += Number(r.monetary_amount || 0);
          } else if (r.status === 'Pending') {
            pending += Number(r.monetary_amount || 0);
          }
        }
      });
      
      // Subtract pending withdrawals from available earnings
      let withdrawnOrPending = 0;
      if (withdrawalsData) {
        withdrawalsData.forEach(w => {
           if (w.status === 'Pending' || w.status === 'Paid') {
             withdrawnOrPending += Number(w.amount || 0);
           }
        });
      }
      
      setStats({
        clicks: clicksCount || 0,
        conversions: convCount || 0,
        earnings: Math.max(0, earnings - withdrawnOrPending),
        pending
      });
    }
  };

  const handleCopy = () => {
    const link = generateLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivate = async () => {
    setActivating(true);
    await activateAffiliate();
    setActivating(false);
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawalAmount > stats.earnings) {
      alert("Insufficient available earnings.");
      return;
    }
    
    // Call secure edge function
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    
    if (!token) {
      alert("You must be logged in to request a withdrawal.");
      return;
    }

    const { data, error } = await supabase.functions.invoke('process-affiliate-withdrawal', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        amount: withdrawalAmount,
        paymentMethod: withdrawalMethod
      }
    });

    if (error) {
      console.error(error);
      alert(error.message || "Failed to process withdrawal request.");
      return;
    }
    
    setShowWithdrawalModal(false);
    fetchDashboardData();
  };

  if (!affiliateProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-6xl text-primary mb-4">volunteer_activism</span>
        <h2 className="text-2xl font-black text-forest dark:text-white mb-2">Refer, Sell & Earn</h2>
        <p className="text-forest/70 dark:text-white/70 max-w-md mb-8">
          Join our affiliate program and earn cash, discounts, or free salon bookings for every customer you refer to Greenlife Solar.
        </p>
        <button 
          onClick={handleActivate}
          disabled={activating}
          className="px-8 py-4 bg-primary text-forest font-bold rounded-xl hover:scale-105 transition-transform text-lg"
        >
          {activating ? 'Activating...' : 'Activate Affiliate Account'}
        </button>
      </div>
    );
  }

  const link = generateLink();

  return (
    <div className="space-y-6">
      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#152a17] p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-forest dark:text-white">Request Withdrawal</h3>
            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-forest/70 dark:text-white/70">Amount (₦)</label>
                <input 
                  type="number" 
                  max={stats.earnings}
                  min={1000}
                  required
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                  className="w-full p-3 rounded-lg border dark:bg-black/20 dark:border-white/10 dark:text-white mt-1" 
                />
                <p className="text-xs text-primary mt-1">Available: ₦{stats.earnings.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-forest/70 dark:text-white/70">Payment Method / Bank Details</label>
                <textarea 
                  required
                  rows={3}
                  value={withdrawalMethod}
                  onChange={(e) => setWithdrawalMethod(e.target.value)}
                  placeholder="e.g. GTBank - 0123456789 - John Doe"
                  className="w-full p-3 rounded-lg border dark:bg-black/20 dark:border-white/10 dark:text-white mt-1 resize-none" 
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 py-3 font-bold rounded-lg bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 font-bold rounded-lg bg-primary text-forest"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#152a17] p-6 rounded-3xl shadow-xl border border-forest/5 dark:border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-forest dark:text-white">Affiliate Dashboard</h2>
            <p className="text-forest/70 dark:text-white/70">Your Affiliate Code: <strong className="text-primary">{affiliateProfile.affiliate_code}</strong></p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm">
            Status: {affiliateProfile.status}
          </div>
        </div>

        <div className="bg-forest/5 dark:bg-white/5 p-4 rounded-xl mb-6">
          <p className="text-sm font-bold text-forest/80 dark:text-white/80 mb-2">Your General Referral Link</p>
          <div className="flex gap-2 items-center bg-white dark:bg-black/20 p-2 rounded-lg border border-forest/10 dark:border-white/10">
            <input 
              type="text" 
              value={link} 
              readOnly 
              className="flex-1 bg-transparent border-none outline-none text-sm text-forest dark:text-white px-2 truncate"
            />
            <button 
              onClick={handleCopy}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-forest/50 dark:text-white/50 mt-2">
            Share this link anywhere. You can also generate product-specific links from any product page.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="text-forest/50 dark:text-white/50 text-xs font-bold uppercase mb-1">Clicks</div>
            <div className="text-2xl font-black text-forest dark:text-white">{stats.clicks}</div>
          </div>
          <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="text-forest/50 dark:text-white/50 text-xs font-bold uppercase mb-1">Conversions</div>
            <div className="text-2xl font-black text-forest dark:text-white">{stats.conversions}</div>
          </div>
          <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="text-forest/50 dark:text-white/50 text-xs font-bold uppercase mb-1">Available Earnings</div>
            <div className="text-2xl font-black text-primary">₦{stats.earnings.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="text-forest/50 dark:text-white/50 text-xs font-bold uppercase mb-1">Pending</div>
            <div className="text-2xl font-black text-orange-500">₦{stats.pending.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={() => setShowWithdrawalModal(true)}
            disabled={stats.earnings < 1000}
            className="bg-forest text-white dark:bg-white dark:text-forest px-6 py-3 rounded-xl font-bold disabled:opacity-50"
          >
            Request Withdrawal
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#152a17] p-6 rounded-3xl shadow-xl border border-forest/5 dark:border-white/5">
        
        <div className="flex space-x-6 border-b border-forest/10 dark:border-white/10 mb-6">
          <button 
            onClick={() => setActiveTab('rewards')}
            className={`pb-2 font-bold transition-colors ${activeTab === 'rewards' ? 'text-primary border-b-2 border-primary' : 'text-forest/60 dark:text-white/60'}`}
          >
            Reward History
          </button>
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={`pb-2 font-bold transition-colors ${activeTab === 'withdrawals' ? 'text-primary border-b-2 border-primary' : 'text-forest/60 dark:text-white/60'}`}
          >
            Withdrawals
          </button>
        </div>

        {activeTab === 'rewards' && (
          <>
            {rewards.length === 0 ? (
              <p className="text-forest/60 dark:text-white/60 text-sm italic">No rewards yet. Share your link to start earning!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-forest/5 dark:bg-white/5">
                    <tr>
                      <th className="p-3 font-bold text-forest dark:text-white rounded-tl-lg">Date</th>
                      <th className="p-3 font-bold text-forest dark:text-white">Order ID</th>
                      <th className="p-3 font-bold text-forest dark:text-white">Reward Type</th>
                      <th className="p-3 font-bold text-forest dark:text-white">Value</th>
                      <th className="p-3 font-bold text-forest dark:text-white rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/5 dark:divide-white/5">
                    {rewards.map(r => (
                      <tr key={r.id}>
                        <td className="p-3 text-forest/80 dark:text-white/80">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td className="p-3 text-forest/80 dark:text-white/80">#{String(r.affiliate_conversions?.order_id).substring(0, 8)}</td>
                        <td className="p-3 text-forest/80 dark:text-white/80 capitalize">{r.reward_type}</td>
                        <td className="p-3 font-bold text-forest dark:text-white">
                          {r.reward_type === 'cash' ? `₦${Number(r.monetary_amount).toLocaleString()}` : 
                           r.reward_type === 'coupon' ? `Code: ${r.coupon_id || 'PENDING'}` : 
                           r.reward_type === 'salon' ? 'Free Booking' : '-'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            r.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                            r.status === 'Available' ? 'bg-green-100 text-green-700' :
                            r.status === 'Paid' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'withdrawals' && (
          <>
            {withdrawals.length === 0 ? (
              <p className="text-forest/60 dark:text-white/60 text-sm italic">No withdrawal requests found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-forest/5 dark:bg-white/5">
                    <tr>
                      <th className="p-3 font-bold text-forest dark:text-white rounded-tl-lg">Date</th>
                      <th className="p-3 font-bold text-forest dark:text-white">Amount</th>
                      <th className="p-3 font-bold text-forest dark:text-white">Payment Info</th>
                      <th className="p-3 font-bold text-forest dark:text-white rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/5 dark:divide-white/5">
                    {withdrawals.map(w => (
                      <tr key={w.id}>
                        <td className="p-3 text-forest/80 dark:text-white/80">{new Date(w.requested_at).toLocaleDateString()}</td>
                        <td className="p-3 font-bold text-forest dark:text-white">₦{Number(w.amount).toLocaleString()}</td>
                        <td className="p-3 text-forest/80 dark:text-white/80">{w.payment_method}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            w.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                            w.status === 'Paid' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AffiliateDashboard;
