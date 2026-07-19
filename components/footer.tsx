import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Mail } from 'lucide-react'

const FOOTER_LINKS = [
  {
    title: 'Shop',
    items: [
      { label: 'All Collections', href: '/collections' },
      { label: 'New Arrivals', href: '/new-arrivals' },
      { label: 'Tote Bags', href: '/category/tote-bags' },
      { label: 'Crossbody', href: '/category/crossbody-bags' },
    ],
  },
  {
    title: 'ARIA',
    items: [
      { label: 'Our Story', href: '/about' },
      { label: 'Craftsmanship', href: '/about' },
      { label: 'Care Guide', href: '/about' },
      { label: 'Contact', href: 'mailto:hello@aria-bags.com' },
    ],
  },
  {
    title: 'Care',
    items: [
      { label: 'Shipping', href: '/about' },
      { label: 'Returns', href: '/about' },
      { label: 'Privacy', href: '/about' },
      { label: 'Terms', href: '/about' },
    ],
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <Image src="/logo.jpeg" alt="ARIA logo" width={56} height={56} className="h-14 w-14 rounded-lg object-cover" />
              <span className="font-serif text-3xl tracking-[0.22em] text-foreground">ARIA</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Luxury handbags crafted for the modern woman. Designed in Cairo, finished by hand.
            </p>
            <div className="mt-6 flex items-center gap-4 text-muted-foreground">
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a
                href="mailto:hello@aria-bags.com"
                aria-label="Email"
                className="hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs uppercase tracking-[0.28em] text-primary">
                {col.title}
              </h4>
              <ul className="space-y-3 text-sm">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 aria-divider" />

        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-center text-xs uppercase tracking-[0.22em] text-muted-foreground md:flex-row md:text-left">
          <p>© {currentYear} ARIA. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-primary transition-colors">
              Admin Login
            </Link>
            <p className="text-primary/80">Crafted with care</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
