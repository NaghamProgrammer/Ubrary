document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.toLowerCase().trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsChecked = document.getElementById('terms').checked;
    
    // Validate username
    if (!/^[A-Za-z\s]+$/.test(username)) {
        alert('Username can only contain letters and spaces');
        return;
    }
    
    if (username.length < 3 || username.length > 30) {
        alert('Username must be between 3 and 30 characters');
        return;
    }
    
    if (username.includes('  ') || username !== username.trim()) {
        alert('Username cannot have double spaces or leading/trailing spaces');
        return;
    }
    
    // Validate other fields
    if (!username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (password.length <= 6) {
        alert('Password must be longer than 6 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!termsChecked) {
        alert('You must accept the terms and conditions');
        return;
    }
    
   
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.email === email);
    
    if (userExists) {
        alert('This email is already registered');
        return;
    }
    
   
    const newUser = {
        username,
        email,
        password, 
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    alert(`Welcome ${username}! You can now log in with your credentials`);
    window.location.href = 'login.html';
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}