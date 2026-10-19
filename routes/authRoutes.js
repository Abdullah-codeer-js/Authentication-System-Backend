const express =require("express");
const { register,login,getProfile} =require("../controlers/authController");
const authenticateToken =require("../middleware/authMiddleware");
const authRateLimiter = require("../middleware/rateLimiter");

const router =express.Router();

router.post("/register",authRateLimiter,register);
router.post("/login",authRateLimiter,login);
router.get("/profile",authenticateToken,getProfile);

module.exports =router;

