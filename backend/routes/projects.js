const express = require("express");
const router = express.Router();

const { createProject, getMyProjects, getAllProjects } = require("../controllers/projectController");
const { requireAuth, requireRole } = require("../middleware/requireAuth");

router.post("/", requireAuth, requireRole("Customer"), createProject);
router.get("/mine", requireAuth, requireRole("Customer"), getMyProjects);
router.get("/all", requireAuth, requireRole("Admin", "Professional"), getAllProjects);

module.exports = router;
