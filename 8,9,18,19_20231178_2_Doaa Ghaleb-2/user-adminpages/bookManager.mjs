import { currentBorrowedBooks, favouriteBooks } from "./bookCollection.mjs";

fetch('http://127.0.0.1:8000/api/library/')
  .then(res => res.json())
  .then(books => {
    
const defaultBooks = {
    BK001: {
        id: 'BK001',
        title: 'MOBY DICK',
        author: 'HERMAN MELVILLE',
        category: 'Fiction',
        cover: 'moby dick.png',
        description: 'Moby-Dick is an 1851 novel by Herman Melville...',
        borrowed: false,
        favorite: false
    },
    BK002: {
        id: 'BK002',
        title: 'Pride and Prejudice',
        author: 'JANE AUSTEN',
        category: 'Fiction',
        cover: 'pride and prejudice.png',
        description: 'The romantic and witty story of Elizabeth Bennet...',
        borrowed: false,
        favorite: false
    },
    BK003: {
        id: 'BK003',
        title: 'To the Lighthouse',
        author: 'VIRGINIA WOOLF',
        category: 'Philosophy',
        cover: 'to the lighthause.png',
        description: 'A groundbreaking stream-of-consciousness novel...',
        borrowed: true,
        favorite: false
    },
    BK004: {
        id: 'BK004',
        title: '1984',
        author: 'GEORGE ORWELL',
        category: 'Science',
        cover: '1984.png',
        description: 'Orwell\'s harrowing vision of a totalitarian future...',
        borrowed: true,
        favorite: false
    },
    BK005: {
        id: 'BK005',
        title: 'THE TRIAL',
        author: 'FRANZ KAFKA',
        category: 'Philosophy',
        cover: 'the trial.png',
        description: 'Kafka\'s unsettling masterpiece follows Josef K....',
        borrowed: false,
        favorite: false
    }
};
  });

// Fetch all books from the backend API
async function getBooks() {
    const response = await fetch('http://127.0.0.1:8000/api/library/');
    if (!response.ok) throw new Error('Failed to fetch books');
    // Assuming the API returns an array of books, convert to object with id as key
    const booksArray = await response.json();
    const books = {};
    for (const book of booksArray) {
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

function handleBorrow(bookId) {
    const books = getBooks();
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
    updateBook(bookId, book);
    
    // Update button state only after successful borrow
    const borrowBtn = document.getElementById('borrowBtn');
    if (borrowBtn) {
        borrowBtn.disabled = true;
        borrowBtn.textContent = 'Borrowed';
    }
    alert('Book borrowed successfully!');
}

function handleFavorite(bookId) {
    const books = getBooks();
    const book = books[bookId];
    book.favorite = !book.favorite;
    updateBook(bookId, book);
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (book.favorite) favouriteBooks.append(book);
    if (favoriteBtn) {
        favoriteBtn.textContent = book.favorite ? '★ Favorited' : '☆ Add to Favorites';
        favoriteBtn.classList.toggle('favorited', book.favorite);
    }
}
