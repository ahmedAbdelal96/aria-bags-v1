'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { ShoppingCart, LogIn } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { items } = useCart();
  const cartCount = items.length;

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();

        setIsAdmin(profile?.is_admin || false);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <nav className="sticky top-0 z-50 h-16 w-full border-b border-border bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">
            D
          </div>
          <span className="hidden text-lg font-bold text-foreground sm:inline">DigitalHub</span>
        </Link>

        {/* Center Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/#featured" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Products
          </Link>
          <a href="mailto:support@digitalhub.com" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            About
          </a>
          <a href="mailto:support@digitalhub.com" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Contact
          </a>
          {user && (
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              My Downloads
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Admin
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-sm">
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                <LogIn className="h-4 w-4" />
              </Button>
            </Link>
          )}

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="sm">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
