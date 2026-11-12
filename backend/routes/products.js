const { randomUUID } = require("node:crypto");
const { Buffer } = require("node:buffer");
const { mkdirSync } = require("node:fs");
const { open, unlink } = require("node:fs/promises");
const path = require("node:path");
const express = require("express");
const multer = require("multer");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
const uploadDirectory = path.resolve(
  process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads")
);
const imageDirectory = path.join(uploadDirectory, "products");
const maxImageSize = 8 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", { extension: ".jpg", signature: [0xff, 0xd8, 0xff] }],
  ["image/png", { extension: ".png", signature: [0x89, 0x50, 0x4e, 0x47] }],
  ["image/webp", { extension: ".webp", signature: [0x52, 0x49, 0x46, 0x46] }],
]);

mkdirSync(imageDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: imageDirectory,
    filename: (_request, file, callback) => {
      const type = allowedTypes.get(file.mimetype);
      callback(null, `${randomUUID()}${type?.extension || ""}`);
    },
  }),
  limits: { fileSize: maxImageSize, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      callback(new Error("Choose a JPG, PNG, or WebP image."));
      return;
    }
    callback(null, true);
  },
});

async function validateImage(file) {
  const type = allowedTypes.get(file.mimetype);
  const fileHandle = await open(file.path, "r");
  const header = Buffer.alloc(type.signature.length);
  try {
    await fileHandle.read(header, 0, header.length, 0);
  } finally {
    await fileHandle.close();
  }

  if (!type.signature.every((byte, index) => header[index] === byte)) {
    throw Object.assign(new Error("The uploaded file does not match its image format."), {
      status: 400,
    });
  }
  return file.filename;
}

async function removeUploadedFile(imageUrl) {
  if (!imageUrl?.startsWith("/uploads/products/")) return;
  const fileName = path.basename(imageUrl);
  if (!fileName) return;
  await unlink(path.join(imageDirectory, fileName)).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}

async function removeTemporaryUpload(file) {
  if (!file?.path) return;
  await unlink(file.path).catch((error) => {
    if (error.code !== "ENOENT") {
      console.error("Unable to remove uploaded product image:", error);
    }
  });
}

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
  if (body.category !== undefined && (typeof body.category !== "string" || !body.category.trim() || body.category.trim().length > 80)) return false;
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

router.get("/categories", async (_req, res) => {
  const result = await pool.query(
    `SELECT categories.name AS category, COUNT(products.id)::int AS product_count
     FROM product_categories AS categories
     LEFT JOIN products ON products.category = categories.name AND products.active = TRUE
     GROUP BY categories.name ORDER BY categories.name`
  );
  return res.json({ categories: result.rows });
});

router.post("/categories", requireAuth, requireAdmin, async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name || name.length > 80) {
    return res.status(400).json({ message: "Category names must be between 1 and 80 characters." });
  }

  const result = await pool.query(
    `INSERT INTO product_categories (name) VALUES ($1)
     ON CONFLICT (name) DO NOTHING
     RETURNING name`,
    [name]
  );
  if (!result.rowCount) return res.status(409).json({ message: "That category already exists." });
  return res.status(201).json({ category: result.rows[0].name, product_count: 0 });
});

