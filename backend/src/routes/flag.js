import express from "express";
import pool from "../db/pool.js";
import { Authentication, Authorize } from "../middleware/auth.js";
const router = express.Router();

// ── GET /api/flags

// Returns all flags for the logged-in admin's org.
// orgId comes from the JWT — the admin can't query another org's flags.
router.get("/", Authentication, Authorize("org_admin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM featureflag WHERE org_id = $1 ORDER BY created_at DESC`,
      [req.user.orgId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ── POST /api/flags

// Creates a new feature flag for the admin's org.
// Key is normalized to lowercase with underscores: "Dark Mode" → "dark_mode"
router.post("/", Authentication, Authorize("org_admin"), async (req, res) => {
  const { feature_key, is_enabled } = req.body;

  if (!feature_key || !feature_key.trim())
    return res.status(400).json({ error: "feature_key is required." });

  const normalizedKey = feature_key.trim().toLowerCase().replace(/\s+/g, "_");

  try {
    const result = await pool.query(
      `INSERT INTO featureflag (org_id, feature_key, is_enabled)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.orgId, normalizedKey, is_enabled ?? false],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({
        error: "A flag with this key already exists in your organization.",
      });
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ── PATCH /api/flags/:id

// Toggles is_enabled.
// WHERE includes org_id so an admin can't update another org's flag even if they guess the ID.
router.patch(
  "/:id",
  Authentication,
  Authorize("org_admin"),
  async (req, res) => {
    const { id } = req.params;
    const { is_enabled } = req.body;

    if (is_enabled === undefined)
      return res.status(400).json({ error: "Provide is_enabled to update." });

    try {
      const result = await pool.query(
        `UPDATE featureflag 
           SET is_enabled = $1, updated_at = NOW() 
           WHERE id = $2 AND org_id = $3 
           RETURNING *`,
        [is_enabled, id, req.user.orgId],
      );

      if (result.rows.length === 0)
        return res
          .status(404)
          .json({ error: "Flag not found or access denied." });

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error." });
    }
  },
);

// ── DELETE /api/flags/:id
router.delete(
  "/:id",
  Authentication,
  Authorize("org_admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM featureflag WHERE id = $1 AND org_id = $2 RETURNING id`,
        [req.params.id, req.user.orgId],
      );

      if (result.rows.length === 0)
        return res
          .status(404)
          .json({ error: "Flag not found or access denied." });

      res.json({ message: "Flag deleted successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error." });
    }
  },
);

// ── GET /api/flags/check

// PUBLIC — no auth required.
// End users hit this to check whether a feature is on for their org.
// This mirrors how real feature flag SDKs work — client sends context, gets a boolean back.
router.get("/check", async (req, res) => {
  const { org_id, feature_key } = req.query;

  if (!org_id || !feature_key)
    return res
      .status(400)
      .json({ error: "org_id and feature_key are required query params." });

  try {
    const result = await pool.query(
      `SELECT is_enabled FROM featureflag WHERE org_id = $1 AND feature_key = $2`,
      [org_id, feature_key.toLowerCase()],
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ error: "Feature flag not found for this organization." });

    res.json({ feature_key, is_enabled: result.rows[0].is_enabled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
