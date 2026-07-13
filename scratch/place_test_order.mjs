import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const text = fs.readFileSync(filePath, 'utf8')
  const env = {}
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

function safeError(error) {
  if (!error) return null
  return {
    code: error.code ?? null,
    message: error.message ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
  }
}

function firstColorWithStock(colors, minStock = 1) {
  if (!Array.isArray(colors)) return null
  return (
    colors.find((color) => Number(color?.stock ?? color?.stock_quantity ?? 0) >= minStock) ??
    null
  )
}

function getNumericStock(color) {
  if (!color) return 0
  return Number(color.stock ?? color.stock_quantity ?? 0)
}

async function readOrder(adminClient, orderId) {
  const { data, error } = await adminClient
    .from('orders')
    .select('id, status, confirmation_attempts, last_contact_attempt_at, confirmed_at, shipping_at, delivered_at, cancelled_at, returned_at, cancellation_reason, return_reason, internal_notes, total_amount, created_at, updated_at')
    .eq('id', orderId)
    .maybeSingle()

  if (error) throw error
  return data
}

async function callStatusUpdate(client, orderId, status, reason = null) {
  const { data, error } = await client.rpc('update_order_status', {
    p_order_id: orderId,
    p_status: status,
    p_reason: reason,
    p_internal_notes: null,
  })

  if (error) throw error
  return data
}

async function callContactAttempt(client, orderId, note = null) {
  const { data, error } = await client.rpc('record_order_contact_attempt', {
    p_order_id: orderId,
    p_note: note,
  })

  if (error) throw error
  return data
}

