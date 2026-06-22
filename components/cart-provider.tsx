'use client';

import { useEffect, useState } from 'react';

// Hydration wrapper to prevent hydration mismatch
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
