
function createTaskController(taskModel) {

    // GET all tasks based on logged-in user's role
    async function getAllTasks(req, res) {
        try {
            const tasks = await taskModel.getAllTasks(
                req.user.id,
                req.user.role
            );

            res.status(200).json({
                count: tasks.length,
                tasks
            });
        } catch (error) {
            console.error("Get tasks error:", error);
            res.status(500).json({
                message: "Failed to retrieve tasks"
            });
        }
    }

    // GET task by ID
    async function getTaskById(req, res) {
        try {
            const task = await taskModel.getTaskById(
                req.params.id,
                req.user.id,
                req.user.role
            );

            if (!task) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.status(200).json(task);
        } catch (error) {
            console.error("Get task error:", error);
            res.status(500).json({
                message: "Failed to retrieve task"
            });
        }
    }

    // POST create task
    async function createTask(req, res) {
        try {
            const { title, description, status, due_date } = req.body;

            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    message: "Task title is required"
                });
            }

            const validStatuses = [
                "pending",
                "in_progress",
                "completed"
            ];

            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid task status"
                });
            }

            const task = await taskModel.createTask({
                title: title.trim(),
                description,
                status,
                due_date
            }, req.user.id);

            res.status(201).json({
                message: "Task created successfully",
                task
            });
        } catch (error) {
            console.error("Create task error:", error);
            res.status(500).json({
                message: "Failed to create task"
            });
        }
    }

    // PATCH update task
    async function updateTask(req, res) {
        try {
            const task = await taskModel.updateTask(
                req.params.id,
                req.body,
                req.user.id,
                req.user.role
            );

            if (!task) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.status(200).json({
                message: "Task updated successfully",
                task
            });
        } catch (error) {
            console.error("Update task error:", error);
            res.status(500).json({
                message: "Failed to update task"
            });
        }
    }

    // DELETE task
    async function deleteTask(req, res) {
        try {
            const deleted = await taskModel.deleteTask(
                req.params.id,
                req.user.id,
                req.user.role
            );

            if (!deleted) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.status(200).json({
                message: "Task deleted successfully"
            });
        } catch (error) {
            console.error("Delete task error:", error);
            res.status(500).json({
                message: "Failed to delete task"
            });
        }
    }

    return {
        getAllTasks,
        getTaskById,
        createTask,
        updateTask,
        deleteTask
    };
}

module.exports = createTaskController;
