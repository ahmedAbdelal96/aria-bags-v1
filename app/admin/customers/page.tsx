'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/aria/empty-state'
import { Shield, User, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setCustomers(data as Profile[])
        setLoading(false)
      })
  }, [])

  const stats = {
    total: customers.length,
    admins: customers.filter((c) => c.is_admin).length,
    customers: customers.filter((c) => !c.is_admin).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.32em] text-primary/80">Admin</span>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground">Registered customers in your store.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat icon={Users} label="Total users" value={stats.total} />
        <Stat icon={Shield} label="Admins" value={stats.admins} />
        <Stat icon={User} label="Customers" value={stats.customers} />
      </div>

      <Card className="border-primary/15 bg-card/60">
        <CardHeader>
          <CardTitle className="font-serif text-xl">All users ({customers.length})</CardTitle>
          <CardDescription>Users registered through checkout or sign-up.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users yet"
              description="Customer accounts will appear here after their first order or sign-up."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/15 text-left text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-primary/10 hover:bg-primary/5">
                      <td className="px-4 py-3 text-sm text-foreground">{c.email}</td>
                      <td className="px-4 py-3">
                        {c.is_admin ? (
                          <Badge className="bg-primary/20 text-primary hover:bg-primary/20">
                            <Shield className="mr-1 h-3 w-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <User className="mr-1 h-3 w-3" />
                            Customer
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
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
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: number
}) {
  return (
    <Card className="border-primary/15 bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-serif text-2xl text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}