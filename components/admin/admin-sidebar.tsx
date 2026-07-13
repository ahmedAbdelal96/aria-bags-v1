'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Collections', icon: FolderTree },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface AdminSidebarProps {
  adminEmail?: string
}

export function AdminSidebar({ adminEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/')
    router.refresh()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-admin-border/20 bg-admin-sidebar text-admin-sidebar-text">
        <div className="flex items-center gap-2.5 border-b border-admin-border/20 px-6 py-5">
          <span className="font-serif text-2xl tracking-[0.2em] text-white">ARIA</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-admin-accent bg-admin-accent/15 px-2 py-0.5 rounded">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6 font-sans">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-admin-primary text-white shadow-sm font-semibold"
                    : "text-admin-sidebar-muted hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" strokeWidth={isActive ? 2 : 1.5} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-1 border-t border-admin-border/20 px-4 py-4 font-sans">
          {adminEmail && (
            <div className="px-3 py-2.5 mb-2 rounded-lg bg-white/5 border border-white/5">
              <p className="text-xs font-semibold text-white truncate" title={adminEmail}>
                {adminEmail}
              </p>
              <p className="text-[10px] text-admin-sidebar-muted font-medium mt-0.5">Store Manager</p>
            </div>
          )}
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-admin-sidebar-muted hover:bg-white/5 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Back to store
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-admin-sidebar-muted hover:bg-white/5 hover:text-rose-400 transition-all cursor-pointer text-left"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar Navigation */}
      <div className="md:hidden border-b border-admin-border bg-admin-sidebar text-admin-sidebar-text">
        <nav className="flex gap-1 overflow-x-auto px-4 py-2 font-sans">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-admin-primary text-white font-semibold"
                    : "text-admin-sidebar-muted hover:text-white"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
