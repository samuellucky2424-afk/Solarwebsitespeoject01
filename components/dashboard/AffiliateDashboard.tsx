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
  const [copied, setCopied] = useState(false);
  const [activating, setActivating] = useState(false);
  
  useEffect(() => {
    if (!affiliateProfile) return;
    
    const fetchStats = async () => {
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
        
        setStats({
          clicks: clicksCount || 0,
          conversions: convCount || 0,
          earnings,
          pending
        });
      }
    };
    
    fetchStats();
  }, [affiliateProfile]);

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>

      <div className="bg-white dark:bg-[#152a17] p-6 rounded-3xl shadow-xl border border-forest/5 dark:border-white/5">
        <h3 className="text-xl font-bold text-forest dark:text-white mb-4">Reward History</h3>
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
                  <th className="p-3 font-bold text-forest dark:text-white">Amount</th>
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
                      {r.reward_type === 'cash' ? `₦${Number(r.monetary_amount).toLocaleString()}` : '-'}
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
      </div>
    </div>
  );
};

export default AffiliateDashboard;
