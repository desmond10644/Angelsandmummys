const fs = require("node:fs/promises");
const path = require("node:path");
const pool = require("./db");

async function migrate() {
  const migrationDirectory = path.join(__dirname, "migrations");
  const migrationFiles = (await fs.readdir(migrationDirectory))
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort();

  for (const migrationFile of migrationFiles) {
    const sql = await fs.readFile(path.join(migrationDirectory, migrationFile), "utf8");
    await pool.query(sql);
    console.log(`Applied ${migrationFile}.`);
  }

  console.log("Database migrations completed.");
}

migrate()
  .catch((error) => {
    console.error("Database migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
