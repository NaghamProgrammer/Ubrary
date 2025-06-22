// register.js - Handles registration form submission and API integration

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

    // Client-side validation
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

    if (password.length <= 7) {
      alert("Password must be longer than 7 characters");
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

    // Prepare user data for API
    const userData = {
      username,
      email,
      password,
      role
    };

    try {
      // Show loading indicator
      const submitButton = document.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Registering...";
      submitButton.disabled = true;

      // Call the API to register the user
      const response = await ApiService.register(userData);

      alert(`Welcome ${username}! You can now log in with your credentials`);
      window.location.href = "..\..\templates\login.html";
    } catch (error) {
      // The ApiService wraps the backend error message in error.message
      let detailedErrorMessage = error.message || "An unexpected error occurred during registration.";
      alert(`Registration failed: ${detailedErrorMessage}`); // Display the detailed message from ApiService
    } finally {
      // Reset button state
      const submitButton = document.querySelector('button[type="submit"]');
      submitButton.textContent = "Register";
      submitButton.disabled = false;
    }
  });

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
} 