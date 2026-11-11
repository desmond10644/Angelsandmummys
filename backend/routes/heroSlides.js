const { randomUUID } = require("node:crypto");
const { Buffer } = require("node:buffer");
const { mkdirSync } = require("node:fs");
const { open, unlink } = require("node:fs/promises");
const path = require("node:path");
const express = require("express");
const multer = require("multer");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const uploadDirectory = path.resolve(
  process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads")
);

const maxImageSize = 8 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", { extension: ".jpg", signature: [0xff, 0xd8, 0xff] }],
  ["image/png", { extension: ".png", signature: [0x89, 0x50, 0x4e, 0x47] }],
  ["image/webp", { extension: ".webp", signature: [0x52, 0x49, 0x46, 0x46] }],
]);

function mapSlide(row) {
  return {
    id: row.id,
    imageUrl: row.image_url,
    eyebrow: row.eyebrow,
    heading: row.heading,
    description: row.description,
    primaryButtonText: row.primary_button_text,
    primaryButtonUrl: row.primary_button_url,
    secondaryButtonText: row.secondary_button_text,
    secondaryButtonUrl: row.secondary_button_url,
    isActive: row.is_active,
    position: row.position,
  };
}

function slideFields(body) {
  const fields = {
    eyebrow: String(body.eyebrow || "").trim(),
    heading: String(body.heading || "").trim(),
    description: String(body.description || "").trim(),
    primaryButtonText: String(body.primaryButtonText || "").trim(),
    primaryButtonUrl: String(body.primaryButtonUrl || "").trim(),
    secondaryButtonText: String(body.secondaryButtonText || "").trim(),
    secondaryButtonUrl: String(body.secondaryButtonUrl || "").trim(),
  };

  if (!fields.heading) {
    throw Object.assign(new Error("A slide heading is required."), {
      status: 400,
    });
  }
  if (fields.heading.length > 160 || fields.description.length > 600) {
    throw Object.assign(
      new Error("The heading or description is too long."),
      { status: 400 }
    );
  }

  for (const [label, url] of [
    ["Primary", fields.primaryButtonUrl],
    ["Secondary", fields.secondaryButtonUrl],
  ]) {
    if (url && (!url.startsWith("/") || url.startsWith("//"))) {
      throw Object.assign(
        new Error(`${label} button URL must be a site-relative path.`),
        { status: 400 }
      );
    }
  }

  return fields;
}

function readIsActive(value, fallback = true) {
  if (value === undefined) return fallback;
  return value === "true" || value === true;
}

async function removeUploadedFile(uploadDirectory, imageUrl) {
  if (!imageUrl?.startsWith("/uploads/hero-slides/")) return;
  const fileName = path.basename(imageUrl);
  if (!fileName) return;
  await unlink(path.join(uploadDirectory, "hero-slides", fileName)).catch(
    (error) => {
      if (error.code !== "ENOENT") throw error;
    }
  );
}

async function validateImage(file) {
  const type = allowedTypes.get(file.mimetype);
  if (!type) {
    await unlink(file.path);
    throw Object.assign(
      new Error("Choose a JPG, PNG, or WebP image."),
      { status: 400 }
    );
  }

  const fileHandle = await open(file.path, "r");
  const header = Buffer.alloc(type.signature.length);
  try {
    await fileHandle.read(header, 0, header.length, 0);
  } finally {
    await fileHandle.close();
  }

  const isValid = type.signature.every((byte, index) => header[index] === byte);
  if (!isValid) {
    await unlink(file.path);
    throw Object.assign(
      new Error("The uploaded file does not match its image format."),
      { status: 400 }
    );
  }

  return file.filename;
}

const router = express.Router();
const imageDirectory = path.join(uploadDirectory, "hero-slides");
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

  router.get("/", async (_request, response) => {
    const result = await pool.query(
      `SELECT * FROM hero_slides
       WHERE is_active = TRUE
       ORDER BY position ASC, id ASC`
    );
    response.json(result.rows.map(mapSlide));
  });

router.use("/admin", requireAuth, requireAdmin);

router.get("/admin", async (_request, response) => {
    const result = await pool.query(
      "SELECT * FROM hero_slides ORDER BY position ASC, id ASC"
    );
    response.json(result.rows.map(mapSlide));
  });

