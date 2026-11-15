
function createUserModel(db) {

    // Register a new user
    async function createUser(user) {
        const {
            name,
            email,
            password,
            role = "student",
            approval_status = "approved"
        } = user;

        const [result] = await db.execute(
            `INSERT INTO users
             (name, email, password, role, approval_status)
             VALUES (?, ?, ?, ?, ?)`,
            [name, email, password, role, approval_status]
        );

        return getUserById(result.insertId);
    }

    // Find user using email
    async function getUserByEmail(email) {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        return rows[0];
    }

    // Find user using ID
    async function getUserById(id) {
        const [rows] = await db.execute(
            `SELECT id, name, email, role, approval_status,
                    created_at, updated_at
             FROM users WHERE id = ?`,
            [id]
        );

        return rows[0];
    }

    // Get pending teacher registrations
    async function getPendingTeachers() {
        const [rows] = await db.execute(
            `SELECT id, name, email, role, approval_status, created_at
             FROM users
             WHERE role = 'teacher'
             AND approval_status = 'pending'
             ORDER BY created_at DESC`
        );

        return rows;
    }

    // Approve or reject a teacher
    async function updateTeacherApproval(id, status) {
        const [result] = await db.execute(
            `UPDATE users
             SET approval_status = ?
             WHERE id = ?
             AND role = 'teacher'
             AND approval_status = 'pending'`,
            [status, id]
        );

        return result.affectedRows > 0;
    }

    // Update user profile
    async function updateUser(id, user) {
        const { name, email } = user;

        const fields = [];
        const values = [];

        if (name !== undefined) {
            fields.push("name = ?");
            values.push(name);
        }

        if (email !== undefined) {
            fields.push("email = ?");
            values.push(email);
        }

        if (fields.length === 0) {
            return getUserById(id);
        }

        values.push(id);

        await db.execute(
            `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
            values
        );

        return getUserById(id);
    }

    return {
        createUser,
        getUserByEmail,
        getUserById,
        getPendingTeachers,
        updateTeacherApproval,
        updateUser
    };
}

module.exports = createUserModel;
