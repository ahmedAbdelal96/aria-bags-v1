import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductColor } from '@/lib/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, options?: { quantity?: number; color?: ProductColor | null }) => void;
  removeItem: (productId: string, colorName?: string) => void;
  updateQuantity: (productId: string, quantity: number, colorName?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

/** Returns a stable identity key for a line item based on product + variant. */
function lineKey(productId: string, colorName?: string | null) {
  return `${productId}::${colorName ?? ''}`;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, options = {}) => {
        const quantity = options.quantity ?? 1;
        const color = options.color ?? null;
        const key = lineKey(product.id, color?.name);

        set((state) => {
          const existing = state.items.find(
            (item) => lineKey(item.product_id, item.color?.name) === key,
          );

          if (existing) {
            return {
              items: state.items.map((item) =>
                lineKey(item.product_id, item.color?.name) === key
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { product_id: product.id, product, quantity, color }],
          };
        });
      },

      removeItem: (productId, colorName) => {
        set((state) => ({
          items: state.items.filter(
            (item) => lineKey(item.product_id, item.color?.name) !== lineKey(productId, colorName),
          ),
        }));
      },

      updateQuantity: (productId, quantity, colorName) => {
        if (quantity <= 0) {
          get().removeItem(productId, colorName);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            lineKey(item.product_id, item.color?.name) === lineKey(productId, colorName)
              ? { ...item, quantity }
              : item,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price =
            item.product.sale_price != null && item.product.sale_price > 0
              ? item.product.sale_price
              : item.product.price;
          return total + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'aria-cart',
      version: 2,
      migrate: (persistedState, version) => {
        void persistedState
        void version
        // Legacy carts from DigitalHub are incompatible — start fresh
        return { items: [] } as Pick<CartStore, 'items'>;
      },
    },
  ),
);
