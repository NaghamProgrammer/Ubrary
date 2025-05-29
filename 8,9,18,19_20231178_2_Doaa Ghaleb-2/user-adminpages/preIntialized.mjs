import { favouriteBooks,currentBorrowedBooks,previousBooks } from "./bookCollection.mjs";

if(currentBorrowedBooks.read().length === 0){
        [   
            {
            cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRazupqT3Jp9BGiKCadCahaqkBJ82q6x7lBhVR0YutAFA&s&ec=72940543',
            title: 'The Math Book',
            returnDate: new Date('2025-04-20'),
            author: 'by: Clifford A. Pickover'
            },
            {
            cover: 'https://i.ebayimg.com/images/g/LnMAAeSw7SNnsAKO/s-l960.webp',
            title: 'The End of Dreams ',
            returnDate: new Date('2025-04-17'),
            author: 'by: Marcus Lee'
            },
            {
            cover: 'https://book-assets.openroadmedia.com/9781504005555.jpg',
            title: 'Oliver Twist',
            returnDate: new Date('2025-05-15'),
            author: 'by: Charles Dickens'
            },
            {
            cover: 'https://book-assets.openroadmedia.com/9781504010771.jpg',
            title: 'Hard Times',
            returnDate: new Date('2025-05-20'), 
            author: 'by: Charles Dickens'
            }
        ].forEach((book)=>{
            currentBorrowedBooks.append(book);
        }
        );
}

if(favouriteBooks.read().length === 0){
        [
            {
                cover: 'https://covers.storytel.com/jpg-640/9781504048187.1109b6f3-3494-4a41-8fee-a70868f8265b?optimize=high&quality=70&width=600',
                title: 'Bleak House',
                author: 'by: Charles Dickens'
            },
            {
                cover: 'https://i.ebayimg.com/images/g/NLgAAOSw8lZfMNah/s-l960.webp',
                title: 'Pride and Prejudice', 
                author: 'by: Jane Austen'
            },
            {
                cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1307533333i/8618972.jpg',
                title: 'Agatha Christie Hour',
                author: 'by: Jane Austen'
            },
            {
                cover: 'https://m.media-amazon.com/images/I/51W2QbBhZBL._AC_UF1000,1000_QL80_.jpg',
                title: 'Macbeth',
                author: 'by: William Shakespeare '
            },
            {
                cover: 'https://cdn.kobo.com/book-images/2b2d51fd-3ee6-41a7-9d31-bc0b2e06bc80/1200/1200/False/king-lear-1.jpg',
                title: 'King Lear',
                author: 'by: William Shakespeare'
            },
            {
                cover: 'https://m.media-amazon.com/images/I/71o0Br93icL._AC_UF1000,1000_QL80_.jpg',
                title: 'The Red-Headed League ',
                author: 'by: Sir Arthur Conan Doyle'
            }
        ].forEach((book)=>{
            favouriteBooks.append(book);
        });
}

if (previousBooks.read().length === 0){
        [
            {
              cover: 'https://rukminim2.flixcart.com/image/850/1000/xif0q/book/e/x/4/the-48-laws-of-power-original-imah6zg5svq4833h.jpeg?q=20&crop=false',
              title: 'Power',
              returnDate: new Date('2024-12-05'), 
              author: 'by: Robert Greene'
            },
            {
              cover: 'https://i.ebayimg.com/images/g/NLgAAOSw8lZfMNah/s-l960.webp',
              title: 'Pride and Prejudice',
              returnDate: new Date('2023-11-15'), 
              author: 'by: Jane Austen'
            },
            {
                cover: 'https://i.harperapps.com/covers/9780063033313/y648.jpg',
                title: 'Death on the Nile',
                returnDate: new Date('2023-06-10'),
                author: 'by: Agatha Christie'
            },
            {
                cover: 'https://m.media-amazon.com/images/I/71wEDMAAnOL._AC_UF1000,1000_QL80_.jpg',
                title: 'Mindset',
                returnDate: new Date('2023-02-20'),
                author: 'by: Carol S. Dweck'
            }
        ].forEach((book)=>{
            previousBooks.append(book);
        })
}