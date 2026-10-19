const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config();

const ensureDatabaseExists = async () => {
  const dbName = process.env.DB_NAME || "backend-04";
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: "postgres",
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    if (res.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    }
  } catch (err) {
    console.error("Error ensuring database exists:", err);
    throw err;
  } finally {
    await client.end();
  }
};

const runMigration = async () => {
  try {
    await ensureDatabaseExists();

    const pool = require("../models/db");
    const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    await pool.query(schema);
    console.log("Migration completed successfully. 'users' table is ready.");
    await pool.end();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  }
};

runMigration();