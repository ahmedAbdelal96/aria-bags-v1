import Link from 'next/link'
import { redirect } from 'next/navigation'
import { buildLoginRedirect } from '@/lib/auth/redirect'
import { getAdminAuthState } from '@/lib/auth/admin'
import { debugServer } from '@/lib/debug'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, isAdmin } = await getAdminAuthState()

  if (!user) {
    debugServer('auth.redirect', {
      reason: 'guest',
      destination: buildLoginRedirect('/admin'),
    })
    redirect(buildLoginRedirect('/admin'))
  }

  if (!isAdmin) {
    debugServer('auth.redirect', {
      reason: 'not_admin',
      destination: '/',
      userId: user.id,
      email: user.email ?? null,
      profileId: profile?.id ?? null,
      profileEmail: profile?.email ?? null,
      profileIsAdmin: profile?.is_admin ?? null,
    })
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-admin-bg">
      <AdminSidebar adminEmail={user.email || undefined} />

      <div className="flex flex-1 flex-col">
        <header className="md:hidden sticky top-0 z-50 flex items-center justify-between border-b border-admin-border/20 bg-admin-sidebar text-admin-sidebar-text px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-xl tracking-[0.2em] text-white">ARIA</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-admin-accent bg-admin-accent/15 px-2 py-0.5 rounded">
              Admin
            </span>
          </div>
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.08em] text-admin-sidebar-muted hover:text-white transition-colors">
            Store
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