async function main() {
  const env = { ...parseEnv(path.join(process.cwd(), '.env.local')), ...process.env }
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  const adminEmail = env.ADMIN_TEST_EMAIL || null
  const adminPassword = env.ADMIN_TEST_PASSWORD || null

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  const publicClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const adminClient = serviceKey
    ? createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : publicClient

  const { data: products, error: productError } = await adminClient
    .from('products')
    .select('id, name, slug, status, price, sale_price, colors, image_url')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (productError) throw productError

  const product = (products || []).find((row) => firstColorWithStock(row.colors, 3))
  if (!product) {
    throw new Error('No active product with stock >= 3 was found.')
  }

  const color = firstColorWithStock(product.colors, 3)
  const colorName = color?.name ?? null
  const beforeStock = getNumericStock(color)

  const signInClient = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: false },
  })

  let adminSession = null
  if (adminEmail && adminPassword) {
    const loginResult = await signInClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })

    if (loginResult.error) {
      console.warn('[ARIA TEST ORDER] admin login failed, lifecycle RPCs will be skipped')
      console.warn(safeError(loginResult.error))
    } else {
      adminSession = loginResult.data.session ?? null
    }
  } else {
    console.warn('[ARIA TEST ORDER] ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD not set, lifecycle RPCs will be skipped')
  }

  const inspectionClient = adminSession ? signInClient : adminClient

  const { data: createdOrder, error: createError } = await publicClient.rpc('create_guest_order', {
    p_customer_name: `Test Customer ${Date.now()}`,
    p_customer_phone: '01000000000',
    p_customer_phone_2: null,
    p_shipping_address: 'Test address for checkout verification',
    p_notes: 'Automated checkout smoke test',
    p_items: [
      {
        product_id: product.id,
        quantity: 1,
        color_name: colorName,
      },
    ],
  })

  if (createError) {
    if (createError.code === '42703' && String(createError.message || '').includes('customer_email')) {
      console.error('[ARIA TEST ORDER] live database is still missing public.orders.customer_email. Apply supabase/migrations/013_order_operations_workflow.sql (or the equivalent SQL) and retry.')
    }
    throw createError
  }

  const created = Array.isArray(createdOrder) ? createdOrder[0] : createdOrder
  const orderId = created?.order_id
  const confirmationToken = created?.confirmation_token

  if (!orderId || !confirmationToken) {
    throw new Error('create_guest_order did not return order_id and confirmation_token.')
  }

  const { data: orderRow } = await inspectionClient
    .from('orders')
    .select('id, customer_name, customer_phone, customer_phone_2, shipping_address, notes, confirmation_token, total_amount, status')
    .eq('id', orderId)
    .maybeSingle()

  const { data: items } = await inspectionClient
    .from('order_items')
    .select('id, product_id, product_name, color_name, color_hex, quantity, price, unit_price, total_price')
    .eq('order_id', orderId)

  const { data: confirmation, error: confirmationError } = await publicClient.rpc('get_guest_order_confirmation', {
    p_order_id: orderId,
    p_confirmation_token: confirmationToken,
  })

  const { data: productsAfter } = await inspectionClient
    .from('products')
    .select('id, colors')
    .eq('id', product.id)
    .maybeSingle()

  const afterColor = firstColorWithStock(productsAfter?.colors ?? [], 0)
  const afterStock = getNumericStock(afterColor)

  const result = {
    product: {
      id: product.id,
      name: product.name,
      colorName,
      beforeStock,
      afterStock,
    },
    order: {
      id: orderId,
      status: orderRow?.status ?? null,
      total_amount: orderRow?.total_amount ?? null,
    },
    items,
    confirmationExists: Boolean(confirmation),
    confirmationError: safeError(confirmationError),
  }

  if (adminSession) {
    const contactResult = await callContactAttempt(signInClient, orderId, 'No answer')
    const confirmedResult = await callStatusUpdate(signInClient, orderId, 'confirmed')
    const shippingResult = await callStatusUpdate(signInClient, orderId, 'shipping')
    const deliveredResult = await callStatusUpdate(signInClient, orderId, 'delivered')
    const deliveredOrder = await readOrder(inspectionClient, orderId)

    const { data: cancelOrderData, error: cancelOrderError } = await publicClient.rpc('create_guest_order', {
      p_customer_name: `Cancel Test ${Date.now()}`,
      p_customer_phone: '01000000001',
      p_customer_phone_2: null,
      p_shipping_address: 'Cancel test address',
      p_notes: null,
      p_items: [
        {
          product_id: product.id,
          quantity: 1,
          color_name: colorName,
        },
      ],
    })

    if (cancelOrderError) throw cancelOrderError

    const cancelCreated = Array.isArray(cancelOrderData) ? cancelOrderData[0] : cancelOrderData
    const cancelOrderId = cancelCreated?.order_id
    if (!cancelOrderId) throw new Error('Failed to create cancel test order.')
    const cancelUpdateResult = await callStatusUpdate(signInClient, cancelOrderId, 'cancelled', 'Customer cancelled')
    const cancelledOrder = await readOrder(inspectionClient, cancelOrderId)

    const { data: returnOrderData, error: returnOrderError } = await publicClient.rpc('create_guest_order', {
      p_customer_name: `Return Test ${Date.now()}`,
      p_customer_phone: '01000000002',
      p_customer_phone_2: null,
      p_shipping_address: 'Return test address',
      p_notes: null,
      p_items: [
        {
          product_id: product.id,
          quantity: 1,
          color_name: colorName,
        },
      ],
    })

    if (returnOrderError) throw returnOrderError

    const returnCreated = Array.isArray(returnOrderData) ? returnOrderData[0] : returnOrderData
    const returnOrderId = returnCreated?.order_id
    if (!returnOrderId) throw new Error('Failed to create return test order.')
    await callStatusUpdate(signInClient, returnOrderId, 'confirmed')
    await callStatusUpdate(signInClient, returnOrderId, 'shipping')
    const returnUpdateResult = await callStatusUpdate(signInClient, returnOrderId, 'returned', 'Damaged on arrival')
    const returnedOrder = await readOrder(inspectionClient, returnOrderId)

    result.lifecycle = {
      contactResult,
      confirmedResult,
      shippingResult,
      deliveredResult,
      deliveredOrder,
      cancelUpdateResult,
      cancelledOrder,
      returnUpdateResult,
      returnedOrder,
    }

    await signInClient.auth.signOut()
  }

  console.log('[ARIA TEST ORDER] result', JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error('[ARIA TEST ORDER] failed')
  console.error(safeError(error) ?? error?.message ?? error)
  process.exitCode = 1
})
