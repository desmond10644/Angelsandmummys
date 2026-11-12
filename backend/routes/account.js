const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/profile", async (req, res) => {
  const result = await pool.query(
    `SELECT id, full_name, email, phone, role, created_at
     FROM users WHERE id = $1`,
    [req.user.id]
  );
  if (!result.rowCount) return res.status(404).json({ message: "Account not found." });
  return res.json({ user: result.rows[0] });
});

router.get("/customers", requireAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.created_at,
            COUNT(o.id)::int AS order_count,
            MAX(o.created_at) AS last_order_at
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     WHERE u.role = 'user'
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
  return res.json({ customers: result.rows });
});

router.get("/admins", requireAdmin, async (_req, res) => {
  const result = await pool.query(
    `SELECT id, full_name, email, phone, created_at
     FROM users WHERE role = 'admin' ORDER BY created_at DESC`
  );
  return res.json({ admins: result.rows });
});

router.post("/admins", requireAdmin, async (req, res) => {
  const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (fullName.length < 2 || fullName.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone.length < 6 || phone.length > 30 ||
      password.length < 8 || password.length > 72) {
    return res.status(400).json({
      message: "Provide a valid name, email, phone number, and password (8–72 characters).",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, 'admin')
     RETURNING id, full_name, email, phone, role, created_at`,
    [fullName, email, phone, passwordHash]
  );
  return res.status(201).json({ admin: result.rows[0] });
});

router.get("/cart", async (req, res) => {
  const result = await pool.query(
    `SELECT p.id, p.name, p.category, p.price, p.image, p.stock, c.quantity
     FROM cart_items c JOIN products p ON p.id = c.product_id
     WHERE c.user_id = $1 AND p.active = TRUE ORDER BY p.id`,
    [req.user.id]
  );
  return res.json({ items: result.rows });
});

router.put("/cart", async (req, res) => {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length > 100 ||
      items.some((item) => !Number.isInteger(Number(item.productId)) ||
        !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1)) {
    return res.status(400).json({ message: "Cart must contain productId and a positive integer quantity for each item." });
  }

  const normalized = [...new Map(items.map((item) => [Number(item.productId), Number(item.quantity)])).entries()];
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (normalized.length) {
      const ids = normalized.map(([id]) => id);
      const products = await client.query(
        "SELECT id, stock FROM products WHERE id = ANY($1::int[]) AND active = TRUE",
        [ids]
      );
      if (products.rowCount !== ids.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "One or more products are unavailable." });
      }
      const stockById = new Map(products.rows.map((product) => [product.id, product.stock]));
      if (normalized.some(([id, quantity]) => quantity > stockById.get(id))) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Requested quantity exceeds available stock." });
      }
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);
    for (const [productId, quantity] of normalized) {
      await client.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [req.user.id, productId, quantity]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return res.json({ message: "Cart saved." });
});

router.get("/wishlist", async (req, res) => {
  const result = await pool.query(
    `SELECT p.id, p.name, p.category, p.price, p.rating, p.reviews,
            p.badge, p.description, p.image, p.stock
     FROM wishlist_items w JOIN products p ON p.id = w.product_id
     WHERE w.user_id = $1 AND p.active = TRUE ORDER BY w.created_at DESC`,
    [req.user.id]
  );
  return res.json({ products: result.rows });
});

router.put("/wishlist/:productId", async (req, res) => {
  const product = await pool.query(
    "SELECT id FROM products WHERE id = $1 AND active = TRUE",
    [req.params.productId]
  );
  if (!product.rowCount) return res.status(404).json({ message: "Product not found." });

  await pool.query(
    "INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [req.user.id, product.rows[0].id]
  );
  return res.status(204).end();
});

router.delete("/wishlist/:productId", async (req, res) => {
  await pool.query(
    "DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2",
    [req.user.id, req.params.productId]
  );
  return res.status(204).end();
});

module.exports = router;
