const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Fetch all books from the backend API
async function getBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/library/`);
        if (!response.ok) throw new Error('Failed to fetch books');
        const booksArray = await response.json();
        const books = {};
        for (const book of booksArray) {
            books[book.id] = book;
        }
        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
}

// Update a book in the backend API
async function updateBook(bookId, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/library/${bookId}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update book');
        return await response.json();
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
}

// Search books
async function searchBooks(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/library/search/?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to search books');
        return await response.json();
    } catch (error) {
        console.error('Error searching books:', error);
        throw error;
    }
}

window.bookManager = {
    getBooks,
    updateBook,
    searchBooks
};

const bookListContainer = document.querySelector('.book-list');

async function renderBooksFromAPI() {
    try {
        const books = await bookManager.getBooks();

        if (bookListContainer) {
            bookListContainer.innerHTML = '';

            for (const bookId in books) {
                const book = books[bookId];
                const bookHTML = `
                    <div class="book-card">
                        <img src="${book.cover}" alt="${book.title}">
                        <h3>${book.title}</h3>
                        <p>${book.author}</p>
                        <p>${book.description}</p>
                    </div>
                `;
                bookListContainer.innerHTML += bookHTML;
            }
        }
    } catch (err) {
        console.error('Error loading books:', err);
    }
}

const bookContainer = document.querySelector('.book-detail-container');

if (bookContainer) {
    document.addEventListener('DOMContentLoaded', async () => {
        const bookId = getBookIdFromURL();
        try {
            const books = await getBooks();
            const book = books[bookId];

            if (!book) {
                redirectToLibrary();
                return;
            }

            renderBookPage(book);
            setupEventListeners(bookId);
        } catch (error) {
            console.error('Error loading book details:', error);
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

function renderBookPage(book) {
    document.title = `${book.title} - Ubrary`;

    const isUserPage = document.referrer.includes('userPage.html');

    bookContainer.innerHTML = `
        <div class="book-cover">
            <img src="${book.cover}" alt="${book.title}">
            ${isUserPage ? `
                <div class="book-actions">
                    <button class="borrow-button" id="borrowBtn" ${book.borrowed ? 'disabled' : ''}>
                        ${book.borrowed ? 'Borrowed' : 'Borrow'}
                    </button>
                    <button class="favorite-button" id="favoriteBtn">
                        ${book.favorite ? '★ Favorited' : '☆ Add to Favorites'}
                    </button>
                </div>
            ` : ''}
        </div>
        <div class="book-info">
            <div class="book-meta">
                <span class="book-id">ID: ${book.id}</span>
                <h1 class="book-title">${book.title}</h1>
                <span class="book-author">By ${book.author}</span>
                <span class="book-category">${book.category}</span>
            </div>
            <div class="book-description">
                <h3>Description</h3>
                <p>${book.description}</p>
            </div>
        </div>
    `;
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

async function handleBorrow(bookId) {
    try {
        const books = await getBooks();
        const book = books[bookId];
        
        if (book.borrowed) {
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/library/${bookId}/borrow/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Failed to borrow book');
        
        const borrowBtn = document.getElementById('borrowBtn');
        if (borrowBtn) {
            borrowBtn.disabled = true;
            borrowBtn.textContent = 'Borrowed';
        }
        alert('Book borrowed successfully!');
    } catch (error) {
        console.error('Error borrowing book:', error);
        alert('Failed to borrow book. Please try again.');
    }
}

async function handleFavorite(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/library/${bookId}/favorite/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Failed to update favorite status');
        
        const updatedBook = await response.json();
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            favoriteBtn.textContent = updatedBook.favorite ? '★ Favorited' : '☆ Add to Favorites';
            favoriteBtn.classList.toggle('favorited', updatedBook.favorite);
        }
    } catch (error) {
        console.error('Error updating favorite status:', error);
        alert('Failed to update favorite status. Please try again.');
    }
}

window.renderBooksFromAPI = renderBooksFromAPI;

