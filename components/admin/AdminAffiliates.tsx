import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';

const AdminAffiliates: React.FC = () => {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch affiliates
    const { data: affData } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (affData) setAffiliates(affData);
    
    // Fetch reward requests (cash rewards that need approval)
    const { data: rewData } = await supabase
      .from('affiliate_rewards')
      .select(`
        *,
        affiliate_profiles (affiliate_code, user_id)
      `)
      .order('created_at', { ascending: false });
      
    if (rewData) setRewards(rewData);
    
    setLoading(false);
  };

  const updateRewardStatus = async (rewardId: string, status: string) => {
    await supabase
      .from('affiliate_rewards')
      .update({ status })
      .eq('id', rewardId);
    
    fetchData();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-[#152a17] p-6 rounded-2xl shadow-sm border border-[#e7f3e8] dark:border-[#2a3a2c]">
        <h2 className="text-xl font-bold mb-4">Affiliate Programs Management</h2>
        
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4">Reward Approvals</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#e7f3e8] dark:bg-white/5">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Affiliate Code</th>
                  <th className="p-3">Reward Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7f3e8] dark:divide-white/5">
                {rewards.map(r => (
                  <tr key={r.id}>
                    <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-3">{r.affiliate_profiles?.affiliate_code}</td>
                    <td className="p-3 capitalize">{r.reward_type}</td>
                    <td className="p-3 font-bold">
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
                    <td className="p-3">
                      {r.status === 'Available' && r.reward_type === 'cash' && (
                        <button 
                          onClick={() => updateRewardStatus(r.id, 'Paid')}
                          className="bg-primary text-forest px-3 py-1 rounded text-xs font-bold"
                        >
                          Mark Paid
                        </button>
                      )}
                      {r.status === 'Pending' && (
                        <button 
                          onClick={() => updateRewardStatus(r.id, 'Available')}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {rewards.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">No rewards found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">Registered Affiliates ({affiliates.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#e7f3e8] dark:bg-white/5">
                <tr>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3">Affiliate Code</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7f3e8] dark:divide-white/5">
                {affiliates.map(a => (
                  <tr key={a.id}>
                    <td className="p-3">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="p-3 font-bold">{a.affiliate_code}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3">₦{Number(a.total_earnings || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAffiliates;
