const DailyReport = require("../models/DailyReport");
const User = require("../models/User");
const Project = require("../models/Project");

const toPublicReport = (report) => {
    const project = report.projectId && report.projectId.project_name ? report.projectId : null;

    return {
        id: report._id.toString(),
        professionalName: report.professionalName,
        projectId: project ? project._id.toString() : null,
        projectName: project ? project.project_name : "Project deleted",
        customerEmail: project ? (project.email || "-") : "-",
        location: project ? project.location : null,
        reportDate: report.reportDate,
        workSummary: report.workSummary,
        amountSpent: report.amountSpent,
        daysElapsed: report.daysElapsed,
        created_at: report.created_at
    };
};

const createReport = async (req, res) => {
    try {
        const { projectId, reportDate, workSummary, amountSpent, daysElapsed } = req.body;

        if (!projectId || !reportDate || !workSummary) {
            return res.status(400).json({
                success: false,
                message: "Project, date and work summary are required."
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Selected project could not be found."
            });
        }

        const professional = await User.findById(req.user.id);

        const report = await DailyReport.create({
            professionalId: req.user.id,
            professionalName: professional ? professional.name : req.user.email,
            projectId,
            reportDate: new Date(reportDate),
            workSummary,
            amountSpent: Number(amountSpent) || 0,
            daysElapsed: daysElapsed ? Number(daysElapsed) : null
        });

        await report.populate("projectId");

        res.status(201).json({
            success: true,
            message: "Report submitted successfully.",
            report: toPublicReport(report)
        });

    } catch (error) {
        console.error("Create report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to submit report."
        });
    }
};

const getMyReports = async (req, res) => {
    try {
        const reports = await DailyReport
            .find({ professionalId: req.user.id })
            .populate("projectId")
            .sort({ reportDate: -1 });

        res.json({
            success: true,
            reports: reports.map(toPublicReport)
        });

    } catch (error) {
        console.error("Get my reports error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch reports."
        });
    }
};

const getReportsForCustomer = async (req, res) => {
    try {
        const myProjects = await Project.find({ customerId: req.user.id }, "_id");
        const myProjectIds = myProjects.map(p => p._id);

        const reports = await DailyReport
            .find({ projectId: { $in: myProjectIds } })
            .populate("projectId")
            .sort({ reportDate: -1 });

        res.json({
            success: true,
            reports: reports.map(toPublicReport)
        });

    } catch (error) {
        console.error("Get customer reports error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch reports."
        });
    }
};

const getAllReports = async (req, res) => {
    try {
        const reports = await DailyReport
            .find()
            .populate("projectId")
            .sort({ reportDate: -1 });

        res.json({
            success: true,
            reports: reports.map(toPublicReport)
        });

    } catch (error) {
        console.error("Get all reports error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch reports."
        });
    }
};

const updateReport = async (req, res) => {
    try {
        const report = await DailyReport.findOne({ _id: req.params.id, professionalId: req.user.id });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            });
        }

        const { projectId, reportDate, workSummary, amountSpent, daysElapsed } = req.body;

        if (!projectId || !reportDate || !workSummary) {
            return res.status(400).json({
                success: false,
                message: "Project, date and work summary are required."
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Selected project could not be found."
            });
        }

        report.projectId = projectId;
        report.reportDate = new Date(reportDate);
        report.workSummary = workSummary;
        report.amountSpent = Number(amountSpent) || 0;
        report.daysElapsed = daysElapsed ? Number(daysElapsed) : null;

        await report.save();
        await report.populate("projectId");

        res.json({
            success: true,
            message: "Report updated successfully!",
            report: toPublicReport(report)
        });

    } catch (error) {
        console.error("Update report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update report."
        });
    }
};

const deleteReport = async (req, res) => {
    try {
        const report = await DailyReport.findOneAndDelete({ _id: req.params.id, professionalId: req.user.id });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            });
        }

        res.json({
            success: true,
            message: "Report deleted successfully."
        });

    } catch (error) {
        console.error("Delete report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete report."
        });
    }
};

module.exports = {
    createReport,
    getMyReports,
    getReportsForCustomer,
    getAllReports,
    updateReport,
    deleteReport
};
