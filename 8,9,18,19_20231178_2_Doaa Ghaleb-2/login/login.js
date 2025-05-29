document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.toLowerCase().trim();
    const password = document.getElementById('loginPassword').value;
    const adminCode = document.getElementById('adminCode').value;
    const rememberMe = document.querySelector('#loginForm input[type="checkbox"]').checked;
    
    // Basic validation
    if (!email || !password) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Check credentials
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    if (!user) {
        alert('No account found with this email');
        return;
    }
    
    if (user.password !== password) {
        alert('Incorrect password');
        return;
    }
    
    // Store current user session
    if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    // Handle admin code
    if (adminCode === '1234') {
        window.location.href = '../user-adminpages/adminPage.html';
    } else if (adminCode === '') {
        window.location.href = '../user-adminpages/userPage.html';    
    } else {
        alert('Invalid admin code. Please leave blank if not an admin.');
    }
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Check for remembered user on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                       JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (currentUser) {
        document.getElementById('loginEmail').value = currentUser.email;
        document.querySelector('#loginForm input[type="checkbox"]').checked = true;
    }
});