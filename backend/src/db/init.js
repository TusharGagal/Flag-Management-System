import "dotenv/config";

import pool from "./pool.js";
async function initDB() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Organization Table
    // Each organization is a separate tenant.
    // Each organization has its own set of feature flags.
    await client.query(`
        CREATE TABLE IF NOT EXISTS Organization(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            Slug VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT NOW()
        )
        `);

    // User Table
    // Each user is associated with an organization.
    // Single table for all user types. Role differentiates behavior.
    // Super admin is intentionally NOT stored here (uses .env static credentials).
    // role CHECK constraint means the DB itself rejects any invalid role string.

    await client.query(`
        CREATE TABLE IF NOT EXISTS app_users(
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role varchar(50) CHECK (role IN ('super_admin', 'org_admin', 'end_user')) NOT NULL,
            org_id  Integer NOT NULL REFERENCES Organization(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);

    // ── FEATURE FLAGS ──────────────────────────────────────────────────────
    // Flags are scoped per organization via org_id.
    // UNIQUE(org_id, feature_key): the same key ("dark_mode") can exist in multiple orgs, but must be unique within one org.

    await client.query(`
        CREATE TABLE IF NOT EXISTS FeatureFlag(
            id SERIAL PRIMARY KEY,
            org_id INTEGER NOT NULL REFERENCES Organization(id) ON DELETE CASCADE,
            feature_key VARCHAR(255) NOT NULL UNIQUE,
            is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at  TIMESTAMPTZ  DEFAULT NOW(),
            UNIQUE(org_id, feature_key)
        )
    `);

    await client.query("COMMIT");
    console.log("Database initialized successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "Database initialization failed, rolled Back:",
      error.message,
    );
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initDB();
