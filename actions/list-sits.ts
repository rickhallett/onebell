"use server"

import { auth } from "@clerk/nextjs/server"
import { listOpenSits } from "@/db/queries"
import type { Sit } from "@/db/schema"

export type OpenSit = Sit & {
  hostDisplayName: string
  hostTimezone: string
  hostBio: string | null
  hostOpenToBeginners: boolean | null
}

/**
 * Obfuscate a display name for unauthenticated viewers.
 * "Richard" → "R•••", "Maya Chen" → "M•••"
 */
function obfuscateName(name: string): string {
  if (!name) return "Practitioner"
  return `${name[0]}${"•".repeat(3)}`
}

/**
 * List open sits. Available without auth, but names are obfuscated
 * for unauthenticated callers. Join requires separate auth check.
 */
export async function listSitsAction(): Promise<OpenSit[]> {
  const { userId: clerkId } = await auth()
  const isAuthenticated = !!clerkId

  const sits = await listOpenSits()

  if (isAuthenticated) {
    return sits
  }

  // Obfuscate host identity for unauthenticated viewers
  return sits.map((sit) => ({
    ...sit,
    hostDisplayName: obfuscateName(sit.hostDisplayName),
    hostBio: null,
    hostTimezone: "",
  }))
}
