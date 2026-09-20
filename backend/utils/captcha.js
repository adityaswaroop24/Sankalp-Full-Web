const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const svgCaptcha = require("svg-captcha");

const CAPTCHA_TTL_SECONDS = 5 * 60;

// One-time use: a solved captcha token can't be replayed within its lifetime.
// In-memory is fine for a single backend instance.
const usedTokenIds = new Map();

const hashAnswer = (answer) =>
    crypto
        .createHmac("sha256", process.env.JWT_SECRET)
        .update(String(answer).trim().toLowerCase())
        .digest("hex");

const pruneUsed = () => {
    const now = Date.now();
    for (const [id, expiresAt] of usedTokenIds) {
        if (expiresAt < now) {
            usedTokenIds.delete(id);
        }
    }
};

const createCaptcha = () => {
    const captcha = svgCaptcha.create({
        size: 5,
        width: 200,
        height: 64,
        fontSize: 52,
        noise: 2,
        color: true,
        ignoreChars: "0oO1ilI",
        background: "#f3f4f6"
    });

    const jti = crypto.randomBytes(8).toString("hex");

    const token = jwt.sign(
        { purpose: "captcha", h: hashAnswer(captcha.text), jti },
        process.env.JWT_SECRET,
        { expiresIn: CAPTCHA_TTL_SECONDS }
    );

    return { token, svg: captcha.data };
};

const verifyCaptcha = (token, answer) => {
    if (!token || !answer) {
        return false;
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return false;
    }

    if (decoded.purpose !== "captcha" || usedTokenIds.has(decoded.jti)) {
        return false;
    }

    const expected = Buffer.from(decoded.h, "hex");
    const actual = Buffer.from(hashAnswer(answer), "hex");

    const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);

    // Burn the token whether or not the guess was right, so one image can't be brute-forced.
    pruneUsed();
    usedTokenIds.set(decoded.jti, decoded.exp * 1000);

    return matches;
};

module.exports = { createCaptcha, verifyCaptcha };
