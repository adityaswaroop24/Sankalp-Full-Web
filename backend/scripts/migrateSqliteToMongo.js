require("dotenv").config();

const path = require("path");
const Database = require("better-sqlite3");
const mongoose = require("mongoose");

const User = require("../models/User");
const Visit = require("../models/Visit");

const run = async () => {
    const sqliteDb = new Database(path.join(__dirname, "..", "db", "customers.db"));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const users = sqliteDb.prepare("SELECT * FROM users").all();
    let migratedUsers = 0;

    for (const user of users) {
        const existing = await User.findOne({ email: user.email });

        if (existing) {
            console.log(`Skipping ${user.email} (already in MongoDB)`);
            continue;
        }

        await User.create({
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            resetToken: user.reset_token || null,
            resetTokenExpires: user.reset_token_expires ? new Date(user.reset_token_expires) : null,
            created_at: user.created_at ? new Date(user.created_at) : new Date()
        });

        migratedUsers++;
    }

    console.log(`Migrated ${migratedUsers} of ${users.length} users.`);

    const visits = sqliteDb.prepare("SELECT * FROM visits").all();

    if (visits.length > 0) {
        await Visit.insertMany(
            visits.map(v => ({ visited_at: new Date(v.visited_at) }))
        );
    }

    console.log(`Migrated ${visits.length} visits.`);

    sqliteDb.close();
    await mongoose.disconnect();
    console.log("Done.");
};

run().catch(error => {
    console.error("Migration failed:", error);
    process.exit(1);
});
