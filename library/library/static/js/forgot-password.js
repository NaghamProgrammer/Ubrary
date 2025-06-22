// forgot-password.js - Handles forgot password form submission and API integration

document
  .getElementById("forgotPasswordForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document
      .getElementById("resetEmail")
      .value.toLowerCase()
      .trim();

    if (!email) {
      alert("Please enter your email address");
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
      submitButton.textContent = "Sending...";
      submitButton.disabled = true;

      // Call the API to request password reset
      const response = await ApiService.requestPasswordReset(email);

      // In a real application, the backend would send an email with reset instructions
      alert(
        `Password reset instructions have been sent to ${email}. Check your email for a reset link.`
      );

      // For demonstration purposes, we're redirecting to simulate the flow
      // Now including token and uid from the response
      window.location.href = `reset-password.html?email=${encodeURIComponent(
        email
      )}&token=${encodeURIComponent(response.token)}&uid=${encodeURIComponent(response.uid)}`;
    } catch (error) {
      // Handle specific errors
      if (error.message.includes("email")) {
        alert("Email address not found in our system");
      } else {
        alert(`Failed to send reset instructions: ${error.message}`);
      }
    } finally {
      // Reset button state
      const submitButton = document.querySelector('button[type="submit"]');
      submitButton.textContent = "Send Reset Link";
      submitButton.disabled = false;
    }
  });

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