router.patch("/categories/:category", requireAuth, requireAdmin, async (req, res) => {
  const oldCategory = req.params.category;
  const newCategory = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!newCategory || newCategory.length > 80) {
    return res.status(400).json({ message: "Category names must be between 1 and 80 characters." });
  }
  if (oldCategory === newCategory) {
    return res.status(400).json({ message: "Choose a different category name." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const category = await client.query(
      "SELECT name FROM product_categories WHERE name = $1 FOR UPDATE",
      [oldCategory]
    );
    if (!category.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Category not found." });
    }

    await client.query(
      "INSERT INTO product_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      [newCategory]
    );
    const result = await client.query(
      `UPDATE products SET category = $1, updated_at = NOW()
       WHERE category = $2 RETURNING id`,
      [newCategory, oldCategory]
    );
    await client.query("DELETE FROM product_categories WHERE name = $1", [oldCategory]);
    await client.query("COMMIT");
    return res.json({ category: newCategory, updatedProducts: result.rowCount });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

router.post("/", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Choose a product image to upload." });
  }

  try {
    const imageName = await validateImage(req.file);
    const productBody = { ...req.body, image: `/uploads/products/${imageName}` };
    if (!validProduct(productBody)) {
      await removeTemporaryUpload(req.file);
      return res.status(400).json({ message: "Product fields are missing or invalid." });
    }

    await pool.query(
      "INSERT INTO product_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      [productBody.category.trim()]
    );
    const fields = Object.keys(productFields);
    const values = fields.map((field) => productBody[field] ?? null);
    const result = await pool.query(
      `INSERT INTO products (${fields.join(", ")})
       VALUES (${fields.map((_, index) => `$${index + 1}`).join(", ")})
       RETURNING id, name, category, price, rating, reviews, badge, description, image, stock`,
      values
    );
    return res.status(201).json({ product: result.rows[0] });
  } catch (error) {
    await removeTemporaryUpload(req.file);
    throw error;
  }
});

router.patch("/:id", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
  let newImageUrl;
  let saved = false;
  try {
    const productBody = { ...req.body };
    if (req.file) {
      const imageName = await validateImage(req.file);
      newImageUrl = `/uploads/products/${imageName}`;
      productBody.image = newImageUrl;
    }
    if (!validProduct(productBody, true)) {
      if (newImageUrl) await removeUploadedFile(newImageUrl);
      return res.status(400).json({ message: "Product fields are invalid." });
    }
    if (productBody.category !== undefined) {
      await pool.query(
        "INSERT INTO product_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
        [productBody.category.trim()]
      );
    }
    const entries = Object.entries(productFields).filter(([field]) => productBody[field] !== undefined);
    if (!entries.length) {
      if (newImageUrl) await removeUploadedFile(newImageUrl);
      return res.status(400).json({ message: "Provide at least one product field to update." });
    }

    const values = entries.map(([field]) => productBody[field]);
    const assignments = entries.map(([field], index) => `${productFields[field]} = $${index + 1}`);
    const currentProduct = newImageUrl
      ? await pool.query("SELECT image FROM products WHERE id = $1 AND active = TRUE", [req.params.id])
      : null;
    if (newImageUrl && !currentProduct.rowCount) {
      await removeUploadedFile(newImageUrl);
      return res.status(404).json({ message: "Product not found." });
    }
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE products SET ${assignments.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length} AND active = TRUE
       RETURNING id, name, category, price, rating, reviews, badge, description, image, stock`,
      values
    );
    if (!result.rowCount) {
      if (newImageUrl) await removeUploadedFile(newImageUrl);
      return res.status(404).json({ message: "Product not found." });
    }
    saved = true;

    if (newImageUrl && currentProduct?.rows[0].image) {
      await removeUploadedFile(currentProduct.rows[0].image).catch((error) => {
        console.error("Unable to remove previous product image:", error);
      });
    }
    return res.json({ product: result.rows[0] });
  } catch (error) {
    if (req.file && !saved) {
      if (newImageUrl) await removeUploadedFile(newImageUrl);
      else await removeTemporaryUpload(req.file);
    }
    throw error;
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const result = await pool.query(
    "UPDATE products SET active = FALSE, updated_at = NOW() WHERE id = $1 AND active = TRUE RETURNING id, image",
    [req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ message: "Product not found." });
  await removeUploadedFile(result.rows[0].image).catch((error) => {
    console.error("Unable to remove deleted product image:", error);
  });
  return res.status(204).end();
});

router.use((error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  if (error instanceof multer.MulterError) {
    response.status(400).json({
      message: error.code === "LIMIT_FILE_SIZE"
        ? "Images must be 8 MB or smaller."
        : error.message,
    });
    return;
  }
  if (error.status || error.message === "Choose a JPG, PNG, or WebP image.") {
    response.status(error.status || 400).json({ message: error.message });
    return;
  }
  next(error);
});

module.exports = router;
