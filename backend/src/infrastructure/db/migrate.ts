import fs from "node:fs";
import path from "node:path";
import { pool } from "./pool";

async function run() {
  const sqlPath = path.join(__dirname, "migrations", "001_init.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  await pool.query(sql);
  console.log("Migration 001_init.sql applied");
  await pool.end();
}

run().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
