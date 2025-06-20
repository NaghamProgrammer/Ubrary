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
      submitButton.textContent = "Checking...";
      submitButton.disabled = true;

      // First, check if the email exists in the database
      try {
        const emailCheckResponse = await ApiService.checkEmailExists(email);
        
        if (!emailCheckResponse.exists) {
          // Email doesn't exist - show alert and stop here
          alert("This email does not exist in our system");
          return;
        }
        
        // Email exists - proceed with password reset
        submitButton.textContent = "Sending...";
        
        // Call the API to request password reset
        const response = await ApiService.requestPasswordReset(email);

        // Show success message
        alert(
          `Password reset instructions have been sent to ${email}. Check your email for a reset link.`
        );

        // Redirect to set password page with token and uid from the response
        window.location.href = `reset-password.html?email=${encodeURIComponent(
          email
        )}&token=${encodeURIComponent(response.token)}&uid=${encodeURIComponent(response.uid)}`;
        
      } catch (emailCheckError) {
        // Handle email check errors
        if (emailCheckError.message.includes("This email does not exist")) {
          alert("This email does not exist in our system");
        } else {
          alert(`Failed to verify email: ${emailCheckError.message}`);
        }
        return;
      }

    } catch (error) {
      // Handle password reset request errors
      alert(`Failed to send reset instructions: ${error.message}`);
    } finally {
      // Reset button state
      const submitButton = document.querySelector('button[type="submit"]');
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
