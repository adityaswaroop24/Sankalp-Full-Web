const verifyRecaptcha = async (token) => {
    if (!token) {
        return false;
    }

    const params = new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token
    });

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const data = await response.json();

    return data.success === true;
};

module.exports = { verifyRecaptcha };
