"use client"

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-medium">Something went wrong</h1>
        <p className="mt-3 text-muted">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-8 min-h-12 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent-light"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
