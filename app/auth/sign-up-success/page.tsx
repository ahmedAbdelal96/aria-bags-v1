import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign-up is not used for customers</CardTitle>
              <CardDescription>ARIA shoppers use guest checkout instead</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This route is kept for legacy compatibility only. Use guest checkout to place an
                order, or go to admin login for store management access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
