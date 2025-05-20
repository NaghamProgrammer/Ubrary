// addAdmin.js - API-integrated version
document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'http://127.0.0.1:8000/api';
    const addBookForm = document.getElementById('addBookForm');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    addBookForm.parentNode.insertBefore(messageDiv, addBookForm.nextSibling);

    // Load categories when page loads
    loadCategories();

    // Function to load categories from API
    async function loadCategories() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                showMessage('Authentication required. Please log in.', 'error');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/categories/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load categories');
            }

            const categories = await response.json();
            const categorySelect = document.getElementById('category');
            
            // Clear existing options
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            
            // Add categories from API
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
            showMessage('Failed to load categories. Please refresh the page.', 'error');
        }
    }

    // Form submission handler
    addBookForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearMessage();

        // Get form values
        const bookId = document.getElementById('bookId')?.value?.trim();
        const bookName = document.getElementById('bookName').value.trim();
        const author = document.getElementById('author').value.trim();
        const categoryId = document.getElementById('category').value;
        const publishedDate = document.getElementById('publishedDate').value;
        const description = document.getElementById('description').value.trim();
        const coverFile = document.getElementById('cover').files[0];

        // Validate required fields
        if (!bookName || !author || !categoryId || !publishedDate || !description || !coverFile) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }

        // Validate author name (letters and spaces only)
        const authorRegex = /^[a-zA-Z\s]+$/;
        if (!authorRegex.test(author)) {
            showMessage('Author name should only contain letters and spaces.', 'error');
            return;
        }

        // Validate title length
        if (bookName.length > 100) {
            showMessage('Title must not exceed 100 characters.', 'error');
            return;
        }

        // Validate published date (not in future)
        const today = new Date().toISOString().split('T')[0];
        if (publishedDate > today) {
            showMessage('Published Date cannot be in the future.', 'error');
            return;
        }

        // Show loading state
        showMessage('Adding book...', 'info');
        
        try {
            await addBook({
                title: bookName,
                author: author,
                category_id: categoryId,
                published_date: publishedDate,
                description: description
            }, coverFile);
            
            showMessage('Book added successfully!', 'success');
            addBookForm.reset();
        } catch (error) {
            console.error('Error adding book:', error);
            showMessage(error.message || 'Failed to add book. Please try again.', 'error');
        }
    });

    // Function to add a book via API
    async function addBook(bookData, coverFile) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication required. Please log in.');
        }
        
        const formData = new FormData();
        formData.append('title', bookData.title);
        formData.append('author', bookData.author);
        formData.append('description', bookData.description);
        formData.append('published_date', bookData.published_date);
        formData.append('number_of_copies', 1);
        formData.append('cover', coverFile);
        
        // Add category
        formData.append('categories', [bookData.category_id]);
        
        const response = await fetch(`${API_BASE_URL}/admin/books/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            let errorMessage = 'Failed to add book';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.detail || Object.values(errorData).flat().join(', ') || errorMessage;
            } catch (e) {
                // If JSON parsing fails, use status text
                errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        return await response.json();
    }

    // Helper function to show messages
    function showMessage(text, type = 'info') {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }

    // Helper function to clear messages
    function clearMessage() {
        messageDiv.textContent = '';
        messageDiv.style.display = 'none';
    }
});
