-- 1. Reset the Table (CAUTION: Deletes all data and dependent views)
DROP TABLE IF EXISTS greenlife_hub CASCADE;

-- 2. Create the Table (Unified Schema)
CREATE TABLE greenlife_hub (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type VARCHAR NOT NULL, -- 'product', 'package', 'gallery', 'request', 'user', 'notification'
  
  -- Shared Fields
  name TEXT,             
  title TEXT,            
  description TEXT,      
  image_url TEXT,        
  status TEXT,           
  price NUMERIC,         
  category TEXT,         
  
  -- User/System/Request Specific
  email TEXT,
  phone TEXT,
  address JSONB,
  system_data JSONB,
  
  -- Request/Order Specific
  user_id UUID,          
  metadata JSONB
);

-- 3. Enable Security
ALTER TABLE greenlife_hub ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON greenlife_hub FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON greenlife_hub FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON greenlife_hub FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON greenlife_hub FOR DELETE USING (true);

-- 4. Seed Data (Insert Products, Gallery, Packages)
INSERT INTO greenlife_hub (type, name, title, price, image_url, category, status, description, metadata)
VALUES
('product', 'Ultra High-Efficiency Monocrystalline Panel', 'Ultra High-Efficiency Monocrystalline Panel', 299, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBoemZmDpfHTHYH0MDsiVNl-VC3B_An3sV_Lq6L-ca5dx1qRNGddc2ymslmfj3_T1aK9L_bSptNeWeO-OnDBHIrGnvN8mOdEHEZsXpoF8eq9HjjjBfSg-5FbX8vLAUX1k_5kbRSLM-Fvfn85yW5lwl-ds-kOxvLOKrvhyVB0sYYaeoQmONcQvBRIUmNKdzoO_pl2tHnaZ5P-T7eE5U-ohSWo_rg9jEmC9S_nhEc3XJDp5tbMCaOc9uAhEzgwwa4cjspIcX5_qXwcM', 'Solar Panels', 'In Stock', 'Experience cutting-edge performance designed to last for decades. This panel features advanced cell technology for maximum energy harvest even in low-light conditions.', '{"brand": "EcoVolt", "series": "EcoVolt Pro Series", "efficiency": "22.8%", "reviews": 120}'),
('product', 'Smart Hybrid Power Inverter', 'Smart Hybrid Power Inverter', 1450, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGmZlZDeS0YmcYm8jJ7vff3O4ODKX9L7-yJShke27sQaksJL5UMKhYJ0XOXDnQo_aotSqghG-d_i10-z3-Uf1saL7bPUX8WCuqMVA4gDJ3XHOomsXdMUcnI1yRaP0aBOuqJnF18Z5foICU8WnJ0M8gf23qz7BSPUnLmpoQ3EZx_v4cMCuIoOWk9c2YDTSsY9lzDYnS1EZ_2gQCSfe5-eO0KmHmiWvlVLQdHIggQyByBEH4-ejywBo-JwhZP1ixI7Fq1tjqtVk1l7c', 'Inverters', 'In Stock', 'Seamlessly manage solar power, battery storage, and grid connection with our most intelligent inverter yet. Includes Wi-Fi monitoring.', '{"brand": "SunMaster", "series": "SunMaster Hybrid", "efficiency": "98%", "reviews": 85}'),
('product', 'LiFePO4 Home Battery Storage', 'LiFePO4 Home Battery Storage', 4200, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvivsa4TgGQStWruZc28_LnckM6uXSobOpT4e2X2UBw1SHMht-PKo_DqoZvXsTD72tlJeDOYvmIJ-50R8YjgW4y4uBavc7Fu6E7PLVihmF-btf3beDav7DfKiXzsJyHmM9ayVvfSlEJwolsQQ83wUGKRRibFx6CdN8FJhMMPCO1OaqiVKuoaW_N1f5Wf3ErgsRuH-idikB2xknJdFXUDhJG6_JFsd68-J73bk6o16woK-TpjXyxATYfwaqSv44b1r7Cs4u6TeqFhQ', 'Batteries', 'New Arrival', 'Store excess solar energy for use at night or during power outages. Safe, long-lasting Lithium Iron Phosphate technology.', '{"brand": "Lumina Solar", "series": "Lumina Wall", "efficiency": "6000+ Cycles", "reviews": 42}'),
('product', 'Bifacial Dual-Glass High Gain Panel', 'Bifacial Dual-Glass High Gain Panel', 385, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKMp6choayuGFStPHwMMRRnwRH_jhTHJI0VmRGf7WPvE7yAB3gGEI6Sk8Xkl23S0o1bs0gARNDhmejSzju0GaKhjAiyNoMa3rI-uGbUIlehUcejmOTvuPzayhi1PgmtD3wYML0UuNDI_E9w6TPyM5kTFCjb5Dj_SgXh3eb4yXsC_aAyxss-51ZLcq--R8eOIp2HyXNA0mHz-dMZ01SYB3PKm54Ih3qdTvmsLWC_1TyqIinwPSp_BWOi5DvYJWRHAknf3c1wh9_S1Y', 'Solar Panels', 'In Stock', 'Capture sunlight from both sides of the panel for up to 30% more energy generation. Ideal for ground mounts and commercial installations.', '{"brand": "EcoVolt", "series": "EcoVolt Bifacial", "efficiency": "23.5%", "reviews": 30}'),
('product', 'Compact String Inverter for Residential', 'Compact String Inverter for Residential', 890, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpIFBwKOzR17DAmSbsuKT-x6li7dhnnGBOVNWBeyR-N3toAV1dZZlE0CsTTpZ-y37lgT_3MP6jb9rg-GaBT-btInuNWkRU-3pOy4yfML9gvnkJsQs6Bc9kXD20X4S4tnZzQkfXQ6sYt6pC4ItUAWNtZzThdw2ct1QbVfY-UPy9x2Ya_rLuW51vXmMOxgYK3WAbbwYnecEw2m_7ds70YZxbCePjBGk5ODhy9LHe3_xh6RwSG5SD5B7HoQi6A1_Xi3ILgTbrgWgr988', 'Inverters', 'In Stock', 'Efficient, reliable, and whisper-quiet. Perfect for smaller residential solar systems.', '{"brand": "SunMaster", "series": "SunMaster Compact", "efficiency": "97.5%", "reviews": 55}'),
('product', 'Modular Stackable Battery Unit', 'Modular Stackable Battery Unit', 2800, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuACFcQR-sT17JmhszBOYNOicMijf0LuXcmoolPgH4y6AsE58UdqEq41Dd4HBlCG3f11bKeb5DLHcSkPJioXNSEowW8-L1pQapz-DRm2BrYZQ5x-PFcwQu0gM2L6tW9xh6G4I6OGGSjC-r_vEESEoLq_lFRvrCA0rEravAYrp2GH31uV8UdnYG2TBVO-WNM25UeRhoPrY4t4C8i-ONGjugjda_8fZ9km8QuFg0FnSLdPVHZovWBjhQRBh8hcMIFcSuqBmBUoh2Rig', 'Batteries', 'In Stock', 'Start small and grow. Stackable design allows you to add more capacity as your energy needs increase.', '{"brand": "Lumina Solar", "series": "Lumina Stack", "efficiency": "Expandable", "reviews": 18}'),
('product', 'Portable Solar Generator', 'Portable Solar Generator', 499, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqRxBqnJx1hpehQb5DGOJJrL9TL5K27CSYdCS9eKZNtvCVg0d0WfG93cDU-nDtbhnqh0wYk1fjvJoR42Jme7omPmgD2T8603SvVrJ-sqL_hx-Y8NacvcDYm_qqDJggJxUmDrdRMWU0gz6In9yUz0uQ5PT17L-HLT8W8OyGKjjXhs6mowwQk9Jnnqng3YDTmokW6esOqufu6v43HoutXEtuRA05ArPQ1-ZFtrh45YWOlT8RouzkK45xFL100mO8e5BaGruaBMAVMH8', 'Accessories', 'Portable', 'Power on the go. Perfect for camping, tailgating, or emergency backup for essential devices.', '{"brand": "GreenTech", "series": "GreenTech Go", "efficiency": "95%", "reviews": 75}'),
('product', 'Roof Mounting Rail Kit', 'Roof Mounting Rail Kit', 120, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLithCVa-LuJQMOXVxe9KMqehIMobcbcZW0XhhUWrT2ZSgz_dS-G3KgAcoMKim7X5FJokFgPObPQecP4ReIn7t21cU1gGl7uhR9ZqDZZe0UFssRUKrIgzu0qpBRXtQTA9r8FoJOTa1RKwDEersBM6it8xhvTBsSPe1O3p-DkcxuxhqOk8R0spjHm9zc6-X8jKW56n8_xkONaVy6WgarpCofE-hJieoMm9RBW3AFiFzUtPgnvGtGjJ4PFQqACEl4m9QIUQhs0M4YeM', 'Accessories', 'Hardware', 'Heavy-duty aluminum rails and mounting hardware for secure roof installation. Weather-resistant and durable.', '{"brand": "EcoVolt", "series": "EcoVolt Mount", "efficiency": "N/A", "reviews": 22}');

INSERT INTO greenlife_hub (type, name, title, category, description, image_url)
VALUES
('gallery', 'Residential Roof Mount', 'Residential Roof Mount', 'Residential', 'A 10kW residential installation in Lagos, featuring 24 high-efficiency panels and a smart inverter system for 24/7 power.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDywjTY-ACoD5T274KEVbpjZpt1UsEACtIVbJMHCRFz6yvYkav1NDLgGVB_12KHvz-YIZHvQUer2FW__NQSlJOCK6aBQToLrM1_jTtkSfTu3dzqCouMKKe34n-UORwMKpwM_DqoWczq5GQZ_mTkp3jJIYcvRpXWs79XAgX29VkaUNEqffEILxgiOYXS2Ly14ndhnImJeE65WQdbkLJxGkoe6e68SEVHC_hPpQssIcTjsuT8vbXHWHITKEwrs4a-xvJ_6MXOM352ob4'),
('gallery', 'Commercial Complex', 'Commercial Complex', 'Commercial', 'Full solar grid integration for a shopping complex, reducing diesel generator costs by 85%.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeVJOVAEcn2TC5LANFimRUWMhIN1Fbg-T_bpf2XYA413sZwSDYiLJF4tbkshKq0s8soG27g-Wza1A8rYfblgtmY8hqjnItF5Hn0W_rgBHM4_1qF2SaLsG6Nbq4U8F6mBvQeMSg7X3d4h_D9xYCzk91j3L2P8WB1u7btZhBcAzPSnJsxf8rFp0sHsYXEEfHYWuh5PyvPH3BazC0XxSqJ2HT_7QCGlgoA4jWZ94oKMQB11tTaQaPRdj8N1lzyLkAmBwGOLnKd0AQ6qg'),
('gallery', 'Modern Villa Installation', 'Modern Villa Installation', 'Residential', 'A sleek, aesthetic installation designed to blend perfectly with the modern architecture of this luxury villa.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU7uVdcCm0kXjHes7ZT0BeqnJUSq4eke4vXvI-DZPMxrV4SDZnXNYV3d_0F5_jnTICdM3WprFui3n7tWbQQSoNPTZs69lw0DNEojKaOBgqXc1xUg7L2J_vfY8CvpfQqlMK5He9M_fD18lNStUsi6N604UmX-4lCxrjXDz2Ars1UuGiSY8gEgtVFIT8gxXUL42FkMWtKB4AzGgfxdYhFJxl4iw0Qjk8WWyUsvF8sWbChVg8td7wSh36njhT5AqpoITrdGFB9shLJAQ'),
('gallery', 'Industrial Energy Storage', 'Industrial Energy Storage', 'Industrial', 'Heavy-duty battery bank installation supporting heavy machinery operations during grid downtime.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0m3nZ0RBhLRNfyxr_j9C-lR9ERyMyrPqxD-FLq1pU6j2KGgeYHGSEyATg7YjZ2309ZK9dWmvZvV23nVVkiphg8pm3NgXJHHGkCLGCCMnfU3BPPeMhRYbomnx_NeMZEnVTkesWhAS59GaqVKeaxSdbCpENwSwGstJjjY3Emfg9xrW3c4yl8nd2ZIp1xXQQya9LVLDCaB25TqYFr8O1mRBy-37GFTfTgOGRvJedqBvC_KnKm4_-Hu2L7t11VBG6Th3DMgg69_hkP7s');

INSERT INTO greenlife_hub (type, name, title, price, description, image_url, metadata)
VALUES
('package', 'Basic Home Backup', 'Basic Home Backup', 850000, 'Essential power backup for small homes or apartments. Keeps lights and fans on during outages.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpIFBwKOzR17DAmSbsuKT-x6li7dhnnGBOVNWBeyR-N3toAV1dZZlE0CsTTpZ-y37lgT_3MP6jb9rg-GaBT-btInuNWkRU-3pOy4yfML9gvnkJsQs6Bc9kXD20X4S4tnZzQkfXQ6sYt6pC4ItUAWNtZzThdw2ct1QbVfY-UPy9x2Ya_rLuW51vXmMOxgYK3WAbbwYnecEw2m_7ds70YZxbCePjBGk5ODhy9LHe3_xh6RwSG5SD5B7HoQi6A1_Xi3ILgTbrgWgr988', '{"appliances": ["5 Light Bulbs", "2 Ceiling Fans", "1 TV", "Phone Charging"], "powerCapacity": "3kVA"}'),
('package', 'Standard Family Solar', 'Standard Family Solar', 2500000, 'Complete solar solution for a standard 3-bedroom family home. Run your fridge and freezer comfortably.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGmZlZDeS0YmcYm8jJ7vff3O4ODKX9L7-yJShke27sQaksJL5UMKhYJ0XOXDnQo_aotSqghG-d_i10-z3-Uf1saL7bPUX8WCuqMVA4gDJ3XHOomsXdMUcnI1yRaP0aBOuqJnF18Z5foICU8WnJ0M8gf23qz7BSPUnLmpoQ3EZx_v4cMCuIoOWk9c2YDTSsY9lzDYnS1EZ_2gQCSfe5-eO0KmHmiWvlVLQdHIggQyByBEH4-ejywBo-JwhZP1ixI7Fq1tjqtVk1l7c', '{"appliances": ["10 Light Bulbs", "4 Fans", "1 Refrigerator", "1 Freezer", "2 TVs", "Laptops"], "powerCapacity": "5kVA"}'),
('package', 'Premium Power Independence', 'Premium Power Independence', 5800000, 'Go off-grid with this high-capacity system. Powers AC units and pumping machines.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDywjTY-ACoD5T274KEVbpjZpt1UsEACtIVbJMHCRFz6yvYkav1NDLgGVB_12KHvz-YIZHvQUer2FW__NQSlJOCK6aBQToLrM1_jTtkSfTu3dzqCouMKKe34n-UORwMKpwM_DqoWczq5GQZ_mTkp3jJIYcvRpXWs79XAgX29VkaUNEqffEILxgiOYXS2Ly14ndhnImJeE65WQdbkLJxGkoe6e68SEVHC_hPpQssIcTjsuT8vbXHWHITKEwrs4a-xvJ_6MXOM352ob4', '{"appliances": ["All Lighting", "AC Units (1.5HP)", "Washing Machine", "Pumping Machine", "Microwave", "Home Theatre"], "powerCapacity": "10kVA"}'),
('package', 'SME Business Starter', 'SME Business Starter', 3200000, 'Reliable power for small offices and shops. Keep your business running 24/7.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeVJOVAEcn2TC5LANFimRUWMhIN1Fbg-T_bpf2XYA413sZwSDYiLJF4tbkshKq0s8soG27g-Wza1A8rYfblgtmY8hqjnItF5Hn0W_rgBHM4_1qF2SaLsG6Nbq4U8F6mBvQeMSg7X3d4h_D9xYCzk91j3L2P8WB1u7btZhBcAzPSnJsxf8rFp0sHsYXEEfHYWuh5PyvPH3BazC0XxSqJ2HT_7QCGlgoA4jWZ94oKMQB11tTaQaPRdj8N1lzyLkAmBwGOLnKd0AQ6qg', '{"appliances": ["Office Lighting", "5 Computers/Laptops", "1 Printer/Copier", "Intercom System", "Security Cameras"], "powerCapacity": "7.5kVA"}');
