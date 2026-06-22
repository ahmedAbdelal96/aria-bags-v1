'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Order, OrderItem, Product } from '@/lib/types';
import { DownloadIcon, FileIcon } from 'lucide-react';

interface OrderItemWithProduct extends OrderItem {
  product?: Product | null;
}

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const { id: orderId } = await params;
      setId(orderId);

      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        setLoading(false);
        return;
      }

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.user.id)
        .single();

      if (orderData) {
        setOrder(orderData);

        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, product:products(*)')
          .eq('order_id', orderId);

        if (itemsData) {
          setOrderItems(itemsData as OrderItemWithProduct[]);
        }
      }

      setLoading(false);
    };

    resolveParams();
  }, [params]);

  async function handleDownload(productId: string) {
    setDownloadingId(productId);
    try {
      const response = await fetch(`/api/download/${productId}`);
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Download failed');
        return;
      }
      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-12 text-center">
            <h1 className="text-3xl font-bold text-foreground">Order not found</h1>
            <p className="mt-2 text-muted-foreground">The order you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/" className="mt-6 inline-block">
              <Button className="bg-primary hover:bg-red-600 text-white">Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* Success Message */}
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-chart-4/20 p-4 text-chart-4">
              <svg
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-foreground">Order Confirmed!</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Details */}
          <div className="rounded-2xl border border-border bg-slate-50 p-6 mb-8">
            <h2 className="font-bold text-foreground mb-6">Order Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono font-medium text-foreground">{order.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order Date</span>
                <span className="font-medium text-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-block rounded-lg bg-chart-4/20 text-chart-4 px-3 py-1 text-xs font-semibold">
                  {order.status === 'completed' ? 'Completed' : 'Processing'}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-2xl border border-border p-6 mb-8">
            <h2 className="font-bold text-foreground mb-6">Items Purchased</h2>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b border-border pb-4 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">
                      {item.product?.name || `Product ID: ${item.product_id.slice(0, 8)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    {item.product?.download_file_path && (
                      <Button
                        variant="link"
                        className="text-primary p-0 h-auto text-xs mt-1"
                        onClick={() => handleDownload(item.product_id)}
                        disabled={downloadingId === item.product_id}
                      >
                        <DownloadIcon className="h-3 w-3 mr-1" />
                        {downloadingId === item.product_id ? 'Preparing...' : 'Download'}
                      </Button>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="rounded-2xl bg-primary text-white p-8 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Paid</span>
              <span className="text-3xl font-bold">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 mb-8 text-amber-900">
            <h3 className="font-semibold mb-2">Demo Purchase</h3>
            <p className="text-sm">
              This is a demonstration of a completed order. No real payment was processed. Your digital products are available for download above and will also appear in your My Downloads page.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/account/downloads" className="flex-1">
              <Button className="w-full bg-primary hover:bg-red-600 text-white font-semibold py-6" size="lg">
                <FileIcon className="h-4 w-4 mr-2" />
                My Downloads
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full border-slate-300 py-6" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
