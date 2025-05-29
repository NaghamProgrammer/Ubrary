document.getElementById('addBookForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('id', bookId);
    formData.append('title', bookName);
    formData.append('author', author);
    formData.append('category', category);
    formData.append('published_date', publishedDate);
    formData.append('description', description);
    formData.append('cover', coverFile);
    formData.append('borrowed', false);
    formData.append('favorite', false);


   
    if (!bookId || !bookName || !author || !publishedDate || !category || !description || !coverFile) {
        alert('Please fill in all required fields.');
        return;
    }

   
    const bookIdPattern = /^BK\d{3}$/;
    if (!bookIdPattern.test(bookId)) {
        alert('Book ID must be in the format "BK" followed by 3 digits (e.g., BK006).');
        return;
    }

    
    let existingBooks;
    try {
        existingBooks = window.bookManager.getBooks();
       
        if (!existingBooks || typeof existingBooks !== 'object') {
            existingBooks = {};
        }
    } catch (error) {
        console.error('Error loading books:', error);
        existingBooks = {};
    }

   
    if (existingBooks[bookId]) {
        alert('This Book ID already exists.');
        return;
    }

   
    const authorRegex = /^[a-zA-Z\s]+$/;
    if (!authorRegex.test(author)) {
        alert('Author name should only contain letters and spaces.');
        return;
    }

    
    if (bookName.length > 25) {
        alert('Title must not exceed 25 characters.');
        return;
    }

 
    const today = new Date().toISOString().split('T')[0];
    if (publishedDate > today) {
        alert('Published Date cannot be in the future.');
        return;
    }

   
    const reader = new FileReader();
    reader.onload = function(event) {
        const coverBase64 = event.target.result;

       
        const newBook = {
            id: bookId,
            title: bookName,
            author: author,
            category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
            cover: coverBase64,
            description: description,
            borrowed: false,
            favorite: false,
            publishedDate: publishedDate
        };

       
        existingBooks[bookId] = newBook;

        fetch('http://127.0.0.1:8000/api/books/', {
            method: 'POST',
            body: formData,
              })
           .then(res => res.json())
           .then(data => {
            alert('Book added successfully!');
            document.getElementById('addBookForm').reset();
            })
        .catch(err => {
            console.error(err);
            alert('Error adding book.');
            });

    };

    reader.onerror = function() {
        alert('Error reading book cover. Please try again.');
    };

    reader.readAsDataURL(coverFile);
});