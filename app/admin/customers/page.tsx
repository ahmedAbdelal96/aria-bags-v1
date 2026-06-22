'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { Users, Shield, User, AlertCircle } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCustomers(data);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  const stats = {
    total: customers.length,
    admins: customers.filter((c) => c.is_admin).length,
    customers: customers.filter((c) => !c.is_admin).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">Manage registered customers</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              {stats.admins}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {stats.customers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Customer Management</p>
              <p className="text-sm text-blue-800">
                User deletion is disabled for security. To manage admin access, use the Supabase dashboard or
                run SQL commands.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({customers.length})</CardTitle>
          <CardDescription>Registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/50 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No customers yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm">{customer.email}</td>
                      <td className="px-4 py-3">
                        {customer.is_admin ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <User className="h-3 w-3 mr-1" />
                            Customer
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(customer.created_at).toLocaleDateString()}
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
