"use server"

import { requireUser } from "@/lib/auth"
import { getUserByClerkId, getUserSits } from "@/db/queries"
import type { Sit } from "@/db/schema"

type SitWithNames = Sit & {
  hostDisplayName: string
  guestDisplayName: string | null
}

export type MySitsResult = {
  userId: string
  hosting: SitWithNames[]
  joined: SitWithNames[]
  past: SitWithNames[]
}

export async function mySitsAction(): Promise<MySitsResult> {
  const clerkUserId = await requireUser()
  const user = await getUserByClerkId(clerkUserId)
  if (!user) throw new Error("User not found")

  const allSits = await getUserSits(user.id)

  const hosting: SitWithNames[] = []
  const joined: SitWithNames[] = []
  const past: SitWithNames[] = []

  for (const sit of allSits) {
    const isPast =
      sit.status === "completed" ||
      sit.status === "cancelled" ||
      sit.status === "expired"

    if (isPast) {
      past.push(sit)
    } else if (sit.hostUserId === user.id) {
      hosting.push(sit)
    } else if (sit.guestUserId === user.id) {
      joined.push(sit)
    }
  }

  return { userId: user.id, hosting, joined, past }
}
