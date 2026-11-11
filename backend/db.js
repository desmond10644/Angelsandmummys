const path = require("node:path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in backend/.env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

module.exports = pool;