router.put("/admin/order", async (request, response) => {
    const { ids } = request.body;
    if (
      !Array.isArray(ids) ||
      ids.some((id) => !Number.isInteger(Number(id)) || Number(id) < 1) ||
      new Set(ids.map(Number)).size !== ids.length
    ) {
      response.status(400).json({ message: "Provide a unique ordered list of slide IDs." });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const current = await client.query("SELECT id FROM hero_slides");
      const currentIds = new Set(current.rows.map((row) => Number(row.id)));
      if (
        ids.length !== currentIds.size ||
        ids.some((id) => !currentIds.has(Number(id)))
      ) {
        await client.query("ROLLBACK");
        response.status(400).json({ message: "The ordered slide list is out of date." });
        return;
      }

      await client.query(
        `UPDATE hero_slides AS slide
         SET position = ordered.position
         FROM unnest($1::bigint[]) WITH ORDINALITY AS ordered(id, position)
         WHERE slide.id = ordered.id`,
        [ids.map(Number)]
      );
      await client.query("COMMIT");
      response.status(204).end();
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });

router.post("/admin", upload.single("image"), async (request, response) => {
    if (!request.file) {
      throw Object.assign(new Error("Choose a slide image to upload."), {
        status: 400,
      });
    }

    let imageUrl;
    try {
      const imageName = await validateImage(request.file);
      imageUrl = `/uploads/hero-slides/${imageName}`;
      const fields = slideFields(request.body);
      const isActive = readIsActive(request.body.isActive);
      const result = await pool.query(
        `INSERT INTO hero_slides (
          image_url, eyebrow, heading, description,
          primary_button_text, primary_button_url,
          secondary_button_text, secondary_button_url,
          is_active, position
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          COALESCE((SELECT MAX(position) + 1 FROM hero_slides), 0)
        )
        RETURNING *`,
        [
          imageUrl,
          fields.eyebrow,
          fields.heading,
          fields.description,
          fields.primaryButtonText || "Shop Now",
          fields.primaryButtonUrl || "/shop",
          fields.secondaryButtonText || "Explore Categories",
          fields.secondaryButtonUrl || "/categories",
          isActive,
        ]
      );
      response.status(201).json(mapSlide(result.rows[0]));
    } catch (error) {
      await removeUploadedFile(uploadDirectory, imageUrl || `/uploads/hero-slides/${request.file.filename}`).catch(
        (cleanupError) => console.error("Unable to remove uploaded slide image:", cleanupError)
      );
      throw error;
    }
  });

router.put(
    "/admin/:id",
    upload.single("image"),
    async (request, response) => {
      const existing = await pool.query(
        "SELECT * FROM hero_slides WHERE id = $1",
        [request.params.id]
      );
      if (existing.rowCount === 0) {
        if (request.file) await unlink(request.file.path);
        response.status(404).json({ message: "Slide not found." });
        return;
      }

      const oldSlide = existing.rows[0];
      let newImageUrl;
      try {
        const fields = {
          eyebrow: request.body.eyebrow ?? oldSlide.eyebrow,
          heading: request.body.heading ?? oldSlide.heading,
          description: request.body.description ?? oldSlide.description,
          primaryButtonText:
            request.body.primaryButtonText ?? oldSlide.primary_button_text,
          primaryButtonUrl:
            request.body.primaryButtonUrl ?? oldSlide.primary_button_url,
          secondaryButtonText:
            request.body.secondaryButtonText ?? oldSlide.secondary_button_text,
          secondaryButtonUrl:
            request.body.secondaryButtonUrl ?? oldSlide.secondary_button_url,
        };
        const validatedFields = slideFields(fields);

        if (request.file) {
          const imageName = await validateImage(request.file);
          newImageUrl = `/uploads/hero-slides/${imageName}`;
        }

        const result = await pool.query(
          `UPDATE hero_slides SET
            image_url = $1, eyebrow = $2, heading = $3, description = $4,
            primary_button_text = $5, primary_button_url = $6,
            secondary_button_text = $7, secondary_button_url = $8,
            is_active = $9, updated_at = NOW()
           WHERE id = $10 RETURNING *`,
          [
            newImageUrl || oldSlide.image_url,
            validatedFields.eyebrow,
            validatedFields.heading,
            validatedFields.description,
            validatedFields.primaryButtonText,
            validatedFields.primaryButtonUrl,
            validatedFields.secondaryButtonText,
            validatedFields.secondaryButtonUrl,
            readIsActive(request.body.isActive, oldSlide.is_active),
            request.params.id,
          ]
        );

        if (newImageUrl) {
          await removeUploadedFile(uploadDirectory, oldSlide.image_url);
        }
        response.json(mapSlide(result.rows[0]));
      } catch (error) {
        if (request.file) {
          await unlink(request.file.path).catch((cleanupError) => {
            if (cleanupError.code !== "ENOENT") {
              console.error("Unable to remove replacement image:", cleanupError);
            }
          });
        }
        throw error;
      }
    }
  );

router.delete("/admin/:id", async (request, response) => {
    const result = await pool.query(
      "DELETE FROM hero_slides WHERE id = $1 RETURNING image_url",
      [request.params.id]
    );
    if (result.rowCount === 0) {
      response.status(404).json({ message: "Slide not found." });
      return;
    }
    await removeUploadedFile(uploadDirectory, result.rows[0].image_url);
    response.status(204).end();
  });

router.use((error, _request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }
    if (error instanceof multer.MulterError) {
      response.status(400).json({
        message:
          error.code === "LIMIT_FILE_SIZE"
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
