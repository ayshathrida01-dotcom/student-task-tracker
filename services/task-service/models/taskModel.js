
function createTaskModel(db) {

    // Get tasks based on user role
    async function getAllTasks(userId, role) {
        let query;
        let values;

        if (role === "admin" || role === "teacher") {
            query = "SELECT * FROM tasks ORDER BY id DESC";
            values = [];
        } else {
            query = "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC";
            values = [userId];
        }

        const [rows] = await db.execute(query, values);
        return rows;
    }

    // Get a specific task based on user role
    async function getTaskById(id, userId, role) {
        let query;
        let values;

        if (role === "admin" || role === "teacher") {
            query = "SELECT * FROM tasks WHERE id = ?";
            values = [id];
        } else {
            query = "SELECT * FROM tasks WHERE id = ? AND user_id = ?";
            values = [id, userId];
        }

        const [rows] = await db.execute(query, values);
        return rows[0];
    }

    // Create a task for a user
    async function createTask(task, userId) {
        const { title, description, status, due_date } = task;

        const [result] = await db.execute(
            `INSERT INTO tasks
             (title, description, status, due_date, user_id)
             VALUES (?, ?, ?, ?, ?)`,
            [
                title,
                description || null,
                status || "pending",
                due_date || null,
                userId
            ]
        );

        return getTaskById(result.insertId, userId, "student");
    }

    // Update a task based on user role
    async function updateTask(id, task, userId, role) {
        const allowedFields = [
            "title",
            "description",
            "status",
            "due_date"
        ];

        const fields = Object.keys(task).filter(
            field => allowedFields.includes(field)
        );

        if (fields.length === 0) {
            return getTaskById(id, userId, role);
        }

        const values = fields.map(field => task[field]);

        const setClause = fields
            .map(field => `\`${field}\` = ?`)
            .join(", ");

        let query;
        let queryValues;

        if (role === "admin" || role === "teacher") {
            query = `UPDATE tasks SET ${setClause} WHERE id = ?`;
            queryValues = [...values, id];
        } else {
            query = `UPDATE tasks SET ${setClause}
                     WHERE id = ? AND user_id = ?`;
            queryValues = [...values, id, userId];
        }

        const [result] = await db.execute(query, queryValues);

        if (result.affectedRows === 0) {
            return null;
        }

        return getTaskById(id, userId, role);
    }

    // Delete a task based on user role
    async function deleteTask(id, userId, role) {
        let query;
        let values;

        if (role === "admin") {
            query = "DELETE FROM tasks WHERE id = ?";
            values = [id];
        } else {
            query = "DELETE FROM tasks WHERE id = ? AND user_id = ?";
            values = [id, userId];
        }

        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    }

    return {
        getAllTasks,
        getTaskById,
        createTask,
        updateTask,
        deleteTask
    };
}

module.exports = createTaskModel;
