/**
 * Seed script for ninebells.
 *
 * Creates 5 practitioner accounts and a variety of sits across
 * all lifecycle states so the UX can be evaluated with realistic data.
 *
 * Usage:
 *   pnpm seed                     # seed with default data
 *   pnpm seed:reset               # wipe sits + seed users, re-seed
 *
 * Your real Clerk account is untouched — seed users have fake clerk IDs
 * and won't conflict. You can join their sits from the board.
 */

import * as fs from "fs"
import * as path from "path"
import { Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import { eq, sql } from "drizzle-orm"
import * as schema from "./schema"

// Load .env.local for DATABASE_URL
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8")
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    const val = trimmed.slice(eqIdx + 1)
    if (!process.env[key]) {
      process.env[key] = val
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set. Add it to .env.local")
  process.exit(1)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool, { schema })

// -- Seed practitioners ---------------------------------------------------

const practitioners = [
  {
    clerkUserId: "seed_richard_001",
    displayName: "Richard",
    timezone: "Europe/London",
    bio: "Long-time EI practitioner. Interested in the nature of awareness.",
    openToBeginners: true,
  },
  {
    clerkUserId: "seed_maya_002",
    displayName: "Maya",
    timezone: "America/New_York",
    bio: "Exploring embodied inquiry. Six years of practice.",
    openToBeginners: true,
  },
  {
    clerkUserId: "seed_daniel_003",
    displayName: "Daniel",
    timezone: "Europe/Berlin",
    bio: "Daily sitter. Drawn to the direct path.",
    openToBeginners: false,
  },
  {
    clerkUserId: "seed_sofia_004",
    displayName: "Sofia",
    timezone: "America/Los_Angeles",
    bio: "New to dyad inquiry but experienced meditator.",
    openToBeginners: true,
  },
  {
    clerkUserId: "seed_kenji_005",
    displayName: "Kenji",
    timezone: "Asia/Tokyo",
    bio: null,
    openToBeginners: false,
  },
]

// -- Helpers --------------------------------------------------------------

function minutesFromNow(mins: number): Date {
  return new Date(Date.now() + mins * 60 * 1000)
}

function hoursFromNow(hrs: number): Date {
  return new Date(Date.now() + hrs * 60 * 60 * 1000)
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

// -- Main -----------------------------------------------------------------

const isReset = process.argv.includes("--reset")

async function seed() {
  console.log(isReset ? "Resetting and re-seeding..." : "Seeding...")

  if (isReset) {
    // Delete seed sits first (FK constraint), then seed users
    await db.delete(schema.sits).where(
      sql`${schema.sits.hostUserId} IN (
        SELECT id FROM users WHERE clerk_user_id LIKE 'seed_%'
      )`
    )
    // Also delete sits where seed users are guests
    await db.execute(sql`
      UPDATE sits SET guest_user_id = NULL, status = 'open'
      WHERE guest_user_id IN (
        SELECT id FROM users WHERE clerk_user_id LIKE 'seed_%'
      )
    `)
    await db.delete(schema.users).where(
      sql`${schema.users.clerkUserId} LIKE 'seed_%'`
    )
    console.log("  Cleared previous seed data.")
  }

  // Upsert practitioners
  const userMap: Record<string, string> = {} // displayName -> id

  for (const p of practitioners) {
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.clerkUserId, p.clerkUserId))
      .limit(1)

    if (existing.length > 0) {
      userMap[p.displayName] = existing[0].id
      console.log(`  User "${p.displayName}" already exists.`)
    } else {
      const [created] = await db
        .insert(schema.users)
        .values(p)
        .returning()
      userMap[p.displayName] = created.id
      console.log(`  Created user "${p.displayName}".`)
    }
  }

  // -- Create sits --------------------------------------------------------

  const sitData = [
    // === AVAILABLE NOW (open, starts within 10 min) ===
    {
      hostUserId: userMap["Richard"],
      startsAt: minutesFromNow(2),
      durationMinutes: 40,
      practiceType: "EI",
      instructionText: "Who am I?",
      meetingUrl: "https://meet.example.com/richard-ei",
      note: null,
      status: "open",
    },
    {
      hostUserId: userMap["Maya"],
      startsAt: minutesFromNow(5),
      durationMinutes: 30,
      practiceType: "EI",
      instructionText: "Tell me who you are.",
      meetingUrl: "https://zoom.us/j/maya-practice",
      note: "Happy to work with beginners",
      status: "open",
    },
    {
      hostUserId: userMap["Kenji"],
      startsAt: minutesFromNow(8),
      durationMinutes: 20,
      practiceType: "EI",
      instructionText: "What is here right now?",
      meetingUrl: "https://meet.example.com/kenji",
      note: null,
      status: "open",
    },

    // === UPCOMING (open, starts > 10 min from now) ===
    {
      hostUserId: userMap["Daniel"],
      startsAt: hoursFromNow(1.5),
      durationMinutes: 40,
      practiceType: "EI",
      instructionText: "What do you actually know?",
      meetingUrl: "https://meet.example.com/daniel",
      note: "Experienced practitioners preferred",
      status: "open",
    },
    {
      hostUserId: userMap["Sofia"],
      startsAt: hoursFromNow(3),
      durationMinutes: 60,
      practiceType: "EI",
      instructionText: "Tell me what you are.",
      meetingUrl: "https://zoom.us/j/sofia-ei",
      note: null,
      status: "open",
    },
    {
      hostUserId: userMap["Richard"],
      startsAt: hoursFromNow(5),
      durationMinutes: 40,
      practiceType: "EI",
      instructionText: "What is awareness?",
      meetingUrl: "https://meet.example.com/richard-evening",
      note: null,
      status: "open",
    },

    // === JOINED (confirmed, with a guest) ===
    {
      hostUserId: userMap["Maya"],
      guestUserId: userMap["Daniel"],
      startsAt: hoursFromNow(0.5),
      durationMinutes: 40,
      practiceType: "EI",
      instructionText: "Who am I?",
      meetingUrl: "https://zoom.us/j/maya-daniel",
      note: null,
      status: "joined",
    },

    // === COMPLETED (past sits) ===
    {
      hostUserId: userMap["Richard"],
      guestUserId: userMap["Sofia"],
      startsAt: daysAgo(1),
      durationMinutes: 40,
      practiceType: "EI",
      instructionText: "Tell me who you are.",
      meetingUrl: "https://meet.example.com/past-1",
      note: null,
      status: "completed",
    },
    {
      hostUserId: userMap["Daniel"],
      guestUserId: userMap["Kenji"],
      startsAt: daysAgo(2),
      durationMinutes: 30,
      practiceType: "EI",
      instructionText: "What is here right now?",
      meetingUrl: "https://meet.example.com/past-2",
      note: null,
      status: "completed",
    },
    {
      hostUserId: userMap["Maya"],
      guestUserId: userMap["Richard"],
      startsAt: daysAgo(3),
      durationMinutes: 60,
      practiceType: "EI",
      instructionText: "What do you actually know?",
      meetingUrl: "https://meet.example.com/past-3",
      note: null,
      status: "completed",
    },

    // === CANCELLED ===
    {
      hostUserId: userMap["Sofia"],
      startsAt: daysAgo(1),
      durationMinutes: 40,
      practiceType: "EI",
      instructionText: "Who am I?",
      meetingUrl: "https://zoom.us/j/cancelled",
      note: null,
      status: "cancelled",
      cancelledAt: daysAgo(1),
    },

    // === EXPIRED (old open sit that was never joined) ===
    {
      hostUserId: userMap["Kenji"],
      startsAt: daysAgo(0.5),
      durationMinutes: 20,
      practiceType: "EI",
      instructionText: "What is this?",
      meetingUrl: "https://meet.example.com/expired",
      note: null,
      status: "expired",
    },
  ]

  let created = 0
  for (const sit of sitData) {
    await db.insert(schema.sits).values(sit)
    created++
  }

  console.log(`  Created ${created} sits.`)
  console.log("")
  console.log("Seed complete. Summary:")
  console.log("  3 × Available Now (open, join from board)")
  console.log("  3 × Upcoming (open, scheduled)")
  console.log("  1 × Joined (confirmed pair)")
  console.log("  3 × Completed (past)")
  console.log("  1 × Cancelled")
  console.log("  1 × Expired")
  console.log("")
  console.log("Sign in with your real account and browse the board.")

  await pool.end()
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
