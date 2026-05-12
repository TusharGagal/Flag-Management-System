import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/pool.js";
const router = express.Router();

// ── POST /api/auth/signup

// Org admins self-register using their org's slug.
// The slug tells us which organization they belong to.
router.post("/signup", async (req, res) => {
  const { email, password, orgSlug } = req.body;

  if (!email || !password || !orgSlug)
    return res
      .status(400)
      .json({ error: "Email, password, and orgSlug are required." });

  if (password.length < 6)
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });

  try {
    // 1. Verify the org exists
    const orgResult = await pool.query(
      `SELECT id FROM organization WHERE slug = $1`,
      [orgSlug.trim()],
    );
    if (orgResult.rows.length === 0)
      return res
        .status(404)
        .json({ error: "Organization not found. Double-check the slug." });

    const orgId = orgResult.rows[0].id;

    // 2. Hash password — salt rounds = 10 is the standard balance of speed vs security
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert user
    const result = await pool.query(
      `INSERT INTO app_users (email, password, role, org_id)
       VALUES ($1, $2, 'org_admin', $3)
       RETURNING id, email, role, org_id`,
      [email.toLowerCase().trim(), passwordHash, orgId],
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, orgId: user.org_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.status(201).json({
      token: token,
      role: user.role,
      orgId: user.org_id,
    });
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ── POST /api/auth/login

// Shared login for org_admin and end_user.
// The JWT carries the role so frontends can handle routing after login.
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  try {
    const result = await pool.query(
      `SELECT u.*, o.slug AS org_slug
       FROM app_users u
       JOIN organization o ON o.id = u.org_id
       WHERE u.email = $1`,
      [email.toLowerCase().trim()],
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password." });

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid)
      return res.status(401).json({ error: "Invalid email or password." });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, orgId: user.org_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token: token,
      role: user.role,
      orgId: user.org_id,
      orgSlug: user.org_slug,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
