const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Task Service URL
const TASK_SERVICE_URL = "http://localhost:3001";
const USER_SERVICE_URL = "http://localhost:3002";
// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        message: "API Gateway is running!"
    });
});
// Forward user requests to User Service
app.use("/api/v1/users", async (req, res) => {
    try {
        const serviceUrl =
            `${USER_SERVICE_URL}/api/v1/users${req.url}`;

        const response = await fetch(serviceUrl, {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
                ...(req.headers.authorization && {
                    Authorization: req.headers.authorization
                })
            },
            body: ["GET", "HEAD"].includes(req.method)
                ? undefined
                : JSON.stringify(req.body)
        });

        const data = await response.json();

        res.status(response.status).json(data);

    } catch (error) {
        console.error("User Service Gateway error:", error);

        res.status(503).json({
            message: "User Service is unavailable"
        });
    }
});

// Forward task requests to Task Service
app.use("/api/v1/tasks", async (req, res) => {
    try {
        const serviceUrl = `${TASK_SERVICE_URL}/api/v1/tasks${req.url}`;

        const response = await fetch(serviceUrl, {
            method: req.method,
            headers: {
    "Content-Type": "application/json",
    ...(req.headers.authorization && {
        Authorization: req.headers.authorization
    })
},
            body: ["GET", "HEAD"].includes(req.method)
                ? undefined
                : JSON.stringify(req.body)
        });

        const data = await response.json();

        res.status(response.status).json(data);

    } catch (error) {
        console.error("API Gateway error:", error);

        res.status(503).json({
            message: "Task Service is unavailable"
        });
    }
});

// Start API Gateway
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});