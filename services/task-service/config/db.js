
const mysql = require("mysql2/promise");
require("dotenv").config({
    path: require("path").resolve(__dirname, "../../../.env")
});

const databaseName = process.env.DB_NAME || "student_task_tracker";

async function initializeDatabase() {
    // Connect to MySQL server without selecting a database
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 3306
    });

    // Create the database if it doesn't already exist
    await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${databaseName}\``
    );

    await connection.end();

    // Create a connection pool for the Task Service
    const pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        database: databaseName,
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10
    });

    // Create the tasks table if it doesn't already exist
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT,
            status ENUM('pending', 'in_progress', 'completed')
                DEFAULT 'pending',
            due_date DATE NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        )
    `);
// Add user_id column if it doesn't already exist
const [columns] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
     AND TABLE_NAME = 'tasks'
     AND COLUMN_NAME = 'user_id'`,
    [databaseName]
);

if (columns.length === 0) {
    await pool.query(`
        ALTER TABLE tasks
        ADD COLUMN user_id INT NULL
    `);
}

// Create an index for faster user-specific task searches
const [indexes] = await pool.query(
    `SHOW INDEX FROM tasks WHERE Key_name = 'idx_tasks_user_id'`
);

if (indexes.length === 0) {
    await pool.query(`
        CREATE INDEX idx_tasks_user_id ON tasks(user_id)
    `);
}
    console.log("Task Service database initialized successfully!");

    return pool;
}

module.exports = initializeDatabase;
