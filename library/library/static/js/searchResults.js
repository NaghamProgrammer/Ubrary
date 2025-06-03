// searchResults.js
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('q') || '';
        
        const searchResults = await window.bookManager.searchBooks(searchTerm);
        
        const resultsContainer = document.getElementById('search-results');
        const resultsHeader = document.getElementById('results-header');
        
        if (searchResults.length === 0) {
            resultsHeader.textContent = "No Results Found!";
            resultsContainer.innerHTML = '<p class="no-results">No books found matching your search.</p>';
            return;
        }
        
        resultsHeader.textContent = `Found ${searchResults.length} Book${searchResults.length > 1 ? 's' : ''}:`;
        
        resultsContainer.innerHTML = searchResults.map(book => `
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
        
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.value = searchTerm;
            searchInput.addEventListener('keypress', async function(e) {
                if (e.key === 'Enter' && this.value.trim() !== '') {
                    try {
                        const newSearchResults = await window.bookManager.searchBooks(this.value.trim());
                        resultsContainer.innerHTML = '';
                        
                        if (newSearchResults.length === 0) {
                            resultsHeader.textContent = "No Results Found!";
                            resultsContainer.innerHTML = '<p class="no-results">No books found matching your search.</p>';
                            return;
                        }
                        
                        resultsHeader.textContent = `Found ${newSearchResults.length} Book${newSearchResults.length > 1 ? 's' : ''}:`;
                        
                        resultsContainer.innerHTML = newSearchResults.map(book => `
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
                    } catch (error) {
                        console.error('Error searching books:', error);
                        alert('Failed to search books. Please try again.');
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading search results:', error);
        alert('Failed to load search results. Please try again.');
    }
});