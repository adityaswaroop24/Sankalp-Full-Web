const mongoose = require("mongoose");

const dailyReportSchema = new mongoose.Schema({
    professionalId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    professionalName: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    reportDate: { type: Date, required: true },
    workSummary: { type: String, required: true },
    amountSpent: { type: Number, required: true, default: 0 },
    daysElapsed: { type: Number, default: null }
}, {
    timestamps: { createdAt: "created_at", updatedAt: false }
});

module.exports = mongoose.model("DailyReport", dailyReportSchema);
