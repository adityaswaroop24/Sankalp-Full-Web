const express = require("express");
const router = express.Router();

const { signup, login, getAllUsers } = require("../controllers/authController");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/signup", signup);
router.post("/login", login);
router.get("/users", requireAdmin, getAllUsers);

module.exports = router;
