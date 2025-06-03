import { currentBorrowedBooks, favouriteBooks } from "./bookCollection.js";

// Fetch all books from the backend API
async function getBooks() {
    const response = await fetch('http://127.0.0.1:8000/api/library/');
    if (!response.ok) throw new Error('Failed to fetch books');
    const booksArray = await response.json();
    const books = {};
    for (const book of booksArray) {
        // Convert the cover path to use the media URL
        if (book.cover) {
            book.cover = `http://127.0.0.1:8000/media/book_covers/${book.cover}`;
        }
        books[book.id] = book;
    }
    return books;
}

// Update a book in the backend API
async function updateBook(bookId, updates) {
    const response = await fetch(`http://127.0.0.1:8000/api/library/${bookId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update book');
    return await response.json();
}

window.bookManager = {
    getBooks,
    updateBook
};

const bookListContainer = document.querySelector('.book-list');

async function renderBooksFromAPI() {
    try {
        const books = await bookManager.getBooks();

        if (bookListContainer) {
            bookListContainer.innerHTML = ''; // Clear old books

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
        const books = await getBooks();
        const book = books[bookId];

        if (!book) {
            redirectToLibrary();
            return;
        }

        renderBookPage(book);
        setupEventListeners(bookId);
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

    // Check if the referrer is the user page
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
        
        // If book is already borrowed, do nothing
        if (book.borrowed) {
            return;
        }
        
        // Check borrowing limit
        if (currentBorrowedBooks.read().length >= 6) {
            alert('Can not borrow more items. Please return some books to borrow again!');
            return;
        }
        
        // Proceed with borrowing
        book.returnDate = new Date();
        book.returnDate.setDate(book.returnDate.getDate() + 30);
        currentBorrowedBooks.append(book);
        book.borrowed = true;
        await updateBook(bookId, book);
        
        // Update button state only after successful borrow
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
        const books = await getBooks();
        const book = books[bookId];
        book.favorite = !book.favorite;
        await updateBook(bookId, book);
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (book.favorite) favouriteBooks.append(book);
        if (favoriteBtn) {
            favoriteBtn.textContent = book.favorite ? '★ Favorited' : '☆ Add to Favorites';
            favoriteBtn.classList.toggle('favorited', book.favorite);
        }
    } catch (error) {
        console.error('Error updating favorite status:', error);
        alert('Failed to update favorite status. Please try again.');
    }
}

window.renderBooksFromAPI = renderBooksFromAPI;

