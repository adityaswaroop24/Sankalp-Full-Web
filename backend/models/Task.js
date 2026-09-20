const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    done: { type: Boolean, default: false }
}, {
    timestamps: { createdAt: "created_at", updatedAt: false }
});

module.exports = mongoose.model("Task", taskSchema);
