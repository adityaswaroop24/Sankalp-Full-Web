const Visit = require("../models/Visit");

const recordVisit = async (req, res) => {
    try {
        await Visit.create({});

        const total = await Visit.countDocuments();

        res.status(201).json({
            success: true,
            total
        });

    } catch (error) {
        console.error("Record visit error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to record visit."
        });
    }
};

const getVisitCount = async (req, res) => {
    try {
        const total = await Visit.countDocuments();

        res.json({
            success: true,
            total
        });

    } catch (error) {
        console.error("Get visit count error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch visit count."
        });
    }
};

module.exports = {
    recordVisit,
    getVisitCount
};
