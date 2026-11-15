
const API_URL = "http://localhost:3000/api/v1/tasks";

const USER_API_URL = "http://localhost:3000/api/v1/users";

const adminDashboard = document.getElementById("adminDashboard");
const taskDashboard = document.getElementById("taskDashboard");
const pendingTeachersContainer = document.getElementById("pendingTeachersContainer");
const refreshTeachersButton = document.getElementById("refreshTeachersButton");

const taskForm = document.getElementById("taskForm");
const taskContainer = document.getElementById("taskContainer");
const filterStatus = document.getElementById("filterStatus");
const submitButton = document.getElementById("submitButton");

let editingTaskId = null;
let allTasks = [];
function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// Safely display text entered by users
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Fetch all tasks from the backend
async function loadTasks() {
    try {
        const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders()
});

        if (!response.ok) {
            throw new Error("Unable to fetch tasks");
        }

        const result = await response.json();

        // Support common API response formats
        allTasks = Array.isArray(result)
            ? result
            : result.tasks || result.data || [];

        displayTasks();

    } catch (error) {
        taskContainer.innerHTML =
            `<p class="empty-message">
                Cannot connect to the backend. Make sure your server is running.
            </p>`;

        console.error(error);
    }
}

// Display tasks on the webpage
function displayTasks() {
    const selectedStatus = filterStatus.value;

    const filteredTasks = selectedStatus === "all"
        ? allTasks
        : allTasks.filter(task => task.status === selectedStatus);

    if (filteredTasks.length === 0) {
        taskContainer.innerHTML =
            `<p class="empty-message">No tasks found.</p>`;
        return;
    }

    taskContainer.innerHTML = filteredTasks.map(task => `
        <div class="task-card">
            <h3>${escapeHTML(task.title)}</h3>

            <p>${escapeHTML(task.description || "No description")}</p>

            <p>
                <strong>Due Date:</strong>
                ${escapeHTML(task.due_date || "Not specified")}
            </p>

            <span class="status">
                ${escapeHTML((task.status || "pending").replace("_", " "))}
            </span>

            <div class="task-actions">
                <button type="button" data-action="edit"
                    data-id="${Number(task.id)}">
                    Edit
                </button>

                <button type="button" class="delete-btn"
                    data-action="delete" data-id="${Number(task.id)}">
                    Delete
                </button>
            </div>
        </div>
    `).join("");
}

// Add or update a task
taskForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const task = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        status: document.getElementById("status").value,
        due_date: document.getElementById("due_date").value || null
    };

    if (!task.title) {
        alert("Please enter a task title.");
        return;
    }

    const isEditing = editingTaskId !== null;

    const url = isEditing
        ? `${API_URL}/${editingTaskId}`
        : API_URL;

    const method = isEditing ? "PATCH" : "POST";

    try {
        submitButton.disabled = true;

        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || "Task operation failed");
        }

        alert(isEditing
            ? "Task updated successfully!"
            : "Task added successfully!");

        taskForm.reset();
        editingTaskId = null;
        submitButton.textContent = "Add Task";

        await loadTasks();

    } catch (error) {
        alert("Error: " + error.message);
        console.error(error);
    } finally {
        submitButton.disabled = false;
    }
});

// Edit or delete a task
taskContainer.addEventListener("click", async function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const taskId = Number(button.dataset.id);
    const action = button.dataset.action;

    if (!Number.isInteger(taskId) || taskId <= 0) return;

    if (action === "edit") {
        editTask(taskId);
    }

    if (action === "delete") {
        await deleteTask(taskId);
    }
});

