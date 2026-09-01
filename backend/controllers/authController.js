const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const db = require("../db/sqlite");
const { sendResetEmail } = require("../utils/mailer");

const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        const existing = db
            .prepare("SELECT id FROM users WHERE email = ?")
            .get(email);

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = db
            .prepare(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
            )
            .run(name, email, hashedPassword, role || "Customer");

        const user = db
            .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
            .get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: "Account created successfully!",
            user
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

        const user = db
            .prepare("SELECT * FROM users WHERE email = ?")
            .get(email);

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
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user.id,
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

const getAllUsers = (req, res) => {
    try {
        const users = db
            .prepare(
                "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
            )
            .all();

        res.json({
            success: true,
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users."
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

        const user = db
            .prepare("SELECT id, email FROM users WHERE email = ?")
            .get(email);

        if (!user) {
            return res.json(genericResponse);
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        db.prepare(
            "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?"
        ).run(token, expiresAt, user.id);

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

        const user = db
            .prepare("SELECT id, reset_token_expires FROM users WHERE reset_token = ?")
            .get(token);

        if (!user || new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "This reset link is invalid or has expired. Please request a new one."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.prepare(
            "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?"
        ).run(hashedPassword, user.id);

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
    forgotPassword,
    resetPassword
};
