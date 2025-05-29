// deleteBook.js - Dynamic LocalStorage Solution
document.addEventListener('DOMContentLoaded', function() {
    const deleteForm = document.getElementById('deleteForm');
    const bookIdInput = document.getElementById('bookId');
    const messageDiv = document.getElementById('message');
    const idListDiv = document.getElementById('idList');

    // 1. BOOK MANAGER FUNCTIONS
    const BookManager = {
        getBooks: () => {
            try {
                const books = localStorage.getItem('books');
                return books ? JSON.parse(books) : {};
            } catch (e) {
                console.error("Error loading books:", e);
                return {};
            }
        },
        
        deleteBook: (id) => {
            const books = BookManager.getBooks();
            if (!books[id]) {
                throw new Error(`Book ${id} not found`);
            }
            
            delete books[id];
            localStorage.setItem('books', JSON.stringify(books));
            return id;
        }
    };

    // 2. INITIALIZE PAGE
    function updateAvailableIds() {
        const books = BookManager.getBooks();
        const availableIds = Object.keys(books);
        idListDiv.textContent = `Available IDs: ${availableIds.join(', ') || 'None'}`;
    }

    // 3. FORM SUBMISSION
    deleteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        messageDiv.textContent = '';
        messageDiv.className = 'message';
        
        const bookId = bookIdInput.value.trim().toUpperCase();
        
        // Validate ID format - now accepts any non-empty ID
        if (!bookId) {
            messageDiv.textContent = 'Please enter a book ID!';
            messageDiv.className = 'message error';
            return;
        }

        const books = BookManager.getBooks();
        if (!books[bookId]) {
            messageDiv.textContent = `Book ${bookId} not found!`;
            messageDiv.className = 'message error';
            return;
        }

        // Confirmation dialog
        const book = books[bookId];
        if (!confirm(`Delete permanently?\n\n${book.title}\nby ${book.author}`)) {
            return;
        }

        try {
            BookManager.deleteBook(bookId);
            messageDiv.textContent = `Deleted: ${book.title} (${bookId})`;
            messageDiv.className = 'message success';
            bookIdInput.value = '';
            updateAvailableIds();
        } catch (error) {
            console.error("Delete failed:", error);
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.className = 'message error';
        }
    });

    // 4. AUTO-FORMAT INPUT
    bookIdInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
    });

    // Initialize
    updateAvailableIds();
    console.log("Delete page ready. Current books:", BookManager.getBooks());
}); 