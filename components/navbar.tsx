'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { User as UserType } from '@supabase/supabase-js';
import { useCart } from '@/lib/store/cart';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/collections', label: 'Collections' },
  { href: '/new-arrivals', label: 'New Arrivals' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

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
      } else {
        setIsAdmin(false);
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
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 shadow-[0_4px_20px_-12px_rgba(43,36,32,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden -ml-1 flex h-10 w-10 items-center justify-center text-foreground/80 hover:text-primary transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link
          href="/"
          aria-label="ARIA home"
          className="flex items-center gap-2"
        >
          <Image src="/logo.jpeg" alt="ARIA logo" width={34} height={34} className="h-8 w-8 rounded-md object-cover" priority />
          <span className="font-serif text-2xl tracking-[0.22em] text-foreground">
            ARIA
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-[0.16em] text-foreground/80 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden md:inline-flex text-xs uppercase tracking-[0.16em] text-foreground/80 hover:text-primary transition-colors"
            >
              Admin
            </Link>
          )}

          {user ? (
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              aria-label={isAdmin ? 'Admin sign out' : 'Sign out'}
              className="text-foreground/80 hover:text-primary"
            >
              <User className="h-5 w-5" />
            </Button>
          ) : null}

          <Link href="/cart" aria-label={`Cart (${cartCount} items)`} className="relative">
            <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground"
                >
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </nav>

      <div
        className={cn(
          'md:hidden overflow-hidden border-t border-border bg-background/95 transition-[max-height] duration-300',
          mobileOpen ? 'max-h-96' : 'max-h-0',
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-3 text-sm uppercase tracking-[0.16em] text-foreground/80 hover:bg-primary/5 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-3 text-sm uppercase tracking-[0.16em] text-foreground/80 hover:bg-primary/5 hover:text-primary"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
