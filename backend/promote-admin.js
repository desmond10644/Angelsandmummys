const pool = require("./db");

async function promoteAdmin() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Usage: npm run admin:promote -- admin@example.com");
  }

  const result = await pool.query(
    "UPDATE users SET role = 'admin' WHERE email = $1 RETURNING email",
    [email]
  );
  if (!result.rowCount) {
    throw new Error("No account found. Register the account before promoting it.");
  }

  console.log(`Administrator access enabled for ${result.rows[0].email}.`);
}

promoteAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());