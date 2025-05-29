// editAdmin.js - Updated to use corrected ApiService and improve error handling
document.addEventListener("DOMContentLoaded", function() {
  // 1. Element References
  const editForm = document.getElementById("editBookForm");
  const searchInput = document.getElementById("searchId");
  const searchBtn = document.querySelector(".search-btn");
  const editableFields = document.getElementById("editableFields");
  const categorySelect = document.getElementById("category");
  const idHint = document.querySelector(".id-hint");
  const numberOfCopiesInput = document.getElementById("numberOfCopies"); // Assuming this exists in your HTML

  // Create message div dynamically
  let messageDiv = document.getElementById("message");
  if (!messageDiv) {
      messageDiv = document.createElement("div");
      messageDiv.id = "message";
      messageDiv.className = "message";
      // Insert message div before the form or in a suitable location
      editForm.parentNode.insertBefore(messageDiv, editForm);
  }

  // Verify elements exist
  if (!editForm || !searchInput || !searchBtn || !editableFields || !categorySelect || !idHint) {
    console.error("Critical elements missing from the page (editForm, searchInput, searchBtn, editableFields, categorySelect, idHint).");
    showMessage("Page structure error. Please contact support.", "error");
    return;
  }

  // 2. Initial Load
  loadAvailableBooks();
  loadCategories();

  // 3. Search Button Click Handler
  searchBtn.addEventListener("click", async function() {
    clearMessage();
    const rawId = searchInput.value.trim().toUpperCase();
    
    // Validate ID format (BK followed by numbers)
    if (!/^BK\d+$/.test(rawId)) {
      showMessage("Invalid Book ID format. Use BK followed by numbers (e.g., BK001)", "error");
      return;
    }

    const id = rawId.replace(/^BK/, ""); // Extract numeric ID
    const searchBtnOriginalText = searchBtn.textContent;
    
    try {
      searchBtn.disabled = true;
      searchBtn.textContent = "Loading...";
      showMessage("Searching for book...", "info");

      // Use ApiService to get book details
      const book = await ApiService.getBookById(id);
      
      fillFormFields(book, rawId);
      showEditableFields();
      showMessage(`Book ${rawId} loaded successfully. You can now edit the details.`, "success");

    } catch (err) {
      console.error("Book load error:", err);
      let errorMessage = err.message || "An unknown error occurred while fetching the book.";
      // Customize error message for 404
      if (err.message.includes("404") || err.message.toLowerCase().includes("not found")) {
        errorMessage = `Book with ID ${rawId} not found. Please check the ID and try again.`;
      }
      showMessage(`Error: ${errorMessage}`, "error");
      hideEditableFields(); // Hide form if search fails
    } finally {
      searchBtn.disabled = false;
      searchBtn.textContent = searchBtnOriginalText;
    }
  });

  // 4. Form Submission Handler (Edit Book)
  editForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const rawId = searchInput.value.trim().toUpperCase();
    const id = rawId.replace(/^BK/, "");
    
    if (!id || isNaN(parseInt(id))) {
        alert("Invalid or missing Book ID. Please search for a book first.");
        return;
    }

    const submitBtn = editForm.querySelector('button[type="submit"]');
    const submitBtnOriginalText = submitBtn.textContent;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving...";

        // Prepare updated book data
        const updatedData = {
            title: document.getElementById("bookName").value.trim(),
            author: document.getElementById("author").value.trim(),
            categories: [categorySelect.value],
            published_date: document.getElementById("publishedDate").value,
            description: document.getElementById("description").value.trim(),
            number_of_copies: parseInt(document.getElementById("numberOfCopies").value) || 1
        };

        // Validate required fields
        if (!updatedData.title || !updatedData.author || !updatedData.categories[0] || !updatedData.published_date) {
            throw new Error("Please fill in all required fields: Title, Author, Category, Published Date.");
        }

        await ApiService.updateBook(id, updatedData);
        alert(`Book ${rawId} updated successfully!`);
        
        // Reset form after successful update
        resetForm(); // This function already exists in the original code
        loadAvailableBooks();
        
    } catch (err) {
        console.error("Update error:", err);
        alert(`Update failed: ${err.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtnOriginalText;
    }
});

  // --- Helper Functions ---

  async function loadAvailableBooks() {
    try {
      const books = await ApiService.getBooks();
      // Format IDs consistently (e.g., BK001)
      const availableIds = books.map(book => `BK${String(book.id).padStart(3, "0")}`); 
      idHint.textContent = `Available IDs: ${availableIds.join(", ")}`;
    } catch (err) {
      idHint.textContent = "Error loading available book IDs.";
      console.error("Load books error:", err);
    }
  }

  async function loadCategories() {
    try {
        const categories = await ApiService.getCategories();
        categorySelect.innerHTML = ""; // Clear existing
        // Add placeholder
        const placeholder = new Option("Select category", "");
        placeholder.disabled = true;
        placeholder.selected = true;
        categorySelect.add(placeholder);
        // Add fetched categories
        categories.forEach(category => {
            const option = new Option(category.name, category.id);
            categorySelect.add(option);
        });
    } catch (err) {
        showMessage("Failed to load categories. Please refresh.", "error");
        console.error("Load categories error:", err);
    }
  }

  function fillFormFields(book, rawId) {
    document.getElementById("bookName").value = book.title || "";
    document.getElementById("author").value = book.author || "";
    document.getElementById("publishedDate").value = book.published_date || "";
    document.getElementById("description").value = book.description || "";
    if (numberOfCopiesInput) {
        numberOfCopiesInput.value = book.number_of_copies || 1;
    }
    
    // Handle category selection (assuming book.categories is an array of IDs)
    if (book.categories && book.categories.length > 0) {
        const bookCategoryId = book.categories[0]; // Get the first category ID
        // Find the option with the matching value and select it
        const categoryOption = Array.from(categorySelect.options).find(opt => opt.value == bookCategoryId);
        if (categoryOption) {
            categoryOption.selected = true;
        } else {
            console.warn(`Category ID ${bookCategoryId} not found in dropdown.`);
            categorySelect.value = ""; // Reset if not found
        }
    } else {
        categorySelect.value = ""; // Reset if no category
    }
  }

  function showEditableFields() {
    editableFields.style.display = "block";
    // Use timeout to allow display:block to apply before starting transition
    setTimeout(() => { editableFields.style.opacity = "1"; }, 10);
  }

  function hideEditableFields() {
      editableFields.style.opacity = "0";
      // Use timeout to hide after transition finishes
      setTimeout(() => { editableFields.style.display = "none"; }, 300); // Match transition duration
  }

  function resetForm() {
    editForm.reset();
    hideEditableFields();
    clearMessage();
    searchInput.value = ""; // Clear search input as well
  }

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = "block"; // Make sure it's visible
  }

  function clearMessage() {
      messageDiv.textContent = "";
      messageDiv.className = "message";
      messageDiv.style.display = "none"; // Hide it
  }
});

