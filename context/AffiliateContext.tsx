import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from './AuthContext';

export interface AffiliateProfile {
  id: string;
  user_id: string;
  affiliate_code: string;
  status: string;
  default_reward_preference: string;
}

interface AffiliateContextType {
  affiliateProfile: AffiliateProfile | null;
  loading: boolean;
  activateAffiliate: () => Promise<void>;
  generateLink: (productId?: string) => string;
}

const AffiliateContext = createContext<AffiliateContextType>({
  affiliateProfile: null,
  loading: true,
  activateAffiliate: async () => {},
  generateLink: () => '',
});

export const useAffiliate = () => useContext(AffiliateContext);

export const AffiliateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [affiliateProfile, setAffiliateProfile] = useState<AffiliateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Check & Track Referral Clicks
  useEffect(() => {
    const trackClick = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const ref = searchParams.get('ref') || searchParams.get('ref_code');
      
      if (ref) {
        // Only track if it's a new ref or it's been a while (prevent spam)
        const currentRef = localStorage.getItem('affiliate_ref');
        const lastClickTime = localStorage.getItem('affiliate_click_time');
        
        const now = Date.now();
        const isNewRef = currentRef !== ref;
        const isSpam = !isNewRef && lastClickTime && now - parseInt(lastClickTime) < 1000 * 60 * 60; // 1 hour debounce for same code
        
        if (!isSpam) {
           // Resolve affiliate profile
           const { data: profile } = await supabase
             .from('affiliate_profiles')
             .select('id, status')
             .eq('affiliate_code', ref)
             .single();
             
           if (profile && profile.status === 'Active') {
             // Record click
             const productId = window.location.pathname.includes('/product/') 
                ? window.location.pathname.split('/').pop() 
                : null;
                
             const { data: click } = await supabase
               .from('affiliate_clicks')
               .insert({
                 affiliate_id: profile.id,
                 affiliate_code_snapshot: ref,
                 product_id: productId,
                 anonymous_visitor_id: localStorage.getItem('visitor_id') || crypto.randomUUID(),
                 landing_url: window.location.href,
                 referrer_url: document.referrer || null,
                 attribution_expires_at: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
               })
               .select('id')
               .single();
               
             if (click) {
               localStorage.setItem('affiliate_ref', ref);
               localStorage.setItem('affiliate_click_id', click.id);
               localStorage.setItem('affiliate_click_time', now.toString());
               
               if (!localStorage.getItem('visitor_id')) {
                   localStorage.setItem('visitor_id', crypto.randomUUID());
               }
             }
           }
        }
      }
    };
    
    trackClick();
  }, []);

  // 2. Fetch Affiliate Profile for logged in user
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      if (!user) {
        if (mounted) {
            setAffiliateProfile(null);
            setLoading(false);
        }
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (mounted) {
        setAffiliateProfile(data || null);
        setLoading(false);
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, [user]);

  // 3. Activate Affiliate (create profile)
  const activateAffiliate = async () => {
    if (!user) return;
    
    // Generate a code: AFF-XXXXXX
    const code = 'AFF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data, error } = await supabase
      .from('affiliate_profiles')
      .insert({
        user_id: user.id,
        affiliate_code: code,
        status: 'Active' // Auto-active for this demo
      })
      .select('*')
      .single();
      
    if (!error && data) {
      setAffiliateProfile(data);
    }
  };

  // 4. Generate Link
  const generateLink = (productId?: string) => {
    if (!affiliateProfile) return '';
    const baseUrl = window.location.origin;
    if (productId) {
      return `${baseUrl}/#/product/${productId}?ref=${affiliateProfile.affiliate_code}`;
    }
    return `${baseUrl}/#/?ref=${affiliateProfile.affiliate_code}`;
  };

  return (
    <AffiliateContext.Provider value={{ affiliateProfile, loading, activateAffiliate, generateLink }}>
      {children}
    </AffiliateContext.Provider>
  );
};
