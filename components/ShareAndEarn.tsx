import React, { useState, useEffect } from 'react';
import { useAffiliate } from '../context/AffiliateContext';
import { supabase } from '../config/supabaseClient';

interface ShareAndEarnProps {
  productId?: string;
  productName: string;
}

const ShareAndEarn: React.FC<ShareAndEarnProps> = ({ productId, productName }) => {
  const { affiliateProfile, generateLink, activateAffiliate } = useAffiliate();
  const [rewardRule, setRewardRule] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const fetchRule = async () => {
      // Find the highest priority active rule for cash or coupon
      const { data, error } = await supabase
        .from('affiliate_reward_rules')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching reward rule:", error);
      }
        
      if (data) {
        setRewardRule(data);
      }
    };
    fetchRule();
  }, [productId]);

  const handleCopy = () => {
    const link = generateLink(productId);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivate = async () => {
    setActivating(true);
    await activateAffiliate();
    setActivating(false);
  };

  if (!rewardRule) return null; // Only show if there's an active reward program

  const rewardText = rewardRule.reward_type === 'cash' 
    ? (rewardRule.fixed_amount > 0 ? `₦${rewardRule.fixed_amount.toLocaleString()}` : `${rewardRule.percentage_rate}%`)
    : rewardRule.reward_type === 'coupon' ? 'a discount coupon'
    : rewardRule.reward_type === 'salon' ? 'a free salon session'
    : 'store credit';

  if (!affiliateProfile) {
    return (
      <div className="mt-8 bg-forest/5 dark:bg-white/5 border border-primary/20 p-6 rounded-2xl flex flex-col items-center text-center">
        <span className="material-symbols-outlined text-4xl text-primary mb-2">volunteer_activism</span>
        <h3 className="text-xl font-bold text-forest dark:text-white mb-2">Refer, Sell & Earn!</h3>
        <p className="text-forest/70 dark:text-white/70 mb-4">
          Recommend {productName} to your friends and earn <strong className="text-primary">{rewardText}</strong> when they buy.
        </p>
        <button 
          onClick={handleActivate}
          disabled={activating}
          className="px-6 py-3 bg-primary text-forest font-bold rounded-xl hover:scale-105 transition-transform"
        >
          {activating ? 'Activating...' : 'Join Affiliate Program'}
        </button>
      </div>
    );
  }

  const link = generateLink(productId);
  const shareText = encodeURIComponent(`Check out ${productName} on Greenlife Solar! Get yours here: `);
  const shareUrl = encodeURIComponent(link);

  return (
    <div className="mt-8 bg-forest/5 dark:bg-white/5 border border-primary/20 p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-3xl text-primary">campaign</span>
        <div>
          <h3 className="text-xl font-bold text-forest dark:text-white">Share and Earn</h3>
          <p className="text-sm text-forest/70 dark:text-white/70">
            Earn <strong className="text-primary">{rewardText}</strong> for every sale you refer.
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 items-center mb-4 bg-white dark:bg-[#152a17] p-2 rounded-xl border border-forest/10 dark:border-white/10">
        <input 
          type="text" 
          value={link} 
          readOnly 
          className="flex-1 bg-transparent border-none outline-none text-sm text-forest dark:text-white px-2 truncate"
        />
        <button 
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      <div className="flex gap-2 justify-center mt-4">
        <a href={`https://wa.me/?text=${shareText}${shareUrl}`} target="_blank" rel="noreferrer" className="size-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform">
          <i className="fa-brands fa-whatsapp"></i>
        </a>
        <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noreferrer" className="size-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform">
          <i className="fa-brands fa-x-twitter"></i>
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="size-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform">
          <i className="fa-brands fa-facebook-f"></i>
        </a>
        <a href={`https://t.me/share/url?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noreferrer" className="size-10 rounded-full bg-[#229ED9] text-white flex items-center justify-center hover:scale-110 transition-transform">
          <i className="fa-brands fa-telegram"></i>
        </a>
        <a href={`mailto:?subject=${encodeURIComponent(productName)}&body=${shareText}${shareUrl}`} className="size-10 rounded-full bg-gray-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[20px]">mail</span>
        </a>
      </div>
    </div>
  );
};

export default ShareAndEarn;
