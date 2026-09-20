const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectMongo = require("./db/mongo");
const projectRoutes = require("./routes/projects");
const authRoutes = require("./routes/auth");
const visitRoutes = require("./routes/visits");
const aiRoutes = require("./routes/ai");
const reportRoutes = require("./routes/reports");
const taskRoutes = require("./routes/tasks");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Sankalp backend is running!"
    });
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Sankalp API is working!"
    });
});

const PORT = process.env.PORT || 5000;

connectMongo().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Sankalp backend running on port ${PORT}`);
    });
});