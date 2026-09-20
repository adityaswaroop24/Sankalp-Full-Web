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

const updateReport = async (req, res) => {
    try {
        const report = await DailyReport.findOne({ _id: req.params.id, professionalId: req.user.id });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            });
        }

        const { customerEmail, projectName, reportDate, workSummary, amountSpent, daysElapsed } = req.body;

        if (!customerEmail || !projectName || !reportDate || !workSummary) {
            return res.status(400).json({
                success: false,
                message: "Customer email, project name, date and work summary are required."
            });
        }

        report.customerEmail = customerEmail;
        report.projectName = projectName;
        report.reportDate = new Date(reportDate);
        report.workSummary = workSummary;
        report.amountSpent = Number(amountSpent) || 0;
        report.daysElapsed = daysElapsed ? Number(daysElapsed) : null;

        await report.save();

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
