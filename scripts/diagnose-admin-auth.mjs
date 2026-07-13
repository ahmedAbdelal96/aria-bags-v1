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

function normalizeEmail(value) {
  return (value || '').trim().toLowerCase()
}

function parseArgs(argv) {
  const args = {
    email: null,
    password: null,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i]

    if (current === '--email') {
      args.email = argv[i + 1] ?? null
      i += 1
      continue
    }

    if (current === '--password') {
      args.password = argv[i + 1] ?? null
      i += 1
      continue
    }

    if (!current.startsWith('--') && !args.email) {
      args.email = current
    }
  }

  return args
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

function print(label, value) {
  console.log(`${label}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
}

async function readAllUsers(adminClient) {
  const users = []
  let page = 1

  while (page <= 10) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 1000,
    })

    if (error) throw error

    const pageUsers = data?.users ?? []
    users.push(...pageUsers)

    if (pageUsers.length < 1000) break
    page += 1
  }

  return users
}

function classify({
  authUser,
  profile,
  profileReadError,
  selfReadAllowed,
  requestedEmail,
}) {
  if (!authUser) {
    return 'A. Auth user missing'
  }

  if (!profile) {
    return 'B. Profile row missing'
  }

  if (profile.id !== authUser.id) {
    return 'C. Profile id does not match auth user id'
  }

  if (profile.is_admin !== true) {
    return 'D. is_admin is false/null/not boolean true'
  }

  if (profileReadError && !selfReadAllowed) {
    return 'E. RLS blocks authenticated user from reading own profile'
  }

  if (normalizeEmail(profile.email) !== normalizeEmail(authUser.email)) {
    return 'G. Session/browser still logged into a different account'
  }

  if (profile.id === authUser.id && profile.is_admin === true && !profileReadError) {
    return 'F. App checks wrong field/table'
  }

  if (!requestedEmail || normalizeEmail(requestedEmail) !== normalizeEmail(authUser.email)) {
    return 'H. Wrong Supabase project/env or wrong email input'
  }

  return 'H. Wrong Supabase project/env'
}

async function main() {
  const env = {
    ...parseEnv(path.join(process.cwd(), '.env.local')),
    ...process.env,
  }

  const parsedArgs = parseArgs(process.argv.slice(2))
  const requestedEmail = parsedArgs.email || env.ADMIN_TEST_EMAIL || null
  const requestedPassword = parsedArgs.password || env.ADMIN_TEST_PASSWORD || null

  if (!requestedEmail) {
    throw new Error('Provide ADMIN_TEST_EMAIL or pass --email <address>.')
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  const adminClient = serviceKey
    ? createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null

  const anonClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  print('admin.email', requestedEmail)
  print('serviceRole.available', Boolean(serviceKey))

  let authUsers = []
  if (adminClient) {
    authUsers = await readAllUsers(adminClient)
  } else {
    print('auth.user', 'Skipped because SUPABASE_SERVICE_ROLE_KEY is missing.')
    print(
      'auth.instructions',
      'Run the SQL diagnostics file in Supabase SQL Editor if you do not have a service role key locally.',
    )
  }

  const authUser = authUsers.find((user) => normalizeEmail(user.email) === normalizeEmail(requestedEmail)) ?? null
  const profileResult = adminClient && authUser
    ? await adminClient
        .from('profiles')
        .select('id, email, is_admin, created_at, updated_at')
        .eq('id', authUser.id)
        .maybeSingle()
    : { data: null, error: null }

  const profile = profileResult.data ?? null
  const profileReadError = safeError(profileResult.error)

  let selfReadAllowed = null
  if (requestedPassword) {
    const loginResult = await anonClient.auth.signInWithPassword({
      email: requestedEmail,
      password: requestedPassword,
    })

    if (loginResult.error) {
      print('login.error', safeError(loginResult.error))
    } else {
      const signedInUser = loginResult.data.user ?? null
      if (signedInUser) {
        const selfReadResult = await anonClient
          .from('profiles')
          .select('id, email, is_admin')
          .eq('id', signedInUser.id)
          .maybeSingle()

        selfReadAllowed = !selfReadResult.error && Boolean(selfReadResult.data)
        print('rls.selfReadAllowed', selfReadAllowed)
        print('rls.selfReadError', safeError(selfReadResult.error))
        print('rls.selfReadProfile', selfReadResult.data)
      }

      await anonClient.auth.signOut()
    }
  } else {
    print('rls.selfReadAllowed', 'Not tested (no password supplied).')
  }

  print('auth.userFound', Boolean(authUser))
  print('auth.userId', authUser?.id ?? null)
  print('auth.userEmail', authUser?.email ?? null)
  print('auth.emailConfirmedAt', authUser?.email_confirmed_at ?? null)
  print('profile.found', Boolean(profile))
  print('profile.id', profile?.id ?? null)
  print('profile.email', profile?.email ?? null)
  print('profile.is_admin', profile?.is_admin ?? null)
  print('profile.is_admin_type', profile ? typeof profile.is_admin : null)
  print('profile.readError', profileReadError)
  print('email.mismatch', Boolean(profile && authUser && normalizeEmail(profile.email) !== normalizeEmail(authUser.email)))
  print(
    'likelyCause',
    classify({
      authUser,
      profile,
      profileReadError,
      selfReadAllowed,
      requestedEmail,
    }),
  )
}

main().catch((error) => {
  console.error('[ARIA ADMIN DEBUG] failed')
  console.error(safeError(error))
  process.exitCode = 1
})
