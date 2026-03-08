import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core"

// -- Sit status values ---------------------------------------------------

export const sitStatusValues = [
  "open",
  "joined",
  "cancelled",
  "completed",
  "expired",
] as const

export type SitStatus = (typeof sitStatusValues)[number]

// -- Users table ---------------------------------------------------------

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").unique().notNull(),
  displayName: text("display_name").notNull(),
  timezone: text().notNull(),
  bio: text(),
  openToBeginners: boolean("open_to_beginners").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
})

// -- Sits table ----------------------------------------------------------

export const sits = pgTable("sits", {
  id: uuid().primaryKey().defaultRandom(),
  hostUserId: uuid("host_user_id")
    .notNull()
    .references(() => users.id),
  guestUserId: uuid("guest_user_id").references(() => users.id),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  practiceType: text("practice_type").notNull(),
  instructionText: text("instruction_text").notNull(),
  meetingUrl: text("meeting_url").notNull(),
  note: text(),
  status: text().notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
})

// -- Type exports --------------------------------------------------------

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Sit = typeof sits.$inferSelect
export type NewSit = typeof sits.$inferInsert
