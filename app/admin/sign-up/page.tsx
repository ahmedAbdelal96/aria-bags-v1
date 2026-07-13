import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(201,168,122,0.12),_transparent_42%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--muted)/0.35))] p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-primary/15 bg-card/80 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Admin access only</CardTitle>
            <CardDescription>
              ARIA does not offer customer registration. This route is reserved for store management.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Admin accounts are created manually by the store owner or through a controlled process.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/admin/login">Go to admin login</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/">Back to storefront</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
