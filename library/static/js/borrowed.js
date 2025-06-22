document.addEventListener('DOMContentLoaded', () => {
    const currentBooksContainer = document.getElementById("current-books");
    const previousBooksContainer = document.getElementById("previous-books");

    loadBorrowedBooks();

    async function loadBorrowedBooks() {
        try {
            const borrowedBooks = await ApiService.getBorrowedBooks();
            renderBorrowedBooks(borrowedBooks);
        } catch (error) {
            console.error('Error loading borrowed books:', error);
            showError(`Failed to load borrowed books: ${error.message}`);
        }
    }

    function renderBorrowedBooks(books) {
        if (books.length === 0) {
            currentBooksContainer.innerHTML = '<p>No borrowed books yet.</p>';
            previousBooksContainer.innerHTML = '';
            return;
        }

        // Separate current and previous books
        const currentBooks = books.filter(book => !book.returned);
        const previousBooks = books.filter(book => book.returned);

        // Render current books
        if (currentBooks.length === 0) {
            currentBooksContainer.innerHTML = '<p>No currently borrowed books.</p>';
        } else {
            currentBooksContainer.innerHTML = currentBooks.map(book => `
                <div class="books-card">
                    <img src="${book.cover_url || 'book-cover-placeholder.png'}" alt="Book-cover">
                    <div class="Book-info">
                        <h3 class="title">${book.title || 'Unknown Title'}</h3>
                        <p class="author">${book.author || 'Unknown Author'}</p>
                        <p class="borrow-date">Borrowed on: ${book.borrow_date}</p>
                        <button class="return-button" data-book-id="${book.book_id}">Return Book</button>
                    </div>
                </div>
            `).join('');
        }

        // Render previous books
        if (previousBooks.length === 0) {
            previousBooksContainer.innerHTML = '<p>No previously borrowed books.</p>';
        } else {
            previousBooksContainer.innerHTML = previousBooks.map(book => `
                <div class="books-card">
                    <img src="${book.cover_url || 'book-cover-placeholder.png'}" alt="Book-cover">
                    <div class="Book-info">
                        <h3 class="title">${book.title || 'Unknown Title'}</h3>
                        <p class="author">${book.author || 'Unknown Author'}</p>
                        <p class="borrow-date">Borrowed on: ${book.borrow_date}</p>
                        <p class="returned">Returned on: ${book.return_date}</p>
                    </div>
                </div>
            `).join('');
        }

        // Add event listeners to return buttons
        document.querySelectorAll('.return-button').forEach(button => {
            button.addEventListener('click', async function () {
                const bookId = this.getAttribute('data-book-id');
                try {
                    await ApiService.returnBorrowedBook(bookId);
                    loadBorrowedBooks();
                } catch (error) {
                    console.error('Error returning book:', error);
                    showError(`Failed to return book: ${error.message}`);
                }
            });
        });
    }

    function showError(message) {
        alert(message);
    }
});