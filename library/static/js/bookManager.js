// Remove mock data and localStorage usage
// import { currentBorrowedBooks, favouriteBooks } from "./bookCollection.js";

// Fetch all available books from the backend API using ApiService
async function getBooks() {
    const books = await ApiService.getBooks();
    // Ensure cover images are formatted for display
    if (Array.isArray(books)) {
        books.forEach(book => {
            if (book.cover && !book.cover.startsWith('data:image')) {
                book.cover = `data:image/jpeg;base64,${book.cover}`;
            }
        });
    }
    return books;
}

// Update a book in the backend API (if needed elsewhere)
async function updateBook(bookId, updates) {
    // Note: ApiService.updateBook might need adjustment for user vs admin updates
    // Assuming it works for now, or you'll address it later.
    return await ApiService.updateBook(bookId, updates);
}

window.bookManager = {
    getBooks,
    updateBook,
    // Expose getBookById for bookInfo.html
    getBookById: ApiService.getBookById
};

const bookListContainer = document.querySelector('.books-grid');

async function renderBooksFromAPI() {
  try {
    const books = await window.bookManager.getBooks(); // Use window.bookManager
    if (bookListContainer) {
      bookListContainer.innerHTML = '';
      // Convert the array of books to an object for consistent iteration
      const booksObject = {};
      if (Array.isArray(books)) { // Assuming API.getBooks returns array of objects
          books.forEach(book => { booksObject[book.id] = book; });
      } else if (books && typeof books === 'object') { // If the API happens to return an object
          Object.assign(booksObject, books);
      }

      for (const bookId in booksObject) {
        const book = booksObject[bookId];
        const bookHTML = `
            <a href="bookInfo.html?id=${book.id}" class="book-link">
                <div class="book">
                    <img src="${book.cover || '../static/images/placeholder.jpg'}" alt="${book.title}">
                    <div class="book-info">
                        <div class="title-author">
                            <span class="title">${book.title}</span>
                            <span class="author">${book.author}</span>
                        </div>
                        <!-- Always display "Available" for books from this endpoint -->
                        <span class="status available">
                            Available
                        </span>
                    </div>
                </div>
            </a>
        `;
        bookListContainer.insertAdjacentHTML('beforeend', bookHTML);
      }
    }
  } catch (err) {
    console.error('Error loading books:', err);
  }
}

// Call renderBooksFromAPI when the page loads
if (bookListContainer) {
    document.addEventListener('DOMContentLoaded', renderBooksFromAPI);
}

const bookContainer = document.querySelector('.book-detail-container');

if (bookContainer) {
    document.addEventListener('DOMContentLoaded', async () => {
        const bookId = getBookIdFromURL();
        
        try {
            // 1. Fetch basic book info
            const book = await ApiService.getBookById(bookId);
            if (!book) {
                redirectToLibrary();
                return;
            }

            // 2. Check if the user borrowed this book
            book.borrowed = await ApiService.checkIfBorrowed(bookId);

            await renderBookPage(book); // ✅ Wait for DOM to be rendered
            setupEventListeners(book.id); // ✅ Now elements are in the DOM

        } catch (error) {
            console.error('Error loading book:', error);
            bookContainer.innerHTML = '<p>Error loading book details.</p>';
        }
    });
}


function getBookIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function redirectToLibrary() {
    window.location.href = 'userPage.html';
}

