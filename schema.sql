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

-- Create Policy: Allow public read access (for simple demo purposes)
CREATE POLICY "Allow public read access"
  ON greenlife_hub
  FOR SELECT
  USING (true);

-- Create Policy: Allow public write access (for simple demo purposes - usually restricted to auth users)
CREATE POLICY "Allow public write access"
  ON greenlife_hub
  FOR INSERT
  WITH CHECK (true);

-- Create Policy: Allow public update access
CREATE POLICY "Allow public update access"
  ON greenlife_hub
  FOR UPDATE
  USING (true);

-- Create Policy: Allow public delete access
CREATE POLICY "Allow public delete access"
  ON greenlife_hub
  FOR DELETE
  USING (true);
