import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db/pool.js";
import { Authentication, Authorize } from "../middleware/auth.js";
const router = express.Router();
// ── POST /api/super-admin/login

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const validEmail = email === process.env.SUPER_ADMIN_EMAIL;
  const validPassword = password === process.env.SUPER_ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return res.status(400).json({ error: "Invalid Credentials." });
  }

  const token = jwt.sign(
    {
      id: 0,
      email: process.env.SUPER_ADMIN_EMAIL,
      role: "super_admin",
      orgId: null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  res.json({ token: token, role: "super_admin" });
});

// ── POST /api/super-admin/organizations

// // Creates a new tenant organization.
// Slug is derived from the name automatically.
router.post(
  "/organizations",
  Authentication,
  Authorize("super_admin"),
  async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ error: "Organization name is required." });

    // "Acme Corp!" → "acme-corp"
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    try {
      const result = await pool.query(
        `INSERT INTO organization (name, slug) VALUES ($1, $2) RETURNING *`,
        [name.trim(), slug],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505")
        // unique_violation
        return res
          .status(409)
          .json({ error: "An organization with that name already exists." });
      console.error(err);
      res.status(500).json({ error: "Internal server error." });
    }
  },
);

// ── GET /api/super-admin/organizations

// Lists all orgs with user and flag counts (useful for the dashboard table).
router.get(
  "/organizations",
  Authentication,
  Authorize("super_admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          o.*,
          COUNT(DISTINCT u.id) AS user_count,
          COUNT(DISTINCT f.id) AS flag_count
        FROM organization o
        LEFT JOIN app_users u         ON u.org_id = o.id
        LEFT JOIN featureflag f ON f.org_id = o.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error." });
    }
  },
);

export default router;
