// reset-password.js - Handles reset password form submission and API integration

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");
  const token = urlParams.get("token");
  const uid = urlParams.get("uid");

  if (!email) {
    // In a real application, these would come from the reset link in the email
    alert("Invalid reset link. Please request a new password reset.");
    window.location.href = "forgot-password.html";
    return;
  }

  document.getElementById("resetEmail").value = email;
});

document
  .getElementById("resetPasswordForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("resetEmail").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword =
      document.getElementById("confirmNewPassword").value;

    // Get token and uid from URL (in a real app, these would come from the email link)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const uid = urlParams.get("uid");

    if (!newPassword || !confirmNewPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (newPassword.length <= 6) {
      alert("Password must be longer than 6 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // Show loading indicator
      const submitButton = document.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Resetting...";
      submitButton.disabled = true;

      // Call the API to reset the password
      await ApiService.resetPassword(uid, token, newPassword);

      alert("Password has been reset successfully");
      window.location.href = "login.html";
    } catch (error) {
      // Handle specific errors
      if (error.message.includes("token")) {
        alert("Invalid or expired reset token. Please request a new password reset.");
      } else {
        alert(`Password reset failed: ${error.message}`);
      }
    } finally {
      // Reset button state
      const submitButton = document.querySelector('button[type="submit"]');
      submitButton.textContent = "Reset Password";
      submitButton.disabled = false;
    }
  });
