export type GreenlifeType = 'product' | 'gallery' | 'request' | 'system' | 'team';

export interface GreenlifeMetadata {
  // Product specific
  price?: number;
  description?: string;
  appliances?: string[];
  category?: string;
  image_url?: string;
  stock_status?: string;

  // Gallery specific
  project_name?: string;
  
  // Request specific
  customer_name?: string;
  address?: string;
  priority?: 'High' | 'Normal' | 'Low';
  service_type?: 'Maintenance' | 'Installation' | 'Survey' | 'Upgrade';
  
  // System specific
  system_size?: string;
  inverter_type?: string;
  battery_type?: string;
  warranty_end?: string;
  
  // Team specific
  member_names?: string[];
  assigned_requests?: string[];

  // Common
  [key: string]: any;
}

export interface GreenlifeHubRow {
  id: string;
  created_at: string;
  type: GreenlifeType;
  status?: string; // e.g., 'Pending', 'Approved', 'Shipped', 'Operational'
  user_id?: string; // Foreign key to auth.users if applicable
  metadata: GreenlifeMetadata;
}
