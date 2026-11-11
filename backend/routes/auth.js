const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { getJwtSecret } = require("../middleware/auth");

const router = express.Router();

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

function createToken(user) {
  return jwt.sign({ role: user.role }, getJwtSecret(), {
    subject: String(user.id),
    expiresIn: "7d",
  });
}

router.post("/register", async (req, res) => {
  const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (fullName.length < 2 || fullName.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone.length < 6 || phone.length > 30 || password.length < 8 || password.length > 72) {
    return res.status(400).json({ message: "Provide a valid name, email, phone number, and password (8–72 characters)." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, email, phone, role`,
    [fullName, email, phone, passwordHash]
  );
  const user = result.rows[0];

  return res.status(201).json({ user: publicUser(user), token: createToken(user) });
});

router.post("/login", async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const result = await pool.query(
    "SELECT id, full_name, email, phone, role, password_hash FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({ user: publicUser(user), token: createToken(user) });
});

module.exports = router;
