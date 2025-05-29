document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    
    if (!email) {
        alert('Invalid reset link');
        window.location.href = 'forgot-password.html';
        return;
    }
    
    document.getElementById('resetEmail').value = email;
});

document.getElementById('resetPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!newPassword || !confirmNewPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (newPassword.length <= 6) {
        alert('Password must be longer than 6 characters');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // In a real app, you would verify the token from the email
    // For this demo, we'll just check if it exists in localStorage
    const storedToken = localStorage.getItem('resetToken_' + email);
    
    if (!storedToken) {
        alert('Invalid or expired reset link');
        window.location.href = 'forgot-password.html';
        return;
    }
    
    // Update the user's password
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.email === email);
    
    if (userIndex === -1) {
        alert('User not found');
        return;
    }
    
    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Clean up the reset token
    localStorage.removeItem('resetToken_' + email);
    
    alert('Password has been reset successfully');
    window.location.href = 'login.html';
});