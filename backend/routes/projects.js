const express = require("express");
const router = express.Router();

const { createProject, getMyProjects, getAllProjects, updateProject, deleteProject } = require("../controllers/projectController");
const { requireAuth, requireRole } = require("../middleware/requireAuth");

router.post("/", requireAuth, requireRole("Customer"), createProject);
router.get("/mine", requireAuth, requireRole("Customer"), getMyProjects);
router.get("/all", requireAuth, requireRole("Admin", "Professional"), getAllProjects);
router.put("/:id", requireAuth, requireRole("Customer"), updateProject);
router.delete("/:id", requireAuth, requireRole("Customer"), deleteProject);

module.exports = router;
