const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function createUserController(userModel) {

    // Register user
    
// Register user
async function register(req, res) {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid input"
            });
        }

        const requestedRole = role || "student";

        if (!["student", "teacher"].includes(requestedRole)) {
            return res.status(400).json({
                message: "Only Student and Teacher registration is allowed"
            });
        }

        if (!email.trim().includes("@")) {
            return res.status(400).json({
                message: "Enter a valid email address"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const existingUser = await userModel.getUserByEmail(
            email.trim().toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const approvalStatus =
            requestedRole === "teacher" ? "pending" : "approved";

        const user = await userModel.createUser({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: requestedRole,
            approval_status: approvalStatus
        });

        return res.status(201).json({
            message: requestedRole === "teacher"
                ? "Teacher registration submitted. Waiting for admin approval."
                : "Student registered successfully",
            user
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        return res.status(500).json({
            message: "Registration failed"
        });
    }
}

    // Login user
    async function login(req, res) {
        try {
            const { email, password } = req.body;

            if (
                typeof email !== "string" ||
                typeof password !== "string" ||
                !email.trim() ||
                !password
            ) {
                return res.status(400).json({
                    message: "Email and password are required"
                });
            }

            const user = await userModel.getUserByEmail(
                email.trim().toLowerCase()
            );

            if (!user) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            // Compare entered password with stored hash
            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }
            // Check whether the account is approved
if (user.approval_status !== "approved") {

    if (user.approval_status === "pending") {
        return res.status(403).json({
            message: "Your teacher registration is waiting for admin approval."
        });
    }

    return res.status(403).json({
        message: "Your account has not been approved. Please contact the administrator."
    });
}

            // Generate JWT token
            const token = jwt.sign(
    {
        id: user.id,
        role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
);

            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (error) {
            console.error("Login error:", error);

            res.status(500).json({
                message: "Login failed"
            });
        }
    }

    // Get user profile
    async function getProfile(req, res) {
        try {
            const user = await userModel.getUserById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.status(200).json({
                user
            });

        } catch (error) {
            console.error("Profile error:", error);

            res.status(500).json({
                message: "Failed to retrieve profile"
            });
        }
    }

    // Update user profile
    async function updateProfile(req, res) {
        try {
            const { name, email } = req.body;

            if (name === undefined && email === undefined) {
                return res.status(400).json({
                    message: "Provide a name or email to update"
                });
            }

            if (
                (name !== undefined &&
                    (typeof name !== "string" || !name.trim())) ||
                (email !== undefined &&
                    (typeof email !== "string" ||
                    !email.trim().includes("@")))
            ) {
                return res.status(400).json({
                    message: "Invalid name or email"
                });
            }

            const user = await userModel.updateUser(req.user.id, {
                ...(name !== undefined && { name: name.trim() }),
                ...(email !== undefined && {
                    email: email.trim().toLowerCase()
                })
            });

            res.status(200).json({
                message: "Profile updated successfully",
                user
            });

        } catch (error) {
            console.error("Profile update error:", error);

            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Email is already in use"
                });
            }

            res.status(500).json({
                message: "Failed to update profile"
            });
        }
    }

    
    // Get all pending teacher registrations
    async function getPendingTeachers(req, res) {
        try {
            const teachers = await userModel.getPendingTeachers();

            return res.status(200).json({
                message: "Pending teacher requests retrieved successfully",
                teachers
            });

        } catch (error) {
            console.error("Pending teachers error:", error);

            return res.status(500).json({
                message: "Failed to retrieve pending teachers"
            });
        }
    }

    // Approve a teacher
    async function approveTeacher(req, res) {
        try {
            const { id } = req.params;

            if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
                return res.status(400).json({
                    message: "Invalid teacher ID"
                });
            }

            const updated = await userModel.updateTeacherApproval(
                Number(id),
                "approved"
            );

            if (!updated) {
                return res.status(404).json({
                    message: "Pending teacher request not found"
                });
            }

            return res.status(200).json({
                message: "Teacher approved successfully"
            });

        } catch (error) {
            console.error("Approve teacher error:", error);

            return res.status(500).json({
                message: "Failed to approve teacher"
            });
        }
    }

    // Reject a teacher
    async function rejectTeacher(req, res) {
        try {
            const { id } = req.params;

            if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
                return res.status(400).json({
                    message: "Invalid teacher ID"
                });
            }

            const updated = await userModel.updateTeacherApproval(
                Number(id),
                "rejected"
            );

            if (!updated) {
                return res.status(404).json({
                    message: "Pending teacher request not found"
                });
            }

            return res.status(200).json({
                message: "Teacher rejected successfully"
            });

        } catch (error) {
            console.error("Reject teacher error:", error);

            return res.status(500).json({
                message: "Failed to reject teacher"
            });
        }
    }

    return {
        register,
        login,
        getProfile,
        updateProfile,
        getPendingTeachers,
        approveTeacher,
        rejectTeacher
    };

}

module.exports = createUserController;