const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,

    // Stop waiting forever if PostgreSQL cannot be reached
    connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
    console.log("PostgreSQL connected successfully");
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error);
});

// Test database connection when server starts
pool.query("SELECT NOW()")
    .then((result) => {
        console.log("PostgreSQL test successful:", result.rows[0]);
    })
    .catch((error) => {
        console.error("PostgreSQL connection test failed:");
        console.error(error.message);
    });

module.exports = pool;