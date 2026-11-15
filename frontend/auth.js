const AUTH_API = "http://localhost:3000/api/v1/users";

// Registration
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

   const name = document.getElementById("registerName").value;
const email = document.getElementById("registerEmail").value;
const password = document.getElementById("registerPassword").value;
const role = document.getElementById("registerRole").value;

    const message = document.getElementById("registerMessage");

    try {
        const response = await fetch(`${AUTH_API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
           body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            document.getElementById("registerForm").reset();
        }

    } catch (error) {
        message.textContent = "Unable to connect to the server.";
    }
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const message = document.getElementById("loginMessage");

    try {
        const response = await fetch(`${AUTH_API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            // Store login token
            localStorage.setItem("token", data.token);

            // Store user information
            localStorage.setItem("user", JSON.stringify(data.user));

            // Open task dashboard
            window.location.href = "index.html";
        }

    } catch (error) {
        message.textContent = "Unable to connect to the server.";
    }
});