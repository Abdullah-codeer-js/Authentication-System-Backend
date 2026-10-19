const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const adminRoutes = require("../routes/adminRoutes");
const authRoutes = require("../routes/authRoutes");
const pool = require("../models/db");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Backend API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

const server = app.listen(3005, async () => {
  console.log("Test server started on port 3005");
  try {
    const baseUrl = "http://127.0.0.1:3005";

    const fetchJson = async (url, options = {}) => {
      const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
      const res = await fetch(url, {
        ...options,
        headers,
      });
      const data = await res.json();
      return { status: res.status, data };
    };

    console.log("1. Testing GET /...");
    const root = await fetchJson(`${baseUrl}/`);
    console.log("Root Response:", root);

    console.log("2. Testing User Registration...");
    const regRes = await fetchJson(`${baseUrl}/api/auth/register`, {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "testuser@example.com",
        password: "TestPassword123!",
      }),
    });
    console.log("Register Response:", regRes);

    console.log("3. Testing User Login...");
    const loginRes = await fetchJson(`${baseUrl}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        email: "testuser@example.com",
        password: "TestPassword123!",
      }),
    });
    console.log("Login Response:", loginRes);
    const userToken = loginRes.data.token;

    console.log("4. Testing User Profile...");
    const profileRes = await fetchJson(`${baseUrl}/api/auth/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log("Profile Response:", profileRes);

    console.log("5. Testing User role cannot access admin endpoints...");
    const accessRes = await fetchJson(`${baseUrl}/api/admin/users`, {
      method: "GET",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log("User admin access response:", accessRes);
    if (accessRes.status !== 403) {
      throw new Error(`Expected user role to receive 403, received ${accessRes.status}`);
    }

    console.log("\n>>> AUTHENTICATION AND ROLE CHECKS PASSED <<<");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
    server.close();
  }
});
