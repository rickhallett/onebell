"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  {
    href: "/app",
    label: "Board",
    // Grid/board icon
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/app/my-sits",
    label: "My Sits",
    // Lotus/sitting icon (simplified)
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3" />
        <path d="M12 11v3" />
        <path d="M8 20c0-3 1.8-5 4-5s4 2 4 5" />
      </svg>
    ),
  },
  {
    href: "/app/profile",
    label: "Profile",
    // Person icon
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20c0-4 3.1-7 7-7s7 3 7 7" />
      </svg>
    ),
  },
] as const

export function AppNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/app") return pathname === "/app"
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                active
                  ? "text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
