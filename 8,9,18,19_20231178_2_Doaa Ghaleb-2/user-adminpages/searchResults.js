// searchResults.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize books in Local Storage if not already present
    window.bookManager.initializeBooks();
    
    // Get book data from Local Storage
    const books = window.bookManager.getBooks();
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q')?.toLowerCase() || '';
    const resultsContainer = document.getElementById('search-results');
    const resultsHeader = document.getElementById('results-header');
    
    // Convert the books object to an array for filtering
    const bookArray = Object.entries(books).map(([id, book]) => ({ 
        ...book, 
        id 
    }));

    // Filter books based on search term
    const matchingBooks = bookArray.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.category.toLowerCase().includes(searchTerm)
    );

    // Display results or no results message
    if (matchingBooks.length === 0) {
        resultsHeader.textContent = "No Results Found!";
        resultsContainer.innerHTML = '<p class="no-results">No books found matching your search.</p>';
        return;
    }

    resultsHeader.textContent = `Found ${matchingBooks.length} Book${matchingBooks.length > 1 ? 's' : ''}:`;
    
    // Generate HTML for matching books
    resultsContainer.innerHTML = matchingBooks.map(book => `
        <a href="bookInfo.html?id=${book.id}" class="book-link">
            <div class="book">
                <img src="${book.cover}" alt="${book.title}">
                <div class="book-info">
                    <div class="title-author">
                        <span class="title">${book.title}</span>
                        <span class="author">${book.author}</span>
                    </div>
                    <span class="status ${book.borrowed ? 'borrowed' : 'available'}">
                        ${book.borrowed ? 'Borrowed' : 'Available'}
                    </span>
                </div>
            </div>
        </a>
    `).join('');

    // Search bar functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.value = urlParams.get('q') || '';
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                window.location.href = `searchResults.html?q=${encodeURIComponent(this.value)}`;
            }
        });
    }
});