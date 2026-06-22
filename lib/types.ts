export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  image_url: string | null;
  file_url: string | null;
  file_size: number | null;
  file_type: string | null;
  status: 'active' | 'inactive' | 'archived';
  is_featured: boolean;
  is_instant_download: boolean;
  is_paid_product: boolean;
  download_file_path: string | null;
  file_size_bytes: number | null;
  views: number;
  downloads: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  total_amount: number;
  demo_download: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
}
