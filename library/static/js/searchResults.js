// searchResults.js
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('q') || '';
        
        if (!searchTerm) {
            document.getElementById('results-header').textContent = "Please enter a search term";
            return;
        }

        const { count, results } = await ApiService.searchBooks(searchTerm);
        
        const resultsContainer = document.getElementById('search-results');
        const resultsHeader = document.getElementById('results-header');
        
        if (count === 0) {
            resultsHeader.textContent = "No Results Found!";
            resultsContainer.innerHTML = '<p class="no-results">No books found matching your search.</p>';
            return;
        }
        
        resultsHeader.textContent = `Found ${count} Book${count > 1 ? 's' : ''}:`;
        
        resultsContainer.innerHTML = results.map(book => `
            <a href="bookInfo.html?id=${book.id}" class="book-link">
                <div class="book">
                    <img src="${book.cover || '../static/images/placeholder.jpg'}" alt="${book.title}">
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
        
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.value = searchTerm;
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && this.value.trim() !== '') {
                    window.location.href = `searchResults.html?q=${encodeURIComponent(this.value.trim())}`;
                }
            });
        }
    } catch (error) {
        console.error('Error loading search results:', error);
        const resultsContainer = document.getElementById('search-results');
        const resultsHeader = document.getElementById('results-header');
        resultsHeader.textContent = "Error";
        resultsContainer.innerHTML = '<p class="error">Failed to load search results. Please try again.</p>';
    }
});