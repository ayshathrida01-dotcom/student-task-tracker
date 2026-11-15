const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});

const initializeDatabase = require("./config/db");
const createUserModel = require("./models/userModel");
const createUserController = require("./controllers/userController");
const createUserRoutes = require("./routes/userRoutes");
const {
    authenticateToken,
    authorizeRoles
} = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        message: "User Service is running!"
    });
});

// Start User Service
async function startServer() {
    try {
        // Initialize database
        const db = await initializeDatabase();

        // Connect model and controller
        const userModel = createUserModel(db);
        const userController = createUserController(userModel);

        // Connect routes
        const userRoutes = createUserRoutes(
    userController,
    authenticateToken,
    authorizeRoles
);

        app.use("/api/v1/users", userRoutes);

        // Start server
        app.listen(PORT, () => {
            console.log(`User Service running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start User Service:", error);
        process.exit(1);
    }
}

startServer();