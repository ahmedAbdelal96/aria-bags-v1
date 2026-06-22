'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/lib/types';
import { ShoppingCart, AlertCircle, CheckCircle, XCircle, Clock, DollarSign, Package } from 'lucide-react';

interface OrderWithDetails extends Order {
  customer_email?: string;
  item_count?: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setLoading(false);
        return;
      }

      const ordersWithDetails: OrderWithDetails[] = [];

      for (const order of ordersData || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', order.user_id)
          .single();

        const { data: items } = await supabase
          .from('order_items')
          .select('id')
          .eq('order_id', order.id);

        ordersWithDetails.push({
          ...order,
          customer_email: profile?.email || 'Unknown',
          item_count: (items || []).length,
        });
      }

      setOrders(ordersWithDetails);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    failed: orders.filter((o) => o.status === 'failed' || o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      {/* Demo Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Demo Orders</p>
              <p className="text-sm text-amber-800">
                Orders are created during demo checkout. Real payment confirmation requires Stripe or Paddle
                webhook integration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {stats.completed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Demo revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({orders.length})</CardTitle>
          <CardDescription>Customer purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/50 py-12 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Orders will appear here when customers complete checkout
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Items</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{order.id.slice(0, 8)}...</code>
                      </td>
                      <td className="px-4 py-3 text-sm">{order.customer_email}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {order.item_count}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">${order.total_amount?.toFixed(2)}</td>
                      <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
