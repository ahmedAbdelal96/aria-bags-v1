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
  hero_title: 'Premium Digital Products, Delivered Instantly',
  hero_subtitle:
    "Browse thousands of digital resources, templates, guides, and downloadable products. Get instant access after purchase.",
  hero_cta_label: 'Browse Products',
  hero_cta_url: '/#featured',
  promo_title: 'Ready to Get Started?',
  promo_description: "Browse our collection of premium digital products and find exactly what you need.",
  promo_enabled: true,
  featured_section_title: 'Featured Products',
  cta_title: 'Ready to Get Started?',
  cta_subtitle: 'Browse our collection of premium digital products.',
  cta_button_label: 'Explore Products',
  cta_button_url: '/',
};
