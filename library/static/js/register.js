document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.toLowerCase().trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.querySelector('input[name="userRole"]:checked').value;
    const termsChecked = document.getElementById("terms").checked;

    if (!/^[A-Za-z\s]+$/.test(username)) {
      alert("Username can only contain letters and spaces");
      return;
    }

    if (username.length < 3 || username.length > 30) {
      alert("Username must be between 3 and 30 characters");
      return;
    }

    if (username.includes("  ") || username !== username.trim()) {
      alert("Username cannot have double spaces or leading/trailing spaces");
      return;
    }

    if (!username || !email || !password || !confirmPassword || !role) {
      alert("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (password.length < 8 || password.length > 12) {
      alert("Password must be between 8 and 12 characters");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      alert("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      alert("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      alert("Password must contain at least one number");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      alert("Password must contain at least one special character");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!termsChecked) {
      alert("You must accept the terms and conditions");
      return;
    }

    const userData = {
      username,
      email,
      password,
      is_admin: role === "admin"
    };

    try {
      const submitButton = document.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Registering...";
      submitButton.disabled = true;

      const response = await ApiService.register(userData);

      alert(`Welcome ${username}! You can now log in with your credentials`);
      window.location.href = "../templates/login.html";
    } catch (error) {
      let detailedErrorMessage = error.message || "An unexpected error occurred during registration.";
      alert(`Registration failed: ${detailedErrorMessage}`);
    } finally {
      const submitButton = document.querySelector('button[type="submit"]');
      submitButton.textContent = "Register";
      submitButton.disabled = false;
    }
  });

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
