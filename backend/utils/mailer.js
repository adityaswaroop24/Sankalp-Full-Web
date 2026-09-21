// Sends mail through Brevo's HTTPS API. Render's free tier blocks outbound SMTP
// ports, so a normal Gmail/SMTP transport can't connect from there.

const sendResetEmail = async (toEmail, resetLink) => {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            sender: { name: "Sankalp", email: process.env.EMAIL_USER },
            to: [{ email: toEmail }],
            subject: "Reset your Sankalp password",
            htmlContent: `
                <p>You requested a password reset for your Sankalp account.</p>
                <p><a href="${resetLink}">Click here to reset your password</a></p>
                <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
            `
        }),
        signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Brevo responded ${response.status}: ${detail}`);
    }
};

module.exports = { sendResetEmail };
