import jwt from "jsonwebtoken";
/**
 * authenticate
 * Reads the Bearer token from the Authorization header and verifies it.
 * Attaches decoded payload to req.user = { id, email, role, orgId }
 */
export function Authentication(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing or malformed Authorization header." });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

/**
 * authorize(...roles)
 * Factory that returns a middleware checking req.user.role.
 * Must always be used AFTER authenticate.
 *
 * Usage:
 *   router.get('/orgs', authenticate, authorize('super_admin'), handler)
 *   router.post('/flags', authenticate, authorize('org_admin'), handler)
 */

export function Authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Access denied: insufficient permissions." });
    }
    next();
  };
}
