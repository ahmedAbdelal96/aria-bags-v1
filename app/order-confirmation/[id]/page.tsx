import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, CreditCard, MapPin, Package, Phone } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/aria/empty-state'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/product'
import {
  getOrderStatusCustomerMessage,
  getOrderStatusLabel,
  normalizeOrderStatus,
} from '@/lib/order-status'

interface ConfirmationItem {
  id: string
  product_id: string
  product_name: string | null
  product_image: string | null
  color_name: string | null
  color_hex: string | null
  quantity: number
  unit_price: number
  total_price: number
  price: number
}

interface ConfirmationPayload {
  id: string
  confirmation_token: string
  customer_name: string | null
  customer_phone: string | null
  customer_phone_2: string | null
  notes: string | null
  shipping_address: {
    full_name?: string
    phone?: string
    phone_2?: string | null
    address?: string
    notes?: string | null
  } | null
  status: string
  payment_method: string
  total_amount: number
  created_at: string
  updated_at: string
  items: ConfirmationItem[]
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const [{ id }, paramsSearch] = await Promise.all([params, searchParams])
  const token = paramsSearch?.token

  if (!token) {
    notFound()
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_guest_order_confirmation', {
    p_order_id: id,
    p_confirmation_token: token,
  })

  if (error || !data) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-3xl px-4 py-20 md:px-6">
            <EmptyState
              icon={Package}
              title="Order confirmation unavailable"
              description="We could not verify this order confirmation link. Please check the link from your checkout confirmation."
              actionLabel="Back home"
              actionHref="/"
            />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const order = (Array.isArray(data) ? data[0] : data) as ConfirmationPayload
  const normalizedStatus = normalizeOrderStatus(order.status)
  const customerName = order.customer_name ?? order.shipping_address?.full_name ?? 'you'
  const firstName = customerName.split(' ')[0] || 'you'
  const address = order.shipping_address?.address ?? ''
  const secondPhone = order.customer_phone_2 ?? order.shipping_address?.phone_2 ?? null

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
          <section className="text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
              <Check className="h-7 w-7" strokeWidth={2} />
            </div>
            <span className="mt-6 block text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
              Order confirmed
            </span>
            <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">
              Thank you, {firstName}.
            </h1>
            <p className="mt-3 text-xs text-muted-foreground md:text-sm">
              {getOrderStatusCustomerMessage(normalizedStatus)}
            </p>
            <p className="mt-4 inline-flex rounded-full border border-border bg-secondary/40 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary shadow-sm">
              Cash on delivery
            </p>
          </section>

          <section className="mt-12 rounded-[1.75rem] border border-border bg-white p-6 shadow-[0_8px_24px_-12px_rgba(43,36,32,0.12)] md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-5">
              <h2 className="font-serif text-xl text-foreground">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <ul className="mt-5 divide-y divide-border/60">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-card border border-border">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name ?? 'ARIA piece'}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Package className="h-6 w-6" strokeWidth={1.25} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-base text-foreground">
                      {item.product_name ?? 'ARIA piece'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity}
                      {item.color_name ? ` - ${item.color_name}` : ''}
                    </p>
                    {item.color_hex ? (
                      <span
                        aria-hidden
                        className="mt-1 inline-block h-2.5 w-2.5 rounded-full border border-border align-middle"
                        style={{ backgroundColor: item.color_hex }}
                      />
                    ) : null}
                  </div>
                  <span className="font-serif text-base text-primary font-bold">
                    {formatPrice(item.total_price || item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-border pt-5 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground font-medium">Customer</dt>
                <dd className="text-foreground font-semibold">{customerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground font-medium">Phone</dt>
                <dd className="text-foreground font-semibold">{order.customer_phone ?? order.shipping_address?.phone ?? '-'}</dd>
              </div>
              {secondPhone ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground font-medium">Second phone</dt>
                  <dd className="text-foreground font-semibold">{secondPhone}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted-foreground font-medium">Address</dt>
                <dd className="text-foreground font-semibold text-right">{address}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground font-medium">Payment</dt>
                <dd className="text-foreground font-semibold">Cash on delivery</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <dt className="font-serif text-base text-foreground">Total</dt>
                <dd className="font-serif text-2xl text-primary font-bold">{formatPrice(order.total_amount)}</dd>
              </div>
            </dl>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                <MapPin className="h-3.5 w-3.5" />
                Delivering to
              </div>
              <p className="mt-3 font-serif text-base text-foreground">{customerName}</p>
              <p className="text-xs text-muted-foreground mt-1">{address}</p>
              {order.notes ? (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  &ldquo;{order.notes}&rdquo;
                </p>
              ) : null}
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                {order.customer_phone ? (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3 w-3" /> {order.customer_phone}
                  </p>
                ) : null}
                {secondPhone ? (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3 w-3" /> {secondPhone}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                <CreditCard className="h-3.5 w-3.5" />
                Payment
              </div>
              <p className="mt-3 font-serif text-base text-foreground">Cash on delivery</p>
              <p className="text-xs text-muted-foreground mt-1">
                You&apos;ll pay in cash when your order is delivered.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Status:{' '}
                <span className="text-foreground font-medium">
                  {getOrderStatusLabel(normalizedStatus)}
                </span>
              </p>
            </div>
          </section>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              className="h-12 rounded-full bg-primary px-8 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary-hover shadow-md cursor-pointer transition-colors"
            >
              <Link href="/">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
