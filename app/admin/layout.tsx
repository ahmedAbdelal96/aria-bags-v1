import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Settings, ArrowLeft, LogOut } from 'lucide-react';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Store Settings', icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', authData.user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/');
  }

  const handleLogout = async () => {
    const browserClient = createBrowserClient();
    await browserClient.auth.signOut();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold">
            D
          </div>
          <div>
            <span className="font-bold text-foreground">Admin</span>
            <p className="text-xs text-muted-foreground">DigitalHub</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-border px-4 py-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Store
          </Link>
          <form action={handleLogout} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header - Mobile */}
        <header className="md:hidden sticky top-0 z-50 flex items-center justify-between bg-white border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
              D
            </div>
            <span className="font-bold text-foreground">Admin</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Store
            </Button>
          </Link>
        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden border-b border-border bg-white">
          <nav className="flex gap-1 px-4 py-2 overflow-x-auto">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors whitespace-nowrap"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
