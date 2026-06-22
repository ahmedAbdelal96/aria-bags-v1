'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, CreditCard, Loader2, Lock, Truck } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/product'
import type { User } from '@supabase/supabase-js'
import type { ShippingAddress } from '@/lib/types'

const initialShipping: ShippingAddress = {
  full_name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  notes: '',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCart()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shipping, setShipping] = useState<ShippingAddress>(initialShipping)

  useEffect(() => {
    const supabase = createClient()
    const run = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)

      if (data.user?.email) {
        setShipping((prev) => ({ ...prev, email: data.user!.email ?? '' }))
      }
      setLoading(false)
    }
    run()
  }, [])

  const total = getTotal()
  const shipping_fee = 0 // complimentary
  const grandTotal = total + shipping_fee

  const update = <K extends keyof ShippingAddress>(key: K, value: ShippingAddress[K]) => {
    setShipping((prev) => ({ ...prev, [key]: value }))
  }

  const validate = (): string | null => {
    if (!shipping.full_name.trim()) return 'Please enter your full name.'
    if (!shipping.phone.trim()) return 'Please enter your phone number.'
    if (shipping.email && !/^\S+@\S+\.\S+$/.test(shipping.email)) return 'Please enter a valid email.'
    if (!shipping.address.trim()) return 'Please enter your delivery address.'
    if (!shipping.city.trim()) return 'Please enter your city.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push('/auth/login?redirect=/checkout')
      return
    }
    if (items.length === 0) {
      setError('Your bag is empty.')
      return
    }
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const productIds = items.map((i) => i.product_id)
      const { data: validProducts, error: productsError } = await supabase
        .from('products')
        .select('id, status')
        .in('id', productIds)

      if (productsError) throw productsError

      const invalid = validProducts?.filter((p) => p.status !== 'active')
      if (invalid && invalid.length > 0) {
        setError('One or more items in your bag are no longer available. Please review your bag.')
        setSubmitting(false)
        return
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            status: 'pending',
            total_amount: grandTotal,
            payment_method: 'cod',
            shipping_address: shipping,
          },
        ])
        .select()
        .single()

      if (orderError) throw orderError

      // Insert line items
      const orderItems = items.map((item) => {
        const unitPrice =
          item.product.sale_price != null && item.product.sale_price > 0
            ? item.product.sale_price
            : item.product.price
        return {
          order_id: order.id,
          product_id: item.product_id,
          color_name: item.color?.name ?? null,
          color_hex: item.color?.hex ?? null,
          quantity: item.quantity,
          price: unitPrice,
        }
      })

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      clearCart()
      router.push(`/order-confirmation/${order.id}`)
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Checkout failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
            <div className="mx-auto max-w-md rounded-xl border border-primary/15 bg-card/60 p-10 text-center">
              <Lock className="mx-auto mb-4 h-8 w-8 text-primary" strokeWidth={1.5} />
              <h1 className="font-serif text-2xl text-foreground">Sign in to checkout</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your ARIA account to complete your order.
              </p>
              <Button
                asChild
                className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8 h-12 uppercase tracking-[0.22em] text-xs"
              >
                <Link href="/auth/login?redirect=/checkout">Sign in</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
            <div className="mx-auto max-w-md rounded-xl border border-primary/15 bg-card/60 p-10 text-center">
              <h1 className="font-serif text-2xl text-foreground">Your bag is empty</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Add a piece to your bag before checking out.
              </p>
              <Button
                asChild
                className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8 h-12 uppercase tracking-[0.22em] text-xs"
              >
                <Link href="/">Browse the collection</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <span className="text-xs uppercase tracking-[0.32em] text-primary/80">Checkout</span>
          <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">Complete your order</h1>

          <form onSubmit={handleSubmit} className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
            <div className="space-y-10">
              {/* Delivery */}
              <section>
                <h2 className="font-serif text-2xl text-foreground">Delivery details</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="full_name" required>
                    <Input
                      id="full_name"
                      value={shipping.full_name}
                      onChange={(e) => update('full_name', e.target.value)}
                      placeholder="Jane Doe"
                      required
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Phone" htmlFor="phone" required>
                    <Input
                      id="phone"
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+20 100 000 0000"
                      required
                      autoComplete="tel"
                    />
                  </Field>
                  <Field label="Email" htmlFor="email">
                    <Input
                      id="email"
                      type="email"
                      value={shipping.email ?? ''}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </Field>
                  <Field label="City" htmlFor="city" required>
                    <Input
                      id="city"
                      value={shipping.city}
                      onChange={(e) => update('city', e.target.value)}
                      placeholder="Cairo"
                      required
                      autoComplete="address-level2"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Address" htmlFor="address" required>
                      <Input
                        id="address"
                        value={shipping.address}
                        onChange={(e) => update('address', e.target.value)}
                        placeholder="Street, building, apartment"
                        required
                        autoComplete="street-address"
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Delivery notes" htmlFor="notes" hint="Optional">
                      <Textarea
                        id="notes"
                        value={shipping.notes ?? ''}
                        onChange={(e) => update('notes', e.target.value)}
                        placeholder="Anything we should know about the delivery?"
                        rows={3}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section>
                <h2 className="font-serif text-2xl text-foreground">Payment</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  ARIA currently accepts cash on delivery. You will pay when your order arrives.
                </p>
                <div className="mt-5 flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CreditCard className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-serif text-base text-foreground">Cash on delivery</p>
                    <p className="text-xs text-muted-foreground">
                      Pay in cash when your ARIA piece is delivered.
                    </p>
                  </div>
                  <Check className="ml-auto h-5 w-5 text-primary" />
                </div>
              </section>
            </div>

            {/* Summary */}
            <aside className="h-fit lg:sticky lg:top-24">
              <div className="rounded-xl border border-primary/15 bg-card/60 p-6">
                <h2 className="font-serif text-xl text-foreground">Order summary</h2>

                <ul className="mt-5 divide-y divide-primary/10">
                  {items.map((item) => {
                    const unitPrice =
                      item.product.sale_price != null && item.product.sale_price > 0
                        ? item.product.sale_price
                        : item.product.price
                    return (
                      <li key={`${item.product_id}::${item.color?.name ?? ''}`} className="flex gap-3 py-3 text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty {item.quantity}
                            {item.color ? ` · ${item.color.name}` : ''}
                          </p>
                        </div>
                        <span className="font-medium text-foreground">
                          {formatPrice(unitPrice * item.quantity)}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <dl className="mt-5 space-y-2 border-t border-primary/15 pt-5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="text-foreground">{formatPrice(total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="text-foreground">Complimentary</dd>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-primary/15">
                    <dt className="font-serif text-base text-foreground">Total</dt>
                    <dd className="font-serif text-2xl text-primary">{formatPrice(grandTotal)}</dd>
                  </div>
                </dl>

                {error ? (
                  <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="mt-6 h-12 w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-[0.22em] text-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing order...
                    </>
                  ) : (
                    'Place order'
                  )}
                </Button>

                <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 text-primary" />
                  Complimentary delivery across Egypt.
                </p>
              </div>
            </aside>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs uppercase tracking-[0.22em] text-foreground/80">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
        {hint ? <span className="ml-2 normal-case tracking-normal text-muted-foreground">({hint})</span> : null}
      </label>
      {children}
    </div>
  )
}