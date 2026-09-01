const db = require("../db/sqlite");

const recordVisit = (req, res) => {
    try {
        db.prepare("INSERT INTO visits DEFAULT VALUES").run();

        const { total } = db
            .prepare("SELECT COUNT(*) AS total FROM visits")
            .get();

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

const getVisitCount = (req, res) => {
    try {
        const { total } = db
            .prepare("SELECT COUNT(*) AS total FROM visits")
            .get();

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
