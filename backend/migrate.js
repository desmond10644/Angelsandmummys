const fs = require("node:fs/promises");
const path = require("node:path");
const pool = require("./db");

async function migrate() {
  const migrationPath = path.join(
    __dirname,
    "migrations",
    "001_initial_schema.sql"
  );
  const sql = await fs.readFile(migrationPath, "utf8");

  await pool.query(sql);
  console.log("Database migration completed.");
}

migrate()
  .catch((error) => {
    console.error("Database migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
