const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db/database");
const projectRoutes = require("./routes/projects");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);

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

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Sankalp database connected!",
            time: result.rows[0].now
        });

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Sankalp backend running on port ${PORT}`);
});