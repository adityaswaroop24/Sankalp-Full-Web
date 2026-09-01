const express = require("express");
const router = express.Router();

const { recordVisit, getVisitCount } = require("../controllers/visitController");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/", recordVisit);
router.get("/", requireAdmin, getVisitCount);

module.exports = router;
