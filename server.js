
const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Student Task Tracker API is running!'
    });
});


app.post('/api/v1/tasks', async (req, res) => {
    try {
        const { title, description, status, due_date } = req.body;

        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                error: 'A valid task title is required'
            });
        }

        const allowedStatuses = [
            'pending',
            'in_progress',
            'completed'
        ];

        if (status !== undefined && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO tasks (title, description, status, due_date)
             VALUES (?, ?, ?, ?)`,
            [
                title.trim(),
                description ?? null,
                status ?? 'pending',
                due_date ?? null
            ]
        );

        const [rows] = await pool.execute(
            'SELECT * FROM tasks WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Task created successfully',
            task: rows[0]
        });
    } catch (error) {
        if (error.code === 'ER_TRUNCATED_WRONG_VALUE' ||
            error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
            return res.status(400).json({
                error: 'Invalid task data. Check the status or due date.'
            });
        }

        console.error(error.message);
        res.status(500).json({
            error: 'Failed to create task'
        });
    }
});


 // Get all tasks
app.get('/api/v1/tasks', async (req, res) => {
    try {
        const [tasks] = await pool.query(
            'SELECT * FROM tasks ORDER BY created_at DESC'
        );

        res.status(200).json({
            count: tasks.length,
            tasks
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            error: 'Failed to fetch tasks'
        });
    }
});

// Get one task by ID
app.get('/api/v1/tasks/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Task ID must be a positive integer'
            });
        }

        const [tasks] = await pool.execute(
            'SELECT * FROM tasks WHERE id = ?',
            [id]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.status(200).json({
            task: tasks[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            error: 'Failed to fetch task'
        });
    }
});


app.patch('/api/v1/tasks/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Task ID must be a positive integer'
            });
        }

        const allowedFields = [
            'title',
            'description',
            'status',
            'due_date'
        ];

        const updates = Object.keys(req.body);

        if (updates.length === 0 ||
            updates.some(field => !allowedFields.includes(field))) {
            return res.status(400).json({
                error: 'Provide valid fields to update'
            });
        }

        if ('title' in req.body &&
            (typeof req.body.title !== 'string' ||
             !req.body.title.trim())) {
            return res.status(400).json({
                error: 'Title cannot be empty'
            });
        }

        const allowedStatuses = [
            'pending',
            'in_progress',
            'completed'
        ];

        if ('status' in req.body &&
            !allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({
                error: 'Invalid status'
            });
        }

        const [existing] = await pool.execute(
            'SELECT id FROM tasks WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        const values = [];
        const setClauses = updates.map(field => {
            values.push(
                field === 'title'
                    ? req.body[field].trim()
                    : req.body[field]
            );
            return `\`${field}\` = ?`;
        });

        values.push(id);

        await pool.execute(
            `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`,
            values
        );

        const [tasks] = await pool.execute(
            'SELECT * FROM tasks WHERE id = ?',
            [id]
        );

        res.status(200).json({
            message: 'Task updated successfully',
            task: tasks[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            error: 'Failed to update task'
        });
    }
});


app.delete('/api/v1/tasks/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'Invalid task ID'
            });
        }

        const [result] = await pool.execute(
            'DELETE FROM tasks WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.status(200).json({
            message: 'Task deleted successfully',
            id: id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to delete task'
        });
    }
});


// Check database connection
app.get('/api/v1/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: 'OK',
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
