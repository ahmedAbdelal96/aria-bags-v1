export interface StoreSettings {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_label: string;
  hero_cta_url: string;
  promo_title: string;
  promo_description: string;
  promo_enabled: boolean;
  featured_section_title: string;
  cta_title: string;
  cta_subtitle: string;
  cta_button_label: string;
  cta_button_url: string;
  updated_at: string;
}

export const defaultStoreSettings: Omit<StoreSettings, 'id' | 'updated_at'> = {
  hero_title: 'Quiet luxury, crafted to last.',
  hero_subtitle:
    'Discover handbags designed for the modern woman with sculpted silhouettes, full-grain leather, and the ARIA signature in every stitch.',
  hero_cta_label: 'Shop collections',
  hero_cta_url: '#collections',
  promo_title: 'Complimentary shipping',
  promo_description: 'Free insured delivery on every ARIA order across the region.',
  promo_enabled: true,
  featured_section_title: 'Featured Pieces',
  cta_title: 'Become an ARIA insider',
  cta_subtitle: 'Be the first to know about new collections and private events.',
  cta_button_label: 'Join the list',
  cta_button_url: '/collections',
};
