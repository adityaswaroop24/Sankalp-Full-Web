const DailyReport = require("../models/DailyReport");
const User = require("../models/User");

const toPublicReport = (report) => ({
    id: report._id.toString(),
    professionalName: report.professionalName,
    customerEmail: report.customerEmail,
    projectName: report.projectName,
    reportDate: report.reportDate,
    workSummary: report.workSummary,
    amountSpent: report.amountSpent,
    daysElapsed: report.daysElapsed,
    created_at: report.created_at
});

const createReport = async (req, res) => {
    try {
        const { customerEmail, projectName, reportDate, workSummary, amountSpent, daysElapsed } = req.body;

        if (!customerEmail || !projectName || !reportDate || !workSummary) {
            return res.status(400).json({
                success: false,
                message: "Customer email, project name, date and work summary are required."
            });
        }

        const professional = await User.findById(req.user.id);

        const report = await DailyReport.create({
            professionalId: req.user.id,
            professionalName: professional ? professional.name : req.user.email,
            customerEmail,
            projectName,
            reportDate: new Date(reportDate),
            workSummary,
            amountSpent: Number(amountSpent) || 0,
            daysElapsed: daysElapsed ? Number(daysElapsed) : null
        });

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
        const reports = await DailyReport
            .find({ customerEmail: req.user.email.toLowerCase() })
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

module.exports = {
    createReport,
    getMyReports,
    getReportsForCustomer,
    getAllReports
};
