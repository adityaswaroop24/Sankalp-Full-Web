const express = require("express");
const router = express.Router();

const {
    createReport,
    getMyReports,
    getReportsForCustomer,
    getAllReports
} = require("../controllers/reportController");

const { requireAuth, requireRole } = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/", requireAuth, requireRole("Professional"), createReport);
router.get("/mine", requireAuth, requireRole("Professional"), getMyReports);
router.get("/customer", requireAuth, requireRole("Customer"), getReportsForCustomer);
router.get("/all", requireAdmin, getAllReports);

module.exports = router;
