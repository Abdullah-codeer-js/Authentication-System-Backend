const express = require('express');
const {
    createUser, createAdmin, listUsers, updateUserRole, deleteUser
} = require("../controlers/adminController");
//const authorizeAdmin = require("../middleware/adminMiddleware");
//const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// router.post("/users", authenticateToken, authorizeAdmin, createUser);
// router.post("/admins", authenticateToken, authorizeAdmin, createAdmin);
// router.get("/users", authenticateToken, authorizeAdmin, listUsers);
// router.patch("/users/:id/role", authenticateToken, authorizeAdmin, updateUserRole);
// router.delete("/users/:id", authenticateToken, authorizeAdmin, deleteUser);


router.post("/users",  createUser);
router.post("/admins",  createAdmin);
router.get("/users",  listUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id",  deleteUser);

module.exports = router;