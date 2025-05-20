// editAdmin.js - API-integrated version
document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'http://127.0.0.1:8000/api';
    
    // DOM Elements
    const searchBtn = document.querySelector('.search-btn');
    const bookIdInput = document.getElementById('searchId');
    const editForm = document.getElementById('editBookForm');
    const editableFields = document.getElementById('editableFields');
    const idHint = document.querySelector('.id-hint');
    const messageDiv = document.createElement('div');
    
    // Add message div for notifications
    messageDiv.className = 'message';
    editForm.parentNode.insertBefore(messageDiv, editForm.nextSibling);
    
    // Initialize the page with available book IDs
    initializePage();
    
    // Load categories when page loads
    loadCategories();

    // Initialize the page with available book IDs
    async function initializePage() {
        try {
            const books = await getBooks();
            if (books && books.length > 0) {
                const availableIds = books.map(book => book.id);
                idHint.textContent = `Available IDs: ${availableIds.join(', ') || 'None'}`;
            } else {
                idHint.textContent = 'No books available in library';
            }
        } catch (error) {
            console.error('Error initializing page:', error);
            showMessage('Failed to load book data. Please check your connection.', 'error');
        }
    }

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

    // Verify authentication
    function verifyAuthentication() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showMessage('Authentication required. Please log in.', 'error');
            return false;
        }
        return true;
    }

    // Get all books from API
    async function getBooks() {
        if (!verifyAuthentication()) return null;
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/admin/books/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching books:', error);
            showMessage('Failed to fetch books. Please try again.', 'error');
            return null;
        }
    }

    // Search for a book by ID
    searchBtn.addEventListener('click', async function() {
        clearMessage();
        
        if (!verifyAuthentication()) return;
        
        const bookId = bookIdInput.value.trim();
        
        if (!bookId) {
            showMessage('Please enter a book ID', 'error');
            return;
        }
        
        showMessage('Searching...', 'info');
        
        try {
            const book = await getBookById(bookId);
            
            if (book) {
                // Populate form with book data
                populateForm(book);
                
                // Show editable fields with smooth transition
                editableFields.style.display = 'block';
                setTimeout(() => editableFields.style.opacity = 1, 10);
                
                clearMessage();
            } else {
                showBookNotFoundError(bookId);
            }
        } catch (error) {
            console.error('Search error:', error);
            showMessage(error.message || 'Error searching for book', 'error');
        }
    });

    // Get a book by ID from API
    async function getBookById(bookId) {
        if (!verifyAuthentication()) return null;
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/admin/books/${bookId}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 404) {
                return null;
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch book: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching book:', error);
            throw error;
        }
    }

    // Populate form with book data
    function populateForm(book) {
        document.getElementById('bookName').value = book.title || '';
        document.getElementById('author').value = book.author || '';
        
        // Handle category selection
        const categorySelect = document.getElementById('category');
        if (book.categories && book.categories.length > 0) {
            categorySelect.value = book.categories[0];
        } else {
            categorySelect.value = '';
        }
        
        document.getElementById('publishedDate').value = book.published_date || '';
        document.getElementById('description').value = book.description || '';
    }

    // Show error when book not found
    async function showBookNotFoundError(bookId) {
        try {
            const books = await getBooks();
            const availableIds = books ? books.map(book => book.id) : [];
            showMessage(`Book ${bookId} not found!\n\nAvailable books:\n${availableIds.join(', ') || 'None'}`, 'error');
            
            // Update available IDs hint
            idHint.textContent = `Available IDs: ${availableIds.join(', ') || 'None'}`;
        } catch (error) {
            console.error('Error showing not found message:', error);
            showMessage('Book not found and failed to retrieve available books.', 'error');
        }
    }

    // Handle form submission
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearMessage();
        
        if (!verifyAuthentication()) return;
        
        const bookId = bookIdInput.value.trim();
        if (!bookId) {
            showMessage('Please enter a book ID', 'error');
            return;
        }

        // Validate required fields
        if (!validateRequiredFields()) {
            return;
        }

        showMessage('Updating book...', 'info');
        
        try {
            // Get current book data to ensure we have the complete object
            const currentBook = await getBookById(bookId);
            if (!currentBook) {
                showMessage('Book not found. Please search first.', 'error');
                return;
            }
            
            // Prepare updated data
            const updatedData = {
                title: document.getElementById('bookName').value.trim(),
                author: document.getElementById('author').value.trim(),
                categories: [document.getElementById('category').value],
                published_date: document.getElementById('publishedDate').value,
                description: document.getElementById('description').value.trim(),
                // Preserve other fields from current book
                number_of_copies: currentBook.number_of_copies
            };
            
            // Update book
            await updateBook(bookId, updatedData);
            
            showMessage(`"${updatedData.title}" (ID: ${bookId}) updated successfully!`, 'success');
            
            // Optional: redirect to admin page after short delay
            setTimeout(() => {
                window.location.href = 'adminPage.html';
            }, 2000);
            
        } catch (error) {
            console.error('Update error:', error);
            showMessage(error.message || 'Failed to update book. Please try again.', 'error');
        }
    });

    // Validate required fields
    function validateRequiredFields() {
        const title = document.getElementById('bookName').value.trim();
        const author = document.getElementById('author').value.trim();
        const category = document.getElementById('category').value;
        
        if (!title) {
            showMessage('Please enter a title', 'error');
            return false;
        }
        if (!author) {
            showMessage('Please enter an author', 'error');
            return false;
        }
        if (!category) {
            showMessage('Please select a category', 'error');
            return false;
        }
        return true;
    }

    // Update book via API
    async function updateBook(bookId, bookData) {
        if (!verifyAuthentication()) return null;
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/admin/books/${bookId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });
            
            if (!response.ok) {
                let errorMessage = 'Failed to update book';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.detail || 
                                  Object.values(errorData).flat().join(', ') || 
                                  errorMessage;
                } catch (e) {
                    // If JSON parsing fails, use status text
                    errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating book:', error);
            throw error;
        }
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

    // Auto-format book ID input (optional)
    bookIdInput.addEventListener('input', function() {
        this.value = this.value.trim();
    });
});
