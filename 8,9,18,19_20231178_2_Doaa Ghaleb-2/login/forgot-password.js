document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value.toLowerCase().trim();
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Check if email exists in users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.email === email);
    
    if (!userExists) {
        alert('No account found with this email address');
        return;
    }
    

    const resetToken = generateToken();
    localStorage.setItem('resetToken_' + email, resetToken);
    
    alert(`Password reset link has been sent to ${email} . Click OK to proceed.`);
    window.location.href = `reset-password.html?email=${encodeURIComponent(email)}`;
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function generateToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}