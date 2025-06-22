// login.js - Handles login form submission and API integration

document.addEventListener("DOMContentLoaded", function () {
  // Check for remembered user on page load
  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) ||
    JSON.parse(sessionStorage.getItem("currentUser"));

  if (currentUser) {
    document.getElementById("loginEmail").value = currentUser.email;
    document.querySelector('#loginForm input[type="checkbox"]').checked = true;
  }
});

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document
      .getElementById("loginEmail")
      .value.toLowerCase()
      .trim();
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.querySelector(
      '#loginForm input[type="checkbox"]'
    ).checked;

    // Basic validation
    if (!email || !password) {
      alert("Please fill in all required fields");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      // Show loading indicator
      const submitButton = document.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Logging in...";
      submitButton.disabled = true;

      // Call the API to authenticate the user
      const response = await ApiService.login(email, password);

      // Store the authentication token
      if (response.token) {
        localStorage.setItem("authToken", response.token);
      }

      // Store minimal user info for UI personalization
      const userDataToStore = {
        email: email,
        // Adjust based on how your backend provides role information
        role: response.is_admin ? "admin" : "user",
      };

      if (rememberMe) {
        localStorage.setItem("currentUser", JSON.stringify(userDataToStore));
      } else {
        sessionStorage.setItem("currentUser", JSON.stringify(userDataToStore));
      }

      // Redirect based on role
      if (userDataToStore.role === "admin") {
        window.location.href = "../templates/adminPage.html";
      } else {
        window.location.href = "../templates/userPage.html";
      }
    } catch (error) {
      // Handle login errors
      if (error.message.includes("credentials")) {
        alert("Invalid email or password");
      } else {
        alert(`Login failed: ${error.message}`);
      }
    } finally {
      // Reset button state
      const submitButton = document.querySelector('button[type="submit"]');
      submitButton.textContent = "Login";
      submitButton.disabled = false;
    }
  });

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
} 