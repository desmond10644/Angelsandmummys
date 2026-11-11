const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "replace_with_a_long_random_secret" || secret.length < 32) {
    throw new Error("Set JWT_SECRET to a random value of at least 32 characters in backend/.env");
  }
  return secret;
}

function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = { id: Number(payload.sub), role: payload.role };
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    return next(error);
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  return next();
}

module.exports = { getJwtSecret, requireAuth, requireAdmin };
