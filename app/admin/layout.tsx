import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Settings,
  ArrowLeft,
  LogOut,
} from 'lucide-react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Collections', icon: FolderTree },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', authData.user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  const handleLogout = async () => {
    'use server'
    const browserClient = createBrowserClient()
    await browserClient.auth.signOut()
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-primary/15 bg-card/60">
        <div className="flex items-center gap-3 border-b border-primary/15 px-6 py-5">
          <span className="font-serif text-2xl tracking-[0.28em] text-foreground">ARIA</span>
          <span className="text-xs uppercase tracking-[0.22em] text-primary">Admin</span>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t border-primary/15 px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
            Back to store
          </Link>
          <form action={handleLogout} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.5} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-50 flex items-center justify-between border-b border-primary/15 bg-background/90 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl tracking-[0.28em] text-foreground">ARIA</span>
            <span className="text-xs uppercase tracking-[0.22em] text-primary">Admin</span>
          </div>
          <Link href="/" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Store
          </Link>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden border-b border-primary/15 bg-card/60">
          <nav className="flex gap-1 overflow-x-auto px-4 py-2">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}