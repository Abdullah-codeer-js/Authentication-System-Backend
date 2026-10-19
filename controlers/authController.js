const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const pool = require("../models/db");

const {
    sanitizeString,
    sanitizeEmail
} = require("../utils/sanitize");

const register = async (req, res) => {
    try {
        let { name, email, password } = req.body || {};
        const role = "User";
        if (email === undefined || email === null) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        if (typeof email !== "string") {
            return res.status(400).json({
                success: false,
                message: "Email must be a valid string"
            });
        }
        email = sanitizeEmail(email);
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email cannot be empty"
            });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }
        if (!name || !password) {
            return res.status(400).json({
                success: false,
                message: "Name and password are required"
            });
        }
        if (typeof name !== "string" || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Name and password must be valid strings"
            });
        }
        name = sanitizeString(name);

        const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({
                success: false,
                message: "Name must contain only letters and spaces"
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, role)
            VALUES($1, $2, $3, $4)
            RETURNING id, name, email, role, created_at`,
            [name, email, hashedPassword, role]
        );
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(400).json({
            success: false,
            message: "User already exist"
        });
    }
};

const login = async (req, res) => {
    try {
        let { email, password } = req.body || {};
        if (email === undefined || email === null) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        if (typeof email !== "string") {
            return res.status(400).json({
                success: false,
                message: "Email must be a valid string"
            });
        }
        email = sanitizeEmail(email);
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email cannot be empty"
            });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address or credentials"
            });
        }
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }
        if (typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Password must be a valid string"
            });
        }
        const result = await pool.query(
            `SELECT id, name, email, password, role, created_at
            FROM users
            WHERE email = $1`,
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email address or credentials"
            });
        }
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(
            password, user.password
        );
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email address or credentials"
            });
        }
        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        const result = await pool.query(
            `SELECT id, name, email, role, created_at
            FROM users
            WHERE id = $1`,
            [userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User profile not found"
            });
        }
        return res.status(200).json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    register,
    login,
    getProfile
};
