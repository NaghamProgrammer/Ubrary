import { currentBorrowedBooks,previousBooks } from "./bookCollection.mjs";


function constructBookTemplate(bookImgLink, dateField, title, author,returnButton){
    return (
        `<div class="books-card">
            <img src="${bookImgLink || 'book-cover-placeholder.png'}" alt="Book-cover">
            <div class="Book-info">
                ${dateField}
                ${returnButton}
                <h3 class="title">${title}</h3>
                <p class="auoName">${author}</p>
            </div>
        </div>` 
    )
}

function constructDateField(dueDate, isReturned=false){
    const today = new Date();
    dueDate = new Date(dueDate);

    if(isReturned){
        return `<span class="past-status">Returned on ${dueDate.toLocaleDateString()}</span>`
    }

    const diff = dueDate - today;
    const daysLeft = Math.ceil(diff / (1000*60*60*24));

    let txt = '', color = '';
    if(daysLeft > 0){
        txt = `Returns in ${daysLeft} day${daysLeft > 1 ? "s":""}`;
        color = 'green'
    }
    else if (daysLeft === 0){
        txt = "DUE TODAY ⚠️";
        color = "orange";
    }
    else{
        txt = `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? "s":""} !`;
        color = "red";
    }
    return `<span style="color:${color}"  class="status">${txt}</span>`
}


function renderedBooks(bookArray, containerId, isReturned = false) {
    const renderedBooks = bookArray
    .map((book, index) => {
        const remainingDate = constructDateField(book.returnDate, isReturned);
        
        const returnButton = !isReturned ? `<button class="return-btn" data-index="${index}">Return</button>` : '';
        
        const bookCard = constructBookTemplate(book.cover, remainingDate, book.title, book.author,returnButton);
        return bookCard;
    })
    .join('');
    document.getElementById(containerId).innerHTML = renderedBooks;
    
    if (!isReturned) {
        const returnButtons = document.querySelectorAll('.return-btn');
        returnButtons.forEach(button => {
            button.addEventListener('click', handleReturnClick);
        });
    }
    
};

function handleReturnClick(event) {
    const button = event.target;
    const index = parseInt(button.getAttribute('data-index'));

    const currentBooks = currentBorrowedBooks.read();
    const returnedBook = currentBooks[index];

    // Remove from currently borrowed
    currentBorrowedBooks.remove(index);

    // Update main book storage (set borrowed: false)
    window.bookManager.updateBook(returnedBook.id, { borrowed: false });

    // Add to previously borrowed with today's date
    previousBooks.append({
        ...returnedBook,
        returnDate: new Date()
    });

    // Re-render both lists
    renderedBooks(currentBorrowedBooks.read(), "current-books");
    renderedBooks(previousBooks.read(), "previous-books", true);

    // Update borrow limit message
    const remaining = 6 - currentBorrowedBooks.read().length;
    document.getElementsByClassName('borrow-limit')[0].innerHTML =
        `You can borrow ${remaining} more title${remaining !== 1 ? 's' : ''} this month`;
}


renderedBooks(currentBorrowedBooks.read(), "current-books");
renderedBooks(previousBooks.read(), "previous-books", true);

const maxBorrowLimit = 6;
const remaining = maxBorrowLimit - currentBorrowedBooks.read().length;
document.getElementsByClassName('borrow-limit')[0].innerHTML = `You can borrow ${remaining} more title${remaining !== 1 ? 's' : ''} this month`;
