// deleteBook.js - API-integrated version
document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'http://127.0.0.1:8000/api';
    const deleteForm = document.getElementById('deleteForm');
    const bookIdInput = document.getElementById('bookId');
    const messageDiv = document.getElementById('message');
    const idListDiv = document.getElementById('idList');

    // Initialize page
    initializePage();

    // Initialize the page with available book IDs
    async function initializePage() {
        try {
            await updateAvailableIds();
            console.log("Delete page ready. Loaded available books from API.");
        } catch (error) {
            console.error("Initialization error:", error);
            showMessage("Failed to initialize page. Please refresh or check your connection.", "error");
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

    // Update available IDs list
    async function updateAvailableIds() {
        if (!verifyAuthentication()) return;
        
        try {
            const books = await getBooks();
            if (books && books.length > 0) {
                const availableIds = books.map(book => book.id);
                idListDiv.textContent = `Available IDs: ${availableIds.join(', ') || 'None'}`;
            } else {
                idListDiv.textContent = 'No books available';
            }
        } catch (error) {
            console.error("Error updating available IDs:", error);
            idListDiv.textContent = 'Error loading book IDs';
        }
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
            throw error;
        }
    }

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

    // Delete a book via API
    async function deleteBookById(bookId) {
        if (!verifyAuthentication()) return false;
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/admin/books/${bookId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            
            if (!response.ok) {
                let errorMessage = 'Failed to delete book';
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
            
            // For successful deletion, the response might be empty (204 No Content)
            // or contain a success message
            return true;
        } catch (error) {
            console.error('Error deleting book:', error);
            throw error;
        }
    }

    // Form submission handler
    deleteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        messageDiv.textContent = '';
        messageDiv.className = 'message';
        
        if (!verifyAuthentication()) return;
        
        const bookId = bookIdInput.value.trim();
        
        // Validate ID format
        if (!bookId) {
            messageDiv.textContent = 'Please enter a book ID!';
            messageDiv.className = 'message error';
            return;
        }

        // Show loading state
        messageDiv.textContent = 'Checking book...';
        messageDiv.className = 'message info';
        
        try {
            // Get book details for confirmation
            const book = await getBookById(bookId);
            
            if (!book) {
                messageDiv.textContent = `Book ${bookId} not found!`;
                messageDiv.className = 'message error';
                await updateAvailableIds(); // Refresh available IDs
                return;
            }

            // Confirmation dialog
            if (!confirm(`Delete permanently?\n\n${book.title}\nby ${book.author}`)) {
                messageDiv.textContent = 'Deletion cancelled.';
                messageDiv.className = 'message info';
                return;
            }

            // Show deleting state
            messageDiv.textContent = 'Deleting book...';
            messageDiv.className = 'message info';
            
            // Delete the book
            await deleteBookById(bookId);
            
            // Show success message
            messageDiv.textContent = `Deleted: ${book.title} (ID: ${bookId})`;
            messageDiv.className = 'message success';
            
            // Clear input and update available IDs
            bookIdInput.value = '';
            await updateAvailableIds();
            
        } catch (error) {
            console.error("Delete failed:", error);
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.className = 'message error';
        }
    });

    // Helper function to show messages
    function showMessage(text, type = 'info') {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
    }

    // Auto-format input (optional)
    bookIdInput.addEventListener('input', function() {
        this.value = this.value.trim();
    });
});
