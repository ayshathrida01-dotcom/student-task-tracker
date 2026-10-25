# Student Task Tracker API

A RESTful API built with Node.js, Express.js, and MySQL to manage student tasks. It supports creating, viewing, updating, and deleting tasks.

## Features

- Create a new task
- Retrieve all tasks or a specific task
- Update task details and status
- Delete tasks
- Validate task input
- Check API and database health
- Store task data in MySQL

## Technologies Used

- Node.js
- Express.js
- MySQL 8
- mysql2
- dotenv
- Nodemon
- Postman for API testing

## Database Structure

The `tasks` table contains:

- `id` — unique task ID
- `title` — task title
- `description` — task details
- `status` — pending, in progress, or completed
- `due_date` — optional deadline
- `created_at` — creation timestamp
- `updated_at` — last update timestamp

## API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check that the API is running |
| POST | `/api/v1/tasks` | Create a task |
| GET | `/api/v1/tasks` | Retrieve all tasks |
| GET | `/api/v1/tasks/:id` | Retrieve a task by ID |
| PATCH | `/api/v1/tasks/:id` | Update a task |
| DELETE | `/api/v1/tasks/:id` | Delete a task |
| GET | `/api/v1/health` | Check API and database health |

## Installation and Setup

### Prerequisites

Install Node.js and MySQL. Ensure the MySQL server is running.

### 1. Clone the repository

```bash
git clone https://github.com/ayshathrida01-dotcom/student-task-tracker.git
cd student-task-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database

Create a MySQL database named `student_task_tracker` and a `tasks` table with the columns described above.

### 4. Configure environment variables

Create a `.env` file in the project root:

```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_task_tracker
DB_PORT=3306
```

Replace `your_mysql_password` with your own MySQL password. Never commit your actual `.env` file to GitHub.

### 5. Run the database connection test

```bash
npm test
```

### 6. Start the development server

```bash
npm run dev
```

The API will run at `http://localhost:3000`.

## Testing

Use Postman to send requests to the API endpoints. For POST and PATCH requests, select **Body → raw → JSON** and provide valid JSON data.

## Author

Ayishat Rida

