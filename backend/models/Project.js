const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project_name: { type: String, required: true },
    project_type: { type: String, required: true },
    budget: { type: Number, default: null },
    completion_date: { type: String, default: null },
    location: { type: String, required: true },
    description: { type: String, default: null },
    customer_name: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    preferred_contact: { type: String, default: null },
    status: { type: String, default: "Planning" },
    progress: { type: Number, default: 0 }
}, {
    timestamps: { createdAt: "created_at", updatedAt: false }
});

module.exports = mongoose.model("Project", projectSchema);