async function renderBookPage(book) {
    try {
        document.title = `${book.title} - Ubrary`;

        // 1. Check if current user is admin (hide buttons if admin)
        let showButtons = true;
        let isFavorited = false;

        try {
            const user = await ApiService.getCurrentUser();
            if (user && user.is_admin) {
                showButtons = false; // Hide buttons for admin
            } else if (user) {
                // Only check favorites for non-admin users
                try {
                    isFavorited = await ApiService.checkIfFavorited(book.id);
                } catch (e) {
                    console.warn('Favorite check failed:', e);
                }
            }
        } catch (e) {
            console.warn("Couldn't fetch current user:", e);
            // If we can't check user status, default to showing buttons
            showButtons = true;
        }

        // 2. Render ALL book info, but conditionally show buttons
        bookContainer.innerHTML = `
            <div class="book-cover">
                <img src="${book.cover || '../static/images/placeholder.jpg'}" alt="${book.title}">
                ${showButtons ? `
                    <div class="book-actions">
                        <button class="borrow-button" id="borrowBtn" ${book.borrowed ? 'disabled' : ''}>
                            ${book.borrowed ? 'Borrowed' : 'Borrow'}
                        </button>
                        <button class="favorite-button ${isFavorited ? 'favorited' : ''}" id="favoriteBtn">
                            ${isFavorited ? '★ Favorited' : '☆ Add to Favorites'}
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="book-info">
                <div class="book-meta">
                    <span class="book-id">ID: ${book.id || 'N/A'}</span>
                    <h1 class="book-title">${book.title || 'Untitled Book'}</h1>
                    <span class="book-author">By ${book.author || 'Unknown Author'}</span>
                    <span class="book-category">
                        ${Array.isArray(book.categories) ? 
                          book.categories.map(cat => cat.name).join(', ') : 
                          (book.category || 'Uncategorized')}
                    </span>
                    <span class="book-copies"> Number of Available Copies: ${book.available_copies || book.number_of_copies} </span>
                </div>
                <div class="book-description">
                    <h3>Description</h3>
                    <p>${book.description || 'No description available.'}</p>
                </div>
            </div>
        `;

        // 3. Handle borrow button state if shown
        if (showButtons && book.borrowed) {
            const borrowBtn = document.getElementById('borrowBtn');
            if (borrowBtn) {
                borrowBtn.classList.add('disabled');
            }
        }

    } catch (error) {
        console.error('Error rendering book page:', error);
        bookContainer.innerHTML = `
            <div class="error-message">
                <h2>Error Loading Book</h2>
                <p>${error.message || 'Please try again later.'}</p>
            </div>
        `;
    }
}


function setupEventListeners(bookId) {
    const borrowBtn = document.getElementById('borrowBtn');
    const favoriteBtn = document.getElementById('favoriteBtn');

    if (borrowBtn) {
        borrowBtn.addEventListener('click', () => handleBorrow(bookId));
    }

    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => handleFavorite(bookId));
    }
}

// NOTE: handleBorrow and handleFavorite still use local data structures
// and potentially the old updateBook. These will need to be updated
// to use the API for full backend integration.

async function handleBorrow(bookId) {
    try {
        const borrowBtn = document.getElementById('borrowBtn');
        
        // Disable button during processing
        borrowBtn.disabled = true;
        borrowBtn.textContent = 'Processing...';
        
        // First check borrow limit
        const borrowedBooks = await ApiService.getBorrowedBooks();
        const currentBorrowedCount = borrowedBooks.filter(book => !book.returned).length;
        
        if (currentBorrowedCount >= 6) {
            borrowBtn.disabled = false;
            borrowBtn.textContent = 'Borrow';
            alert('You have reached your borrow limit (6 books). Please return some books before borrowing more.');
            return;
        }
        
        // Call API through ApiService
        await ApiService.borrowBook(bookId);

        // Update only the button state
        borrowBtn.disabled = true;
        borrowBtn.textContent = 'Borrowed';
        borrowBtn.classList.add('disabled');
        
    } catch (error) {
        console.error('Borrow error:', error);
        
        const borrowBtn = document.getElementById('borrowBtn');
        if (error.message.includes('already borrowed')) {
            borrowBtn.disabled = true;
            borrowBtn.textContent = 'Borrowed';
            borrowBtn.classList.add('disabled');
            alert('You have already borrowed this book.');
        } else {
            alert(`Failed to borrow book: ${error.message}`);
            borrowBtn.disabled = false;
            borrowBtn.textContent = 'Borrow';
            borrowBtn.classList.remove('disabled');
        }
    }
}

async function handleFavorite(bookId) {
    try {
        const favoriteBtn = document.getElementById('favoriteBtn');
        
        // Check if already favorited
        const isFavorited = await ApiService.checkIfFavorited(bookId);
        
        if (isFavorited) {
            // Remove from favorites
            await ApiService.removeFavoriteBook(bookId);
            favoriteBtn.textContent = '☆ Add to Favorites';
            favoriteBtn.classList.remove('favorited');
        } else {
            // Add to favorites
            await ApiService.addFavoriteBook(bookId);
            favoriteBtn.textContent = '★ Favorited';
            favoriteBtn.classList.add('favorited');
        }
    } catch (error) {
        console.error('Favorite error:', error);
        alert(`Failed to update favorites: ${error.message}`);
    }
}

// Expose bookManager globally if needed by other scripts
// window.bookManager = bookManager;

