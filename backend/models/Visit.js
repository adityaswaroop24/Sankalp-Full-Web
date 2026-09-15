const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    visited_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Visit", visitSchema);
