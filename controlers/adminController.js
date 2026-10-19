// const bcrypt = require("bcrypt");
// const validator = require("validator");

// const pool = require("../models/db");

// const { sanitizeString, sanitizeEmail } = require("../utils/sanitize");

// const createUser = async (req, res) => {
//   try {
//     let { name, email, password } = req.body || {};
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, email and password are required",
//       });
//     }
//     name = sanitizeString(name);
//     email = sanitizeEmail(email);

//     const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

//     if (!nameRegex.test(name)) {
//       return res.status(400).json({
//         success: false,
//         message: "Name must contain only letters and spaces",
//       });
//     }
//     if (!validator.isEmail(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format",
//       });
//     }
//     if (typeof password !== "string" || password.length < 8) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 8 characters long",
//       });
//     }
//     const existingUser = await pool.query(
//       "SELECT id FROM users WHERE email = $1",
//       [email],
//     );
//     if (existingUser.rows.length > 0) {
//       return res.status(409).json({
//         success: false,
//         message: "Email is already registered",
//       });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const result = await pool.query(
//       `INSERT INTO users (name, email, password, role)
//             VALUES ($1, $2, $3, $4)
//             RETURNING id, name, email, role, created_at`,
//       [name, email, hashedPassword, "User"],
//     );
//     return res.status(201).json({
//       success: true,
//       message: "User created successfully",
//       user: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Create user error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// const createAdmin = async (req, res) => {
//   try {
//     let { name, email, password } = req.body || {};
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, email & password are required",
//       });
//     }
//     name = sanitizeString(name);
//     email = sanitizeEmail(email);

//     const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
//     if (!nameRegex.test(name)) {
//       return res.status(400).json({
//         success: false,
//         message: "Name must contain only letters and spaces",
//       });
//     }
//     if (!validator.isEmail(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format",
//       });
//     }

//     if (typeof password !== "string" || password.length < 8) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 8 characters long",
//       });
//     }

//     const existingUser = await pool.query(
//       "SELECT id FROM users WHERE email = $1",
//       [email],
//     );
//     if (existingUser.rows.length > 0) {
//       return res.status(409).json({
//         success: false,
//         message: "Email is already registered",
//       });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const result = await pool.query(
//       `INSERT INTO users (name, email, password, role)
//         VALUES($1, $2, $3, $4)
//         RETURNING id, name, email, role, created_at`,
//       [name, email, hashedPassword, "Admin"],
//     );
//     return res.status(201).json({
//       success: true,
//       message: "Admin created successfully",
//       user: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Create Admin error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// const listUsers = async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT id, name, email, role, created_at
//             FROM users
//             ORDER BY created_at DESC`,
//     );
//     return res.status(200).json({
//       success: true,
//       count: result.rows.length,
//       users: result.rows,
//     });
//   } catch (error) {
//     console.error("List users error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// const updateUserRole = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { role } = req.body || {};
//     const allowedRoles = ["User", "Admin"];

//     if (!role || !allowedRoles.includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: `Role must be one of: ${allowedRoles.join(", ")}`,
//       });
//     }
//     if (!/^\d+$/.test(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user id",
//       });
//     }
//     if (req.user.id === Number(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot change your own role",
//       });
//     }
//     const result = await pool.query(
//       `UPDATE users
//             SET role = $1
//             WHERE id = $2
//             RETURNING id, name, email, role, created_at`,
//       [role, id],
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       message: "User role updated successfully",
//       user: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Update user role error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!/^\d+$/.test(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user id",
//       });
//     }
//     if (req.user.id === Number(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot delete your own account",
//       });
//     }
//     const result = await pool.query(
//       "DELETE FROM users WHERE id = $1 RETURNING id, name, email, role",
//       [id],
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       message: "User deleted successfully",
//       user: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Delete user error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// module.exports = {
//   createAdmin,
//   createUser,
//   listUsers,
//   updateUserRole,
//   deleteUser,
// };

const bcrypt = require("bcrypt");
const validator = require("validator");
const pool = require("../models/db");
const { sanitizeEmail } = require("../utils/sanitize");

const validateEmail = (email) => {
    if (email === undefined || email === null) {
        return { error: "Email is required" };
    }
    if (typeof email !== "string") {
        return { error: "Email must be a valid string" };
    }

    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
        return { error: "Email cannot be empty" };
    }
    if (!validator.isEmail(sanitizedEmail)) {
        return { error: "Invalid email address" };
    }

    return { email: sanitizedEmail };
};

// Create User
const createUser = async (req, res) => {
    try {
        const { name, password } = req.body || {};
        const emailValidation = validateEmail(req.body && req.body.email);
        if (emailValidation.error) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }
        const email = emailValidation.email;

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role, created_at`,
            [name, email, hashedPassword, "User"]
        );

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Create user error:", error);

        return res.status(400).json({
            success: false,
            message:"User already exist" 
        });
    }
};


// Create Admin
const createAdmin = async (req, res) => {
    try {
        const { name, password } = req.body || {};
        const emailValidation = validateEmail(req.body && req.body.email);
        if (emailValidation.error) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }
        const email = emailValidation.email;

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role, created_at`,
            [name, email, hashedPassword, "Admin"]
        );

        return res.status(201).json({
            success: true,
            message: "Admin created successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Create admin error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Get All Users
const listUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, created_at
             FROM users
             ORDER BY created_at DESC`
        );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            users: result.rows
        });

    } catch (error) {
        console.error("List users error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Update User Role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const allowedRoles = ["User", "Admin"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be User or Admin"
            });
        }

        const result = await pool.query(
            `UPDATE users
             SET role = $1
             WHERE id = $2
             RETURNING id, name, email, role, created_at`,
            [role, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Update user role error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Delete User
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM users
             WHERE id = $1
             RETURNING id, name, email, role`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Delete user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    createUser,
    createAdmin,
    listUsers,
    updateUserRole,
    deleteUser
};