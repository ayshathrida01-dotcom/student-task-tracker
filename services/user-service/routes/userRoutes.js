
const express = require("express");

function createUserRoutes(
    userController,
    authenticateToken,
    authorizeRoles
) {
    const router = express.Router();

    // Public routes
    router.post("/register", userController.register);
    router.post("/login", userController.login);

    // Protected profile routes
    router.get(
        "/profile",
        authenticateToken,
        userController.getProfile
    );

    router.patch(
        "/profile",
        authenticateToken,
        userController.updateProfile
    );

    // Admin-only teacher approval routes
    router.get(
        "/pending-teachers",
        authenticateToken,
        authorizeRoles("admin"),
        userController.getPendingTeachers
    );

    router.patch(
        "/approve-teacher/:id",
        authenticateToken,
        authorizeRoles("admin"),
        userController.approveTeacher
    );

    router.patch(
        "/reject-teacher/:id",
        authenticateToken,
        authorizeRoles("admin"),
        userController.rejectTeacher
    );

    return router;
}

module.exports = createUserRoutes;
