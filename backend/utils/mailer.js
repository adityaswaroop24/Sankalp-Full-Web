const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const sendResetEmail = async (toEmail, resetLink) => {
    await transporter.sendMail({
        from: `"Sankalp" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Reset your Sankalp password",
        html: `
            <p>You requested a password reset for your Sankalp account.</p>
            <p><a href="${resetLink}">Click here to reset your password</a></p>
            <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        `
    });
};

module.exports = { sendResetEmail };
