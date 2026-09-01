const express = require("express");
const pool = require("../db/database");

const router = express.Router();

// GET all projects
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM projects ORDER BY created_at DESC"
        );

        res.json({
            success: true,
            projects: result.rows
        });

    } catch (error) {
        console.error("Get projects error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch projects",
            error: error.message
        });
    }
});

// POST new project
router.post("/", async (req, res) => {
    try {
        const {
            projectName,
            projectType,
            budget,
            completion,
            location,
            description,
            customerName,
            email,
            phone,
            contact
        } = req.body;

        if (!projectName || !projectType || !location) {
            return res.status(400).json({
                success: false,
                message: "Project name, project type and location are required."
            });
        }

        const result = await pool.query(
            `
            INSERT INTO projects (
                project_name,
                project_type,
                budget,
                completion_date,
                location,
                description,
                customer_name,
                email,
                phone,
                preferred_contact
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *
            `,
            [
                projectName,
                projectType,
                budget || null,
                completion || null,
                location,
                description || null,
                customerName || null,
                email || null,
                phone || null,
                contact || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Project created successfully!",
            project: result.rows[0]
        });

    } catch (error) {
        console.error("Create project error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create project",
            error: error.message
        });
    }
});

module.exports = router;