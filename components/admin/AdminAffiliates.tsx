import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';

type Tab = 'affiliates' | 'rules' | 'withdrawals';

const AdminAffiliates: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('affiliates');
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]); // for rewards waiting to be "Available"
  const [rules, setRules] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Rule Form State
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    name: '',
    reward_type: 'cash',
    fixed_amount: 0,
    percentage_rate: 0,
    minimum_order_amount: 0,
    active: true
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    
    if (activeTab === 'affiliates') {
      const { data: affData } = await supabase.from('affiliate_profiles').select('*').order('created_at', { ascending: false });
      if (affData) setAffiliates(affData);
      
      const { data: rewData } = await supabase.from('affiliate_rewards').select(`*, affiliate_profiles (affiliate_code, user_id)`).order('created_at', { ascending: false });
      if (rewData) setRewards(rewData);
    } else if (activeTab === 'rules') {
      const { data: rulesData } = await supabase.from('affiliate_reward_rules').select('*').order('created_at', { ascending: false });
      if (rulesData) setRules(rulesData);
    } else if (activeTab === 'withdrawals') {
      const { data: withData } = await supabase.from('affiliate_withdrawals').select(`*, affiliate_profiles (affiliate_code)`).order('requested_at', { ascending: false });
      if (withData) setWithdrawals(withData);
    }
    
    setLoading(false);
  };

  const updateRewardStatus = async (rewardId: string, status: string) => {
    await supabase.from('affiliate_rewards').update({ status }).eq('id', rewardId);
    fetchData();
  };

  const updateWithdrawalStatus = async (withdrawalId: string, status: string) => {
    await supabase.from('affiliate_withdrawals').update({ 
      status,
      reviewed_at: new Date().toISOString(),
      ...(status === 'Paid' ? { paid_at: new Date().toISOString() } : {})
    }).eq('id', withdrawalId);
    fetchData();
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRuleId) {
      await supabase.from('affiliate_reward_rules').update(newRule).eq('id', editingRuleId);
    } else {
      await supabase.from('affiliate_reward_rules').insert([newRule]);
    }
    setShowRuleForm(false);
    setEditingRuleId(null);
    fetchData();
  };

  const handleEditRule = (rule: any) => {
    setNewRule(rule);
    setEditingRuleId(rule.id);
    setShowRuleForm(true);
  };

  const handleDeleteRule = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      await supabase.from('affiliate_reward_rules').delete().eq('id', id);
      fetchData();
    }
  };

  const handleEditReward = async (reward: any) => {
    const newAmount = prompt(`Enter new amount for this ${reward.reward_type} reward:`, reward.monetary_amount);
    if (newAmount !== null && !isNaN(Number(newAmount))) {
      await supabase.from('affiliate_rewards').update({ monetary_amount: Number(newAmount) }).eq('id', reward.id);
      fetchData();
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      await supabase.from('affiliate_rewards').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#152a17] p-6 rounded-2xl shadow-sm border border-[#e7f3e8] dark:border-[#2a3a2c]">
        <h2 className="text-2xl font-bold mb-6">Affiliate Management</h2>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-[#e7f3e8] dark:border-white/10">
          <button 
            className={`pb-2 font-bold ${activeTab === 'affiliates' ? 'border-b-2 border-primary text-primary' : 'opacity-60'}`}
            onClick={() => setActiveTab('affiliates')}
          >
            Affiliates & Approvals
          </button>
          <button 
            className={`pb-2 font-bold ${activeTab === 'rules' ? 'border-b-2 border-primary text-primary' : 'opacity-60'}`}
            onClick={() => setActiveTab('rules')}
          >
            Reward Rules
          </button>
          <button 
            className={`pb-2 font-bold ${activeTab === 'withdrawals' ? 'border-b-2 border-primary text-primary' : 'opacity-60'}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Withdrawals
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center opacity-60 font-bold">Loading...</div>
        ) : (
          <div>
            {activeTab === 'affiliates' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-lg mb-4">Reward Approvals</h3>
                  <div className="overflow-x-auto rounded-xl border border-[#e7f3e8] dark:border-white/10">
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
                              <div className="flex gap-2">
                                {r.status === 'Pending' && (
                                  <button 
                                    onClick={() => updateRewardStatus(r.id, 'Available')}
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleEditReward(r)}
                                  className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteReward(r.id)}
                                  className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {rewards.length === 0 && (
                          <tr><td colSpan={6} className="p-4 text-center text-gray-500">No rewards found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-4">Registered Affiliates ({affiliates.length})</h3>
                  <div className="overflow-x-auto rounded-xl border border-[#e7f3e8] dark:border-white/10">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#e7f3e8] dark:bg-white/5">
                        <tr>
                          <th className="p-3">Joined Date</th>
                          <th className="p-3">Affiliate Code</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e7f3e8] dark:divide-white/5">
                        {affiliates.map(a => (
                          <tr key={a.id}>
                            <td className="p-3">{new Date(a.created_at).toLocaleDateString()}</td>
                            <td className="p-3 font-bold">{a.affiliate_code}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                a.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <button className="text-primary hover:underline font-bold text-xs">Manage</button>
                            </td>
                          </tr>
                        ))}
                        {affiliates.length === 0 && (
                          <tr><td colSpan={4} className="p-4 text-center text-gray-500">No affiliates found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Reward Rules</h3>
                  <button 
                    onClick={() => {
                      setNewRule({
                        name: '', reward_type: 'cash', fixed_amount: 0, percentage_rate: 0, minimum_order_amount: 0, active: true
                      });
                      setEditingRuleId(null);
                      setShowRuleForm(!showRuleForm);
                    }}
                    className="bg-primary text-forest px-4 py-2 rounded-lg font-bold text-sm"
                  >
                    {showRuleForm ? 'Close Form' : '+ Add New Rule'}
                  </button>
                </div>

                {showRuleForm && (
                  <form onSubmit={handleCreateRule} className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl space-y-4 border border-[#e7f3e8] dark:border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">Rule Name</label>
                        <input required type="text" className="w-full p-2 rounded border dark:bg-black/50" value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Reward Type</label>
                        <select className="w-full p-2 rounded border dark:bg-black/50" value={newRule.reward_type} onChange={e => setNewRule({...newRule, reward_type: e.target.value})}>
                          <option value="cash">Cash (Commission)</option>
                          <option value="coupon">Discount Coupon</option>
                          <option value="salon">Free Salon Booking</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Fixed Amount (₦)</label>
                        <input type="number" className="w-full p-2 rounded border dark:bg-black/50" value={newRule.fixed_amount} onChange={e => setNewRule({...newRule, fixed_amount: Number(e.target.value)})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Percentage Rate (%)</label>
                        <input type="number" step="0.1" className="w-full p-2 rounded border dark:bg-black/50" value={newRule.percentage_rate} onChange={e => setNewRule({...newRule, percentage_rate: Number(e.target.value)})} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowRuleForm(false)} className="px-4 py-2 text-sm font-bold">Cancel</button>
                      <button type="submit" className="bg-primary text-forest px-4 py-2 rounded-lg font-bold text-sm">Save Rule</button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto rounded-xl border border-[#e7f3e8] dark:border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#e7f3e8] dark:bg-white/5">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Reward Value</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e7f3e8] dark:divide-white/5">
                      {rules.map(r => (
                        <tr key={r.id}>
                          <td className="p-3 font-bold">{r.name}</td>
                          <td className="p-3 capitalize">{r.reward_type}</td>
                          <td className="p-3">
                            {r.percentage_rate > 0 ? `${r.percentage_rate}%` : `₦${Number(r.fixed_amount).toLocaleString()}`}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              r.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {r.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-3 flex gap-2">
                            <button onClick={() => handleEditRule(r)} className="text-blue-500 hover:underline text-xs font-bold">Edit</button>
                            <button onClick={() => handleDeleteRule(r.id)} className="text-red-500 hover:underline text-xs font-bold">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {rules.length === 0 && (
                        <tr><td colSpan={4} className="p-4 text-center text-gray-500">No rules found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Withdrawal Requests</h3>
                <div className="overflow-x-auto rounded-xl border border-[#e7f3e8] dark:border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#e7f3e8] dark:bg-white/5">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Affiliate Code</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e7f3e8] dark:divide-white/5">
                      {withdrawals.map(w => (
                        <tr key={w.id}>
                          <td className="p-3">{new Date(w.requested_at).toLocaleDateString()}</td>
                          <td className="p-3">{w.affiliate_profiles?.affiliate_code}</td>
                          <td className="p-3 font-bold">₦{Number(w.amount).toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              w.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                              w.status === 'Paid' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="p-3 flex gap-2">
                            {w.status === 'Pending' && (
                              <>
                                <button 
                                  onClick={() => updateWithdrawalStatus(w.id, 'Paid')}
                                  className="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold"
                                >
                                  Mark Paid
                                </button>
                                <button 
                                  onClick={() => updateWithdrawalStatus(w.id, 'Rejected')}
                                  className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                      {withdrawals.length === 0 && (
                        <tr><td colSpan={5} className="p-4 text-center text-gray-500">No withdrawals found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAffiliates;
