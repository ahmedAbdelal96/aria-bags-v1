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

function summarizeRows(rows) {
  return (rows || []).map((row) => ({
    id: row.id ?? null,
    status: row.status ?? null,
    created_at: row.created_at ?? null,
    customer_name: row.customer_name ?? null,
    customer_phone: row.customer_phone ?? null,
    item_count: row.item_count ?? null,
  }))
}

function classify(result) {
  const { serviceOrders, serviceItems, anonOrders, anonItems, adminOrders, adminItems, adminAuthTested, latestServiceStatuses } = result

  if (serviceOrders.count === 0) return 'A. Order was not created'
  if (serviceItems.count === 0) return 'B. order_items missing'

  const serviceHasPending = latestServiceStatuses.includes('pending_confirmation')
  const adminVisible = adminAuthTested ? adminOrders.count > 0 : false
  const adminItemsVisible = adminAuthTested ? adminItems.count > 0 : false

  if (adminAuthTested) {
    if (adminOrders.count === 0 && adminItems.count === 0) return 'C. RLS blocks admin SELECT on orders'
    if (adminOrders.count === 0 && adminItems.count > 0) return 'C. RLS blocks admin SELECT on orders'
    if (adminOrders.count > 0 && adminItems.count === 0) return 'D. RLS blocks admin SELECT on order_items'
    if (!serviceHasPending) return 'E. Admin query filters out pending_confirmation'
    if (adminVisible && !adminItemsVisible) return 'D. RLS blocks admin SELECT on order_items'
    return 'G. UI tab filter issue or stale rendering'
  }

  if (anonOrders.count === 0 && anonItems.count === 0) {
    if (serviceHasPending) return 'C. RLS blocks admin SELECT on orders'
    return 'G. UI tab filter issue or stale rendering'
  }

  if (anonOrders.count === 0 && anonItems.count > 0) return 'C. RLS blocks admin SELECT on orders'
  if (anonOrders.count > 0 && anonItems.count === 0) return 'D. RLS blocks admin SELECT on order_items'

  if (!serviceHasPending) return 'E. Admin query filters out pending_confirmation'
  return 'F. Page caching/static rendering issue'
}

async function main() {
  const env = { ...parseEnv(path.join(process.cwd(), '.env.local')), ...process.env }
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  const adminEmail = env.ADMIN_TEST_EMAIL || null
  const adminPassword = env.ADMIN_TEST_PASSWORD || null

  if (!url || !anonKey || !serviceKey) {
    throw new Error('Missing Supabase URL, anon key, or service role key.')
  }

  const anonClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const serviceClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const [serviceOrdersResult, serviceItemsResult, anonOrdersResult, anonItemsResult] = await Promise.all([
    serviceClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    serviceClient
      .from('order_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    anonClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    anonClient
      .from('order_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const adminSessionClient = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: false },
  })

  let adminAuthTested = false
  let adminOrdersResult = { data: [], error: null }
  let adminItemsResult = { data: [], error: null }

  if (adminEmail && adminPassword) {
    const loginResult = await adminSessionClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })

    if (loginResult.error) {
      adminAuthTested = true
      adminOrdersResult = { data: [], error: loginResult.error }
      adminItemsResult = { data: [], error: loginResult.error }
    } else {
      adminAuthTested = true
      ;[adminOrdersResult, adminItemsResult] = await Promise.all([
        adminSessionClient
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        adminSessionClient
          .from('order_items')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ])
      await adminSessionClient.auth.signOut()
    }
  }

  const result = {
    serviceOrders: {
      count: serviceOrdersResult.data?.length ?? 0,
      error: safeError(serviceOrdersResult.error),
      rows: summarizeRows(serviceOrdersResult.data),
    },
    serviceItems: {
      count: serviceItemsResult.data?.length ?? 0,
      error: safeError(serviceItemsResult.error),
      rows: summarizeRows(serviceItemsResult.data),
    },
    anonOrders: {
      count: anonOrdersResult.data?.length ?? 0,
      error: safeError(anonOrdersResult.error),
      rows: summarizeRows(anonOrdersResult.data),
    },
    anonItems: {
      count: anonItemsResult.data?.length ?? 0,
      error: safeError(anonItemsResult.error),
      rows: summarizeRows(anonItemsResult.data),
    },
    adminAuthTested,
    adminOrders: {
      count: adminOrdersResult.data?.length ?? 0,
      error: safeError(adminOrdersResult.error),
      rows: summarizeRows(adminOrdersResult.data),
    },
    adminItems: {
      count: adminItemsResult.data?.length ?? 0,
      error: safeError(adminItemsResult.error),
      rows: summarizeRows(adminItemsResult.data),
    },
  }

  const latestServiceStatuses = result.serviceOrders.rows.map((row) => row.status).filter(Boolean)
  const rootCause = classify({
    ...result,
    latestServiceStatuses,
  })

  console.log(
    JSON.stringify(
      {
        rootCause,
        latestServiceStatuses,
        ...result,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error('[ARIA ADMIN VISIBILITY] failed')
  console.error(safeError(error) ?? error?.message ?? error)
  process.exitCode = 1
})
