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

db.exec(`
    CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visited_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log(`✅ SQLite (customer login) ready at ${dbPath}`);

module.exports = db;
