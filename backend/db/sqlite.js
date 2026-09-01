const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "customers.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Customer',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

const userColumns = db.prepare("PRAGMA table_info(users)").all().map(col => col.name);

if (!userColumns.includes("reset_token")) {
    db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT");
}

if (!userColumns.includes("reset_token_expires")) {
    db.exec("ALTER TABLE users ADD COLUMN reset_token_expires TEXT");
}

db.exec(`
    CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visited_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log(`✅ SQLite (customer login) ready at ${dbPath}`);

module.exports = db;
