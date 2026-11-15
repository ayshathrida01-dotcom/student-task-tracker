const express = require("express");

function createTaskRoutes(
    taskController,
    authenticateToken,
    authorizeRoles
) {
    const router = express.Router();

    // All task routes require authentication
    router.use(authenticateToken);

    // View tasks
    router.get(
        "/",
        authorizeRoles("student", "teacher", "admin"),
        taskController.getAllTasks
    );

    router.get(
        "/:id",
        authorizeRoles("student", "teacher", "admin"),
        taskController.getTaskById
    );

    // Create tasks
    router.post(
        "/",
        authorizeRoles("student", "admin"),
        taskController.createTask
    );

    // Update tasks
    router.patch(
        "/:id",
        authorizeRoles("student", "teacher", "admin"),
        taskController.updateTask
    );

    // Delete tasks
    router.delete(
        "/:id",
        authorizeRoles("student", "admin"),
        taskController.deleteTask
    );

    return router;
}

module.exports = createTaskRoutes;