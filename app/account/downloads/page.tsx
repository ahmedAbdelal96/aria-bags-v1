'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product, OrderItem, Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileIcon, DownloadIcon, Loader2 } from 'lucide-react';

interface PurchasedProduct extends Product {
  order_id: string;
  order_item_id: string;
  purchased_at: string;
  demo_download?: boolean;
}

export default function DownloadsPage() {
  const [purchases, setPurchases] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchases() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('id, created_at, demo_download')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (!orders || orders.length === 0) {
        setLoading(false);
        return;
      }

      const orderIds = orders.map(o => o.id);
      const orderMap = new Map(orders.map(o => [o.id, { created_at: o.created_at, demo_download: o.demo_download }]));

      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, product:products(*)')
        .in('order_id', orderIds);

      if (!orderItems) {
        setLoading(false);
        return;
      }

      const purchases: PurchasedProduct[] = orderItems
        .filter((item: any) => item.product && item.product.download_file_path)
        .map((item: any) => {
          const orderInfo = orderMap.get(item.order_id);
          return {
            ...item.product,
            order_id: item.order_id,
            order_item_id: item.id,
            purchased_at: orderInfo?.created_at || '',
            demo_download: orderInfo?.demo_download || false,
          };
        });

      setPurchases(purchases);
      setLoading(false);
    }

    fetchPurchases();
  }, []);

  async function handleDownload(productId: string) {
    setDownloading(productId);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to download');
        return;
      }

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
      setDownloading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Downloads</h1>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Downloads Yet</h2>
            <p className="text-muted-foreground">
              Purchased products with downloadable files will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {purchases.map((product) => (
            <Card key={product.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-muted p-3">
                    <FileIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.file_type && `${product.file_type} • `}
                      {product.file_size_bytes ? `${(product.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : ''}
                      {product.demo_download && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Demo
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDownload(product.id)}
                  disabled={downloading === product.id}
                >
                  {downloading === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <DownloadIcon className="h-4 w-4" />
                  )}
                  <span className="ml-2">Download</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}