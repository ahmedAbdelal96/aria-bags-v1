import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/cart-provider'
import { siteDescription, siteName, siteUrl } from '@/lib/site'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const _cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-serif', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'ARIA | Luxury Handbags', template: '%s | ARIA' },
  description: siteDescription,
  applicationName: siteName,
  generator: 'Next.js',
  keywords: ['ARIA handbags', 'luxury handbags', 'women handbags', 'leather bags', 'designer bags'],
  authors: [{ name: 'ARIA' }],
  creator: 'ARIA',
  publisher: 'ARIA',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: {
    type: 'website', locale: 'en_US', url: siteUrl, siteName,
    title: 'ARIA | Luxury Handbags', description: siteDescription,
    images: [{ url: '/logo.jpeg', width: 1024, height: 1024, alt: 'ARIA luxury handbags logo' }],
  },
  twitter: { card: 'summary_large_image', title: 'ARIA | Luxury Handbags', description: siteDescription, images: ['/logo.jpeg'] },
  icons: { icon: [{ url: '/logo.jpeg', type: 'image/jpeg' }], apple: [{ url: '/logo.jpeg', type: 'image/jpeg' }] },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_cormorant.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans antialiased bg-background text-foreground">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'OnlineStore', name: siteName, url: siteUrl,
          logo: `${siteUrl}/logo.jpeg`, description: siteDescription, email: 'hello@aria-bags.com', priceRange: '$$',
        }) }} />
        <CartProvider><div className="flex min-h-screen flex-col">{children}</div></CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
