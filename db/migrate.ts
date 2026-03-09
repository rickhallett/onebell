/**
 * Direct SQL migration for onebell.
 * Creates the users and sits tables if they don't exist.
 * Safe to run multiple times (CREATE IF NOT EXISTS).
 *
 * Usage: pnpm db:migrate
 */

import "./env" // Load .env.local, validate DATABASE_URL
import { Pool } from "@neondatabase/serverless"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const forceReset = process.argv.includes("--force")

const dropMigration = `
  DROP TABLE IF EXISTS sits CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
`

const createMigration = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    timezone TEXT NOT NULL,
    bio TEXT,
    open_to_beginners BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
  );

  CREATE TABLE IF NOT EXISTS sits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_user_id UUID NOT NULL REFERENCES users(id),
    guest_user_id UUID REFERENCES users(id),
    starts_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    practice_type TEXT NOT NULL,
    instruction_text TEXT NOT NULL,
    meeting_url TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
  );
`

async function migrate() {
  const client = await pool.connect()
  try {
    if (forceReset) {
      console.log("Force reset: dropping users + sits tables...")
      await client.query(dropMigration)
      console.log("  Dropped.")
    }
    console.log("Running migration...")
    await client.query(createMigration)
    console.log("  Created tables: users, sits")
    console.log("Migration complete.")
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
