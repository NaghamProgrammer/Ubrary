document.addEventListener('DOMContentLoaded', () => {
    const favBooksContainer = document.getElementById("fav-books");

    loadFavoriteBooks();

    async function loadFavoriteBooks() {
        try {
            const favoriteBooks = await ApiService.getFavoriteBooks();
            renderFavoriteBooks(favoriteBooks);
        } catch (error) {
            console.error('Error loading favorite books:', error);
            showError('Failed to load favorite books. Please try again later.');
        }
    }

    function renderFavoriteBooks(books) {
        if (books.length === 0) {
            favBooksContainer.innerHTML = '<p>No favorite books yet.</p>';
            return;
        }

        const renderedBooks = books.map(book => `
            <div class="books-card">
                <img src="${book.book_cover_url || 'book-cover-placeholder.png'}" alt="Book-cover">
                <div class="Book-info">
                    <h3 class="title">${book.book_title || 'Unknown Title'}</h3>
                    <p class="author">${book.book_author || 'Unknown Author'}</p>
                    <button class="remove-fav-button" data-book-id="${book.book_id}">🗑 Remove from Favourites</button>
                </div>
            </div>
        `).join('');

        favBooksContainer.innerHTML = renderedBooks;

        document.querySelectorAll('.remove-fav-button').forEach(button => {
            button.addEventListener('click', async function () {
                const bookId = this.getAttribute('data-book-id');
                try {
                    await ApiService.removeFavoriteBook(bookId);
                    loadFavoriteBooks();
                } catch (error) {
                    console.error('Error removing from favorites:', error);
                    showError('Failed to remove from favorites. Please try again later.');
                }
            });
        });
    }

    function showError(message) {
        alert(message);
    }
});
