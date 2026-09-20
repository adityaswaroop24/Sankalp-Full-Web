const express = require("express");
const router = express.Router();

const { signup, login, getAllUsers, getContractors, forgotPassword, resetPassword } = require("../controllers/authController");
const requireAdmin = require("../middleware/requireAdmin");
const { requireAuth } = require("../middleware/requireAuth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/users", requireAdmin, getAllUsers);
router.get("/contractors", requireAuth, getContractors);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
