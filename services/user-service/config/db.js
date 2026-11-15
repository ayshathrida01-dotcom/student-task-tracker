
const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../../../.env")
});

const databaseName = "student_users_db";


async function initializeDatabase() {

    // Connect to MySQL server
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 3306
    });

    // Create database automatically
    await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${databaseName}\``
    );

    await connection.end();

    // Create database connection pool
    const pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        database: databaseName,
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10
    });

    // Create users table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'student',
            approval_status VARCHAR(20) NOT NULL DEFAULT 'approved',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Check existing columns
    const [columns] = await pool.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'users'
    `, [databaseName]);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    // Add role column if missing
    if (!existingColumns.includes("role")) {
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'student'
        `);
        console.log("Role column added successfully!");
    }

    // Add approval_status column if missing
    if (!existingColumns.includes("approval_status")) {
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'approved'
        `);
        console.log("Approval status column added successfully!");
    }

    console.log("User Service database initialized successfully!");

    return pool;
}


module.exports = initializeDatabase;
