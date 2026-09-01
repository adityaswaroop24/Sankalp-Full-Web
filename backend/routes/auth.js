const express = require("express");
const router = express.Router();

const { signup, login, getAllUsers, forgotPassword, resetPassword } = require("../controllers/authController");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/signup", signup);
router.post("/login", login);
router.get("/users", requireAdmin, getAllUsers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
