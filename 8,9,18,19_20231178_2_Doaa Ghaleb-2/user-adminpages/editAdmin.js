document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchBtn = document.querySelector('.search-btn');
    const bookIdInput = document.getElementById('searchId');
    const editForm = document.getElementById('editBookForm');
    const editableFields = document.getElementById('editableFields');
    const idHint = document.querySelector('.id-hint');

    // Initialize the page with available book IDs
    function initializePage() {
        const books = getBooks();
        if (books) {
            const availableIds = Object.keys(books);
            idHint.textContent = `Available IDs: ${availableIds.join(', ') || 'None'}`;
        } else {
            idHint.textContent = 'No books available in library';
        }
    }

    // Verify books exist in localStorage
    function verifyBooksExist() {
        const books = getBooks();
        if (!books || Object.keys(books).length === 0) {
            alert("No books found in storage!\n\nPlease add books first.");
            console.error("Books missing in localStorage:", localStorage.getItem('books'));
            return false;
        }
        return true;
    }

    // Safe book loading from localStorage
    function getBooks() {
        try {
            const booksJson = localStorage.getItem('books');
            return booksJson ? JSON.parse(booksJson) : null;
        } catch (e) {
            console.error("Failed to parse books:", e);
            return null;
        }
    }

    // Search for a book by ID
    searchBtn.addEventListener('click', function() {
        if (!verifyBooksExist()) return;

        const rawId = bookIdInput.value.trim();
        const bookId = rawId.toUpperCase();

        if (!bookId) {
            alert("Please enter a book ID");
            return;
        }

        const books = getBooks();
        console.log("Searching for book:", bookId, "in:", books);

        if (books && books[bookId]) {
            // Populate form with book data
            populateForm(books[bookId]);
            
            // Show editable fields with smooth transition
            editableFields.style.display = 'block';
            setTimeout(() => editableFields.style.opacity = 1, 10);
            
            // Update available IDs hint
            updateAvailableIdsHint();
        } else {
            showBookNotFoundError(bookId);
        }
    });

    // Populate form with book data
    function populateForm(book) {
        document.getElementById('bookName').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('category').value = book.category.toLowerCase();
        document.getElementById('publishedDate').value = book.publishedDate || '';
        document.getElementById('description').value = book.description || '';
    }

    // Update the available IDs hint
    function updateAvailableIdsHint() {
        const books = getBooks();
        if (books) {
            const availableIds = Object.keys(books);
            idHint.textContent = `Available IDs: ${availableIds.join(', ') || 'None'}`;
        }
    }

    // Show error when book not found
    function showBookNotFoundError(bookId) {
        const books = getBooks();
        const availableIds = books ? Object.keys(books) : [];
        alert(`Book ${bookId} not found!\n\nAvailable books:\n${availableIds.join(', ') || 'None'}`);
        updateAvailableIdsHint();
    }

    // Handle form submission
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const bookId = bookIdInput.value.trim().toUpperCase();
        if (!bookId) {
            alert("Please enter a book ID");
            return;
        }

        const books = getBooks();
        if (!books || !books[bookId]) {
            alert("Book not found. Please search first.");
            return;
        }

        // Validate required fields
        if (!validateRequiredFields()) {
            return;
        }

        // Update book data
        updateBook(bookId, books);
    });

    // Validate required fields
    function validateRequiredFields() {
        const title = document.getElementById('bookName').value.trim();
        const author = document.getElementById('author').value.trim();
        const category = document.getElementById('category').value;
        
        if (!title) {
            alert("Please enter a title");
            return false;
        }
        if (!author) {
            alert("Please enter an author");
            return false;
        }
        if (!category) {
            alert("Please select a category");
            return false;
        }
        return true;
    }

    // Update book in localStorage
    function updateBook(bookId, books) {
        const updatedBook = {
            ...books[bookId], // Keep existing data
            title: document.getElementById('bookName').value.trim(),
            author: document.getElementById('author').value.trim(),
            category: document.getElementById('category').value,
            publishedDate: document.getElementById('publishedDate').value,
            description: document.getElementById('description').value.trim()
        };

        try {
            localStorage.setItem('books', JSON.stringify({
                ...books,
                [bookId]: updatedBook
            }));
            alert(`"${updatedBook.title}" (${bookId}) updated successfully!`);
            window.location.href = 'adminPage.html'; // Redirect to admin page
        } catch (e) {
            console.error("Update failed:", e);
            alert("Failed to save changes. Check console.");
        }
    }

    // Auto-format book ID input
    bookIdInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
    });

    // Initialize the page
    initializePage();
});
