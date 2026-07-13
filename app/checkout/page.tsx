'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, CreditCard, Loader2, Truck } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/lib/store/cart'
import { formatPrice } from '@/lib/product'
import { createGuestOrder } from '@/lib/db/guest-orders'
import type { ShippingAddress } from '@/lib/types'

const initialShipping: ShippingAddress = {
  full_name: '',
  phone: '',
  phone_2: '',
  address: '',
  notes: '',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shipping, setShipping] = useState<ShippingAddress>(initialShipping)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const total = getTotal()
  const shippingFee = 0
  const grandTotal = total + shippingFee

  const update = <K extends keyof ShippingAddress>(key: K, value: ShippingAddress[K]) => {
    setShipping((prev) => ({ ...prev, [key]: value }))
  }

  const isValidPhone = (value: string) => {
    const cleaned = value.trim().replace(/[\s\-\(\)]/g, '')
    return /^\+?[0-9]{7,15}$/.test(cleaned)
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!shipping.full_name.trim()) {
      errors.full_name = 'Please enter the customer name.'
    } else if (shipping.full_name.trim().length < 2) {
      errors.full_name = 'Please enter a valid customer name.'
    }

    if (!shipping.phone.trim()) {
      errors.phone = 'Please enter a phone number.'
    } else if (!isValidPhone(shipping.phone)) {
      errors.phone = 'Please enter a valid phone number.'
    }

    if (shipping.phone_2 && shipping.phone_2.trim()) {
      if (!isValidPhone(shipping.phone_2)) {
        errors.phone_2 = 'Please enter a valid second phone number or leave it empty.'
      }
    }

    if (!shipping.address.trim()) {
      errors.address = 'Please enter the delivery address.'
    } else if (shipping.address.trim().length < 10) {
      errors.address = 'Please enter a more complete delivery address.'
    }

    if (shipping.notes && shipping.notes.trim().length > 300) {
      errors.notes = 'Notes are too long.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      setError('Your bag is empty.')
      return
    }

    setError(null)
    if (!validate()) {
      return
    }

    setSubmitting(true)

    try {
      const result = await createGuestOrder({
        customer_name: shipping.full_name.trim(),
        customer_phone: shipping.phone.trim(),
        customer_phone_2: shipping.phone_2?.trim() || null,
        shipping_address: shipping.address.trim(),
        notes: shipping.notes?.trim() || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          selected_color_name: item.color?.name ?? null,
        })),
      })

      clearCart()
      router.push(`/order-confirmation/${result.order_id}?token=${result.confirmation_token}`)
    } catch (err) {
      console.error('Checkout error:', err)
      setError(getCheckoutErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
            <div className="mx-auto max-w-md rounded-[1.75rem] border border-border bg-white p-10 text-center shadow-[0_8px_24px_-12px_rgba(43,36,32,0.12)]">
              <h1 className="font-serif text-2xl text-foreground">Your bag is empty</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Add a piece to your bag before checking out.
              </p>
              <Button
                asChild
                className="mt-6 h-12 rounded-full bg-primary px-8 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary-hover shadow-md cursor-pointer transition-colors"
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
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">Checkout</span>
          <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">Guest checkout</h1>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground md:text-sm">
            Complete your ARIA order with cash on delivery. No customer account is required.
          </p>

          <form onSubmit={handleSubmit} className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
            <div className="space-y-10">
              <section className="rounded-[1.75rem] border border-border bg-white p-6 shadow-[0_8px_24px_-12px_rgba(43,36,32,0.12)]">
                <h2 className="font-serif text-2xl text-foreground">Delivery details</h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  Tell us where to send your ARIA piece. We only need the essentials.
                </p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field
                      label="Full name"
                      htmlFor="full_name"
                      required
                      error={fieldErrors.full_name}
                      description="Enter the name we should deliver the order to."
                    >
                      <Input
                        id="full_name"
                        value={shipping.full_name}
                        onChange={(e) => {
                          update('full_name', e.target.value)
                          if (fieldErrors.full_name) {
                            setFieldErrors((prev) => ({ ...prev, full_name: '' }))
                          }
                        }}
                        placeholder="e.g. Jane Doe"
                        required
                        autoComplete="name"
                        className="h-12 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-base"
                      />
                    </Field>
                  </div>

                  <Field
                    label="Main phone number"
                    htmlFor="phone"
                    required
                    error={fieldErrors.phone}
                    description="We may call this number to confirm delivery."
                  >
                    <Input
                      id="phone"
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => {
                        update('phone', e.target.value)
                        if (fieldErrors.phone) {
                          setFieldErrors((prev) => ({ ...prev, phone: '' }))
                        }
                      }}
                      placeholder="e.g. 01012345678"
                      required
                      autoComplete="tel"
                      className="h-12 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-base"
                    />
                  </Field>

                  <Field
                    label="Second phone number"
                    htmlFor="phone_2"
                    hint="Optional"
                    error={fieldErrors.phone_2}
                    description="Optional fallback number."
                  >
                    <Input
                      id="phone_2"
                      type="tel"
                      value={shipping.phone_2 ?? ''}
                      onChange={(e) => {
                        update('phone_2', e.target.value)
                        if (fieldErrors.phone_2) {
                          setFieldErrors((prev) => ({ ...prev, phone_2: '' }))
                        }
                      }}
                      placeholder="e.g. 01012345678"
                      autoComplete="tel"
                      className="h-12 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-base"
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field
                      label="Delivery address"
                      htmlFor="address"
                      required
                      error={fieldErrors.address}
                      description="Street name, building number, apartment, and nearby landmarks."
                    >
                      <Input
                        id="address"
                        value={shipping.address}
                        onChange={(e) => {
                          update('address', e.target.value)
                          if (fieldErrors.address) {
                            setFieldErrors((prev) => ({ ...prev, address: '' }))
                          }
                        }}
                        placeholder="Street, building, apartment, landmark"
                        required
                        autoComplete="street-address"
                        className="h-12 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-base"
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      label="Delivery notes"
                      htmlFor="notes"
                      hint="Optional"
                      error={fieldErrors.notes}
                      description="Any delivery notes? Example: call before arrival."
                    >
                      <Textarea
                        id="notes"
                        value={shipping.notes ?? ''}
                        onChange={(e) => {
                          update('notes', e.target.value)
                          if (fieldErrors.notes) {
                            setFieldErrors((prev) => ({ ...prev, notes: '' }))
                          }
                        }}
                        placeholder="Anything we should know about the delivery?"
                        rows={3}
                        className="border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary text-base"
                      />
                    </Field>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-border bg-white p-6 shadow-[0_8px_24px_-12px_rgba(43,36,32,0.12)]">
                <h2 className="font-serif text-2xl text-foreground">Payment</h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  ARIA currently accepts cash on delivery. You will pay when your order arrives.
                </p>
                <div className="mt-5 flex items-center gap-4 rounded-[1.25rem] border border-border bg-secondary/30 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CreditCard className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-serif text-base text-foreground">Cash on delivery</p>
                    <p className="text-[10px] text-muted-foreground">
                      Pay in cash when your ARIA piece is delivered.
                    </p>
                  </div>
                  <Check className="ml-auto h-5 w-5 text-primary" />
                </div>
              </section>
            </div>

            <aside className="h-fit lg:sticky lg:top-24">
              <div className="rounded-[1.75rem] border border-border bg-secondary/35 p-6 shadow-[0_8px_24px_-12px_rgba(43,36,32,0.15)]">
                <h2 className="font-serif text-xl text-foreground">Order summary</h2>

                <ul className="mt-5 divide-y divide-border/60">
                  {items.map((item) => {
                    const unitPrice =
                      item.product.sale_price != null && item.product.sale_price > 0
                        ? item.product.sale_price
                        : item.product.price
                    return (
                      <li
                        key={`${item.product_id}::${item.color?.name ?? ''}`}
                        className="flex gap-3 py-3 text-xs"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.product.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Qty {item.quantity}
                            {item.color ? ` - ${item.color.name}` : ''}
                          </p>
                        </div>
                        <span className="font-semibold text-foreground">
                          {formatPrice(unitPrice * item.quantity)}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <dl className="mt-5 space-y-2 border-t border-border/80 pt-5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground font-medium">Subtotal</dt>
                    <dd className="text-foreground font-medium">{formatPrice(total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground font-medium">Shipping</dt>
                    <dd className="text-foreground font-medium">Complimentary</dd>
                  </div>
                  <div className="flex justify-between border-t border-border/80 pt-3">
                    <dt className="font-serif text-base text-foreground">Total</dt>
                    <dd className="font-serif text-2xl text-primary font-bold">{formatPrice(grandTotal)}</dd>
                  </div>
                </dl>

                {error ? (
                  <p className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive font-medium">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="mt-6 h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary-hover uppercase tracking-[0.16em] text-xs font-semibold shadow-md cursor-pointer transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Placing order...
                    </>
                  ) : (
                    'Place order'
                  )}
                </Button>

                <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 text-primary" />
                  Complimentary Egypt delivery.
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
  error,
  description,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  error?: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5 w-full">
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-foreground/95">
        {label}
        {required ? <span className="text-primary font-bold"> *</span> : null}
        {hint ? <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-muted-foreground">({hint})</span> : null}
      </label>
      {children}
      {description && <p className="text-[11px] leading-normal text-muted-foreground/80">{description}</p>}
      {error && <p className="text-xs font-medium text-destructive mt-0.5">{error}</p>}
    </div>
  )
}

function getCheckoutErrorMessage(err: unknown) {
  const fallback = 'We could not place your order right now. Please try again.'

  if (!(err instanceof Error)) {
    return fallback
  }

  const message = err.message.toLowerCase()

  if (
    message.includes('not enough stock') ||
    message.includes('stock') ||
    message.includes('selected color is unavailable') ||
    message.includes('product is unavailable') ||
    message.includes('product not found')
  ) {
    return 'One item is no longer available in the selected quantity. Please update your bag.'
  }

  if (message.includes('invalid quantity')) {
    return 'Please check the quantity for the selected item.'
  }

  return err.message || fallback
}
