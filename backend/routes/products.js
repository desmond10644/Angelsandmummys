const express = require("express");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
const productFields = {
  name: "name",
  category: "category",
  price: "price",
  rating: "rating",
  reviews: "reviews",
  badge: "badge",
  description: "description",
  image: "image",
  stock: "stock",
};

function validProduct(body, partial = false) {
  const required = ["name", "category", "price", "description", "image", "stock"];
  if (!partial && required.some((field) => body[field] === undefined)) return false;
  if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim())) return false;
  if (body.category !== undefined && (typeof body.category !== "string" || !body.category.trim())) return false;
  for (const field of ["price", "stock", "reviews"]) {
    if (body[field] !== undefined && (!Number.isInteger(Number(body[field])) || Number(body[field]) < 0)) return false;
  }
  if (body.rating !== undefined && (!Number.isFinite(Number(body.rating)) || Number(body.rating) < 0 || Number(body.rating) > 5)) return false;
  for (const field of ["description", "image", "badge"]) {
    if (body[field] !== undefined && body[field] !== null && typeof body[field] !== "string") return false;
  }
  return true;
}

router.get("/", async (req, res) => {
  const values = [];
  const conditions = ["active = TRUE"];

  if (typeof req.query.category === "string" && req.query.category !== "All") {
    values.push(req.query.category);
    conditions.push(`category = $${values.length}`);
  }
  if (typeof req.query.q === "string" && req.query.q.trim()) {
    values.push(`%${req.query.q.trim()}%`);
    conditions.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length} OR category ILIKE $${values.length})`);
  }

  const result = await pool.query(
    `SELECT id, name, category, price, rating, reviews, badge, description, image, stock
     FROM products WHERE ${conditions.join(" AND ")} ORDER BY id`,
    values
  );
  return res.json({ products: result.rows });
});

router.get("/:id", async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, category, price, rating, reviews, badge, description, image, stock
     FROM products WHERE id = $1 AND active = TRUE`,
    [req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ message: "Product not found." });
  return res.json({ product: result.rows[0] });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  if (!validProduct(req.body)) {
    return res.status(400).json({ message: "Product fields are missing or invalid." });
  }

  const fields = Object.keys(productFields);
  const values = fields.map((field) => req.body[field] ?? null);
  const result = await pool.query(
    `INSERT INTO products (${fields.join(", ")})
     VALUES (${fields.map((_, index) => `$${index + 1}`).join(", ")})
     RETURNING id, name, category, price, rating, reviews, badge, description, image, stock`,
    values
  );
  return res.status(201).json({ product: result.rows[0] });
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  if (!validProduct(req.body, true)) {
    return res.status(400).json({ message: "Product fields are invalid." });
  }
  const entries = Object.entries(productFields).filter(([field]) => req.body[field] !== undefined);
  if (!entries.length) return res.status(400).json({ message: "Provide at least one product field to update." });

  const values = entries.map(([field]) => req.body[field]);
  const assignments = entries.map(([field], index) => `${productFields[field]} = $${index + 1}`);
  values.push(req.params.id);
  const result = await pool.query(
    `UPDATE products SET ${assignments.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length} AND active = TRUE
     RETURNING id, name, category, price, rating, reviews, badge, description, image, stock`,
    values
  );
  if (!result.rowCount) return res.status(404).json({ message: "Product not found." });
  return res.json({ product: result.rows[0] });
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query(
    "UPDATE products SET active = FALSE, updated_at = NOW() WHERE id = $1 AND active = TRUE RETURNING id",
    [req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ message: "Product not found." });
  return res.status(204).end();
});

module.exports = router;
