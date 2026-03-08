import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect("/app")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <main className="flex max-w-sm flex-col items-center gap-10 text-center">
        <div className="space-y-4">
          <h1 className="font-serif text-5xl font-medium tracking-tight">
            ninebells
          </h1>
          <p className="text-base leading-relaxed text-muted">
            A sit board for dyad inquiry practitioners.
            Signal availability. Find a partner. Sit together.
          </p>
        </div>

        <div className="w-full space-y-3">
          <Link
            href="/sign-in"
            className="flex min-h-12 w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-accent-light"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="flex min-h-12 w-full items-center justify-center rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Create account
          </Link>
        </div>

        <p className="text-xs text-muted">
          Two or three taps from &ldquo;I want to sit&rdquo; to &ldquo;I am sitting with someone.&rdquo;
        </p>
      </main>
    </div>
  )
}
