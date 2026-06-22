'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/store/cart';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    cardNumber: '4242 4242 4242 4242',
  });

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);

      if (data.user?.email) {
        setFormData((prev) => ({ ...prev, email: data.user!.email! }));
      }

      setLoading(false);
    };

    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const productIds = items.map(item => item.product_id);
      const { data: validProducts, error: productsError } = await supabase
        .from('products')
        .select('id, status')
        .in('id', productIds);

      if (productsError) throw productsError;

      const invalidProducts = validProducts?.filter(p => p.status !== 'active');
      if (invalidProducts && invalidProducts.length > 0) {
        alert('One or more products in your cart are no longer available. Please remove them and try again.');
        setSubmitting(false);
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            status: 'completed',
            total_amount: getTotal(),
            demo_download: true,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and redirect
      clearCart();
      router.push(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="rounded-2xl border border-border bg-slate-50 py-12 text-center">
              <p className="mb-4 text-muted-foreground">Please sign in to checkout</p>
              <Button onClick={() => router.push('/auth/login')} className="bg-primary hover:bg-red-600 text-white">Sign In</Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="rounded-2xl border border-border bg-slate-50 py-12 text-center">
              <p className="mb-4 text-muted-foreground">Your cart is empty</p>
              <Button onClick={() => router.push('/')} className="bg-primary hover:bg-red-600 text-white">Back to Shopping</Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const total = getTotal();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="mb-8 text-4xl font-bold text-foreground">Checkout</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border bg-white p-8">
                <h2 className="mb-6 text-2xl font-bold text-foreground">Billing Information</h2>
                <p className="mb-8 text-muted-foreground">Enter your details to complete the purchase</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Contact Information</h3>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled
                        className="bg-slate-50 border-border"
                      />
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Personal Information</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          placeholder="John"
                          className="border-border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          placeholder="Doe"
                          className="border-border"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Payment Information</h3>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
                      <Input
                        value={formData.cardNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, cardNumber: e.target.value })
                        }
                        placeholder="1234 5678 9012 3456"
                        disabled
                        className="bg-slate-50 border-border"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Demo mode: Using test card 4242 4242 4242 4242
                      </p>
                    </div>
                  </div>

                  {/* Demo Notice */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Demo Checkout Only</p>
                    <p className="mt-1 text-amber-800">
                      This is a demonstration. No real payment will be processed. Click &quot;Complete Order&quot; to simulate a successful purchase.
                    </p>
                  </div>

                  <Button type="submit" size="lg" disabled={submitting} className="w-full bg-primary hover:bg-red-600 text-white font-semibold py-6">
                    {submitting ? 'Processing...' : 'Complete Order'}
                  </Button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="rounded-2xl border border-border bg-slate-50 p-6 sticky top-24 h-fit">
                <h3 className="mb-6 text-lg font-bold text-foreground">Order Summary</h3>
                <div className="space-y-3 border-b border-border pb-6 mb-6">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex justify-between text-sm">
                      <span className="text-foreground">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-foreground">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium text-foreground">$0.00</span>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
