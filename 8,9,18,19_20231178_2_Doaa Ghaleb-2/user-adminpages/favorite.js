import { favouriteBooks } from "./bookCollection.mjs";


function constructBookTemplate(bookImgLink, title, author, index) {
    return (
        `<div class="books-card">
            <img src="${bookImgLink || 'book-cover-placeholder.png'}" alt="Book-cover">
            <div class="Book-info">
                <h3 class="title">${title}</h3>
                <p class="auoName">${author}</p>
                <button class="remove-fav-button">🗑 Remove from Favourites</button>
            </div>
        </div>`
    );
}

function renderBooks(bookArr) {
    const renderedFavBooks = bookArr
        .map((book, i) => constructBookTemplate(book.cover, book.title, book.author, i))
        .join('');
    document.getElementById("fav-books").innerHTML = renderedFavBooks;

    const buttons = document.querySelectorAll(".remove-fav-button");
    buttons.forEach((btn, idx) => {
        btn.addEventListener("click", () => removeFromFavourites(idx));
    });
}
renderBooks(favouriteBooks.read());

function removeFromFavourites(index) {
    const favBooks = favouriteBooks.read();
    const removedBook = favBooks[index];
    
    window.bookManager.updateBook(removedBook.id, { favorite: false });
    favouriteBooks.remove(index);
    renderBooks(favouriteBooks.read());
}