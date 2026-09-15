const express = require("express");
const router = express.Router();

const { getProjectSuggestions } = require("../controllers/aiController");

router.post("/project-suggestions", getProjectSuggestions);

module.exports = router;