// Fill the form with existing task details
function editTask(taskId) {
    const task = allTasks.find(item => Number(item.id) === taskId);

    if (!task) {
        alert("Task not found.");
        return;
    }

    editingTaskId = taskId;

    document.getElementById("title").value = task.title || "";
    document.getElementById("description").value = task.description || "";
    document.getElementById("status").value = task.status || "pending";
    document.getElementById("due_date").value =
        task.due_date ? String(task.due_date).slice(0, 10) : "";

    submitButton.textContent = "Update Task";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Delete a task
async function deleteTask(taskId) {
    const confirmed = confirm("Are you sure you want to delete this task?");

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
});

        if (!response.ok) {
            throw new Error("Unable to delete task");
        }

        alert("Task deleted successfully!");

        if (editingTaskId === taskId) {
            taskForm.reset();
            editingTaskId = null;
            submitButton.textContent = "Add Task";
        }

        await loadTasks();

    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

// Filter tasks by status
filterStatus.addEventListener("change", displayTasks);

// Load tasks when the page opens

// Check user authentication
async function verifyUserLogin() {
    const token = localStorage.getItem("token");

    // Redirect if user is not logged in
    if (!token) {
        window.location.href = "auth.html";
        return;
    }

    try {
        const response = await fetch(
            `${USER_API_URL}/profile`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "auth.html";
            return;
        }

        const data = await response.json();

        // Display logged-in user's name
        document.getElementById("welcomeUser").textContent =
            `Welcome, ${data.user.name}!`;

        // Check user's role
        const role = data.user.role;

        if (role === "admin") {
    // Show both Admin and Task Dashboards
    adminDashboard.style.display = "block";
    taskDashboard.style.display = "block";

    loadPendingTeachers();
    loadTasks();

} else {
    // Show normal Task Dashboard
    adminDashboard.style.display = "none";
    taskDashboard.style.display = "block";

    loadTasks();
}
    } catch (error) {
        console.error("Authentication error:", error);
        alert("Unable to verify login. Please check your services.");
    }
}
// Load pending teacher registrations
async function loadPendingTeachers() {
    try {
        const response = await fetch(
            `${USER_API_URL}/pending-teachers`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        const result = await response.json();

        if (!response.ok) {
            pendingTeachersContainer.innerHTML =
                `<p>${result.message || "Unable to load teacher requests."}</p>`;
            return;
        }

        if (!result.teachers || result.teachers.length === 0) {
            pendingTeachersContainer.innerHTML =
                "<p>No pending teacher registrations.</p>";
            return;
        }

        pendingTeachersContainer.innerHTML = "";

        result.teachers.forEach(teacher => {
            const teacherCard = document.createElement("div");

            teacherCard.innerHTML = `
                <h4>${escapeHTML(teacher.name)}</h4>
                <p>Email: ${escapeHTML(teacher.email)}</p>
                <button data-action="approve" data-id="${teacher.id}">
                    Approve
                </button>
                <button data-action="reject" data-id="${teacher.id}">
                    Reject
                </button>
                <hr>
            `;

            pendingTeachersContainer.appendChild(teacherCard);
        });

    } catch (error) {
        console.error("Error loading teachers:", error);
        pendingTeachersContainer.innerHTML =
            "<p>Unable to connect to the User Service.</p>";
    }
}
// Handle Approve and Reject button clicks
pendingTeachersContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");

    if (button.tagName !== "BUTTON") {
        return;
    }

    const action = button.dataset.action;
    const teacherId = button.dataset.id;

    if (!action || !teacherId) {
        return;
    }

    const confirmAction = confirm(
        `Are you sure you want to ${action} this teacher?`
    );

    if (!confirmAction) {
        return;
    }

    try {
        const response = await fetch(
            `${USER_API_URL}/${action}-teacher/${teacherId}`,
            {
                method: "PATCH",
                headers: getAuthHeaders()
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || `Unable to ${action} teacher.`);
            return;
        }

        alert(`Teacher ${action}d successfully!`);

        // Refresh the pending teacher list
        loadPendingTeachers();

    } catch (error) {
        console.error(`Error ${action}ing teacher:`, error);
        alert("Unable to connect to the server.");
    }
});
// Refresh pending teacher requests
refreshTeachersButton.addEventListener("click", () => {
    loadPendingTeachers();
});

// Logout
document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "auth.html";
});

// Verify login when dashboard loads
verifyUserLogin();
