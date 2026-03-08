"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/app", label: "Board" },
  { href: "/app/my-sits", label: "My Sits" },
  { href: "/app/profile", label: "Profile" },
] as const

export function AppNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/app") return pathname === "/app"
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background">
      <div className="mx-auto flex max-w-lg">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-12 flex-1 items-center justify-center text-sm font-medium transition-colors ${
                active
                  ? "text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
