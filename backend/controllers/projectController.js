const Project = require("../models/Project");

const toPublicProject = (project) => ({
    id: project._id.toString(),
    project_name: project.project_name,
    project_type: project.project_type,
    budget: project.budget,
    completion_date: project.completion_date,
    location: project.location,
    description: project.description,
    customer_name: project.customer_name,
    email: project.email,
    phone: project.phone,
    preferred_contact: project.preferred_contact,
    status: project.status,
    progress: project.progress,
    created_at: project.created_at
});

const createProject = async (req, res) => {
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

        const project = await Project.create({
            customerId: req.user.id,
            project_name: projectName,
            project_type: projectType,
            budget: budget ? Number(budget) : null,
            completion_date: completion || null,
            location,
            description: description || null,
            customer_name: customerName || null,
            email: email || null,
            phone: phone || null,
            preferred_contact: contact || null
        });

        res.status(201).json({
            success: true,
            message: "Project created successfully!",
            project: toPublicProject(project)
        });

    } catch (error) {
        console.error("Create project error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create project."
        });
    }
};

const getMyProjects = async (req, res) => {
    try {
        const projects = await Project
            .find({ customerId: req.user.id })
            .sort({ created_at: -1 });

        res.json({
            success: true,
            projects: projects.map(toPublicProject)
        });

    } catch (error) {
        console.error("Get my projects error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch projects."
        });
    }
};

const getAllProjects = async (req, res) => {
    try {
        const projects = await Project
            .find()
            .sort({ created_at: -1 });

        res.json({
            success: true,
            projects: projects.map(toPublicProject)
        });

    } catch (error) {
        console.error("Get all projects error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch projects."
        });
    }
};

const updateProject = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, customerId: req.user.id });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        const { projectName, projectType, budget, completion, location, description } = req.body;

        if (!projectName || !projectType || !location) {
            return res.status(400).json({
                success: false,
                message: "Project name, project type and location are required."
            });
        }

        project.project_name = projectName;
        project.project_type = projectType;
        project.budget = budget ? Number(budget) : null;
        project.completion_date = completion || null;
        project.location = location;
        project.description = description || null;

        await project.save();

        res.json({
            success: true,
            message: "Project updated successfully!",
            project: toPublicProject(project)
        });

    } catch (error) {
        console.error("Update project error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update project."
        });
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, customerId: req.user.id });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        res.json({
            success: true,
            message: "Project deleted successfully."
        });

    } catch (error) {
        console.error("Delete project error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete project."
        });
    }
};

module.exports = {
    createProject,
    getMyProjects,
    getAllProjects,
    updateProject,
    deleteProject
};
