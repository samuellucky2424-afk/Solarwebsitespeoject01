-- Create the unified table
CREATE TABLE greenlife_hub (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type VARCHAR NOT NULL, -- 'product', 'package', 'gallery', 'request', 'system', 'user', 'notification', 'team'
  
  -- Shared/Common Fields
  name TEXT,             
  title TEXT,            
  description TEXT,      
  image_url TEXT,        
  status TEXT,           
  price NUMERIC,         
  category TEXT,         
  
  -- User/System Specific
  email TEXT,
  phone TEXT,
  address JSONB,         -- {street, city, state, landmark}
  system_data JSONB,     -- {inverter, battery, panels, size, warranty_end, install_date}
  
  -- Request/Order Specific
  user_id UUID,          
  metadata JSONB         -- {appliances, specs, upgrade_details, role}
);

-- Enable Row Level Security (RLS)
ALTER TABLE greenlife_hub ENABLE ROW LEVEL SECURITY;

-- Security policies are managed in the Supabase migrations.
-- Do not add blanket public read/write/update/delete policies here.
