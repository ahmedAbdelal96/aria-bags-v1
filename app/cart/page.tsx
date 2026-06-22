'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/lib/store/cart';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const total = getTotal();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="mb-8 text-4xl font-bold text-foreground">Shopping Cart</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-border bg-slate-50 py-16 text-center">
                  <p className="mb-6 text-muted-foreground text-lg">Your cart is empty</p>
                  <Link href="/">
                    <Button size="lg" className="bg-primary hover:bg-red-600 text-white">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product_id} className="overflow-hidden rounded-2xl border border-border bg-white p-6 hover:shadow-md transition-shadow">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {item.product.image_url ? (
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-200 to-slate-300">
                              <span className="text-xs text-slate-500">Digital</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <Link href={`/products/${item.product.slug}`}>
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            ${item.product.price.toFixed(2)} each
                          </p>

                          {/* Quantity Controls */}
                          <div className="mt-4 flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Qty:</span>
                            <div className="flex items-center border border-border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(item.product_id, Math.max(1, item.quantity - 1))
                                }
                                className="h-8 w-8 p-0 hover:bg-slate-100"
                              >
                                −
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                className="h-8 w-8 p-0 hover:bg-slate-100"
                              >
                                +
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.product_id)}
                              className="ml-auto text-primary hover:text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            {items.length > 0 && (
              <div className="h-fit">
                <div className="rounded-2xl border border-border bg-slate-50 p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-foreground mb-6">Order Summary</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium text-foreground">$0.00</span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/checkout" className="block mb-3">
                    <Button className="w-full bg-primary hover:bg-red-600 text-white font-semibold py-6" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full border-slate-300"
                    onClick={() => clearCart()}
                  >
                    Clear Cart
                  </Button>

                  {/* Demo Notice */}
                  <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                    <p className="font-semibold">Demo Checkout</p>
                    <p className="mt-1 text-amber-800">
                      This is a demo. No real payment will be processed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
