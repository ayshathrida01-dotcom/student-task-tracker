const express = require("express");
const cors = require("cors");

const initializeDatabase = require("./config/db");
const createTaskModel = require("./models/taskModel");
const createTaskController = require("./controllers/taskController");
const createTaskRoutes = require("./routes/taskRoutes");
const {
    authenticateToken,
    authorizeRoles
} = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.TASK_SERVICE_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        message: "Task Service is running!"
    });
});

// Start Task Service
async function startServer() {
    try {
        // Initialize database and get connection pool
        const db = await initializeDatabase();

        // Connect model, controller and routes
        const taskModel = createTaskModel(db);
        const taskController = createTaskController(taskModel);
        const taskRoutes = createTaskRoutes(
    taskController,
    authenticateToken,
    authorizeRoles
);

        // Register task routes
        app.use("/api/v1/tasks", taskRoutes);

        // Start server
        app.listen(PORT, () => {
            console.log(`Task Service running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start Task Service:", error);
        process.exit(1);
    }
}

startServer();