const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const DailyReport = require("../models/DailyReport");
const { sendResetEmail } = require("../utils/mailer");

const toPublicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at
});

const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        const allowedRoles = ["Customer", "Professional"];

        if (role && !allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                message: "Admin accounts cannot be created through public signup."
            });
        }

        const existing = await User.findOne({ email });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "Customer"
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully!",
            user: toPublicUser(user)
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create account.",
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (role && role !== user.role) {
            return res.status(403).json({
                success: false,
                message: `This account is registered as ${user.role}, not ${role}. Select "${user.role}" above and try again.`
            });
        }

        const token = jwt.sign(
            { id: user._id.toString(), email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed.",
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ created_at: -1 });

        res.json({
            success: true,
            users: users.map(toPublicUser)
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users."
        });
    }
};

const getContractors = async (req, res) => {
    try {
        const professionals = await User.find({ role: "Professional" }).sort({ created_at: -1 });

        const contractors = await Promise.all(professionals.map(async (pro) => {
            const reportsFiled = await DailyReport.countDocuments({ professionalId: pro._id });

            return {
                id: pro._id.toString(),
                name: pro.name,
                email: pro.email,
                reportsFiled,
                memberSince: pro.created_at
            };
        }));

        res.json({
            success: true,
            contractors
        });

    } catch (error) {
        console.error("Get contractors error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch contractors."
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const genericResponse = {
            success: true,
            message: "If an account exists for that email, a reset link has been sent."
        };

        const user = await User.findOne({ email });

        if (!user) {
            return res.json(genericResponse);
        }

        const token = crypto.randomBytes(32).toString("hex");

        user.resetToken = token;
        user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5500";
        const resetLink = `${frontendUrl}/reset-password.html?token=${token}`;

        try {
            await sendResetEmail(user.email, resetLink);
        } catch (emailError) {
            console.error("Failed to send reset email:", emailError);
        }

        res.json(genericResponse);

    } catch (error) {
        console.error("Forgot password error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to process request."
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Token and new password are required."
            });
        }

        const user = await User.findOne({ resetToken: token });

        if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "This reset link is invalid or has expired. Please request a new one."
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.json({
            success: true,
            message: "Password reset successfully. You can now log in."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to reset password."
        });
    }
};

module.exports = {
    signup,
    login,
    getAllUsers,
    getContractors,
    forgotPassword,
    resetPassword
};
