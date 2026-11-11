const path = require("node:path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { getJwtSecret } = require("./middleware/auth");
const uploadDirectory = path.resolve(
  process.env.UPLOAD_DIR || path.join(__dirname, "uploads")
);

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = new Set([
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean));

getJwtSecret();
app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
}));
app.use(express.json({ limit: "100kb" }));
app.use("/uploads", express.static(uploadDirectory, { maxAge: "1d" }));

app.get("/api/health", async (req, res) => {
  await pool.query("SELECT 1");
  return res.json({ status: "ok", database: "connected" });
});
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/account", require("./routes/account"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/hero-slides", require("./routes/heroSlides"));

app.use((req, res) => res.status(404).json({ message: "Endpoint not found." }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.code === "23505") {
    return res.status(409).json({ message: "An account with that email already exists." });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }
  if (error.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({ message: error.message });
  }
  console.error("API error:", error.message);
  return res.status(500).json({ message: "An unexpected server error occurred." });
});

const server = app.listen(port, () => {
  console.log(`Backend listening on port ${port}.`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
