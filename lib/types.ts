export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/** A color/variant for a handbag product. */
export interface ProductColor {
  /** Display name, e.g. "Onyx Black" */
  name: string;
  /** Hex/rgb color used to render the swatch */
  hex: string;
  /** Available units for this color */
  stock: number;
  /** Optional SKU for this variant */
  sku?: string | null;
}

/**
 * Product represents a handbag in the ARIA store.
 *
 * Legacy digital-product fields are kept nullable for backwards
 * compatibility with existing Supabase rows but are not surfaced
 * to the customer experience.
 */
export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;

  // Pricing
  price: number;
  sale_price: number | null;

  // Visuals (first image is used as cover when `images` is empty)
  image_url: string | null;
  images: string[];

  // Handbag specifics
  colors: ProductColor[];
  material: string | null;
  dimensions: string | null;
  care_instructions: string | null;

  // Lifecycle
  status: 'active' | 'draft' | 'archived';
  is_featured: boolean;

  // Legacy digital-product fields (kept for backwards compatibility)
  file_url: string | null;
  file_size: number | null;
  file_type: string | null;
  is_instant_download: boolean;
  is_paid_product: boolean;
  download_file_path: string | null;
  file_size_bytes: number | null;

  // Metrics
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

/** Delivery/shipping information captured at checkout. */
export interface ShippingAddress {
  full_name: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  notes?: string | null;
}

export type PaymentMethod = 'cod';

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'shipped' | 'delivered';
  total_amount: number;
  payment_method: PaymentMethod;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  /** Selected color name at the time of order */
  color_name: string | null;
  /** Selected color hex at the time of order */
  color_hex: string | null;
  quantity: number;
  price: number;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
  /** Selected color/variant for this line item, if any */
  color?: ProductColor | null;
}