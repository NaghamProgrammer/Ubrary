document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("deleteForm");
    const bookIdInput = document.getElementById("bookId");

    // Load available book IDs on page load
    loadAvailableBooks();

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const rawId = bookIdInput.value.trim().toUpperCase();
        
        // Validate book ID format
        if (!/^BK\d{1,3}$/.test(rawId)) {
            alert("❌ Invalid Book ID format. Use BK followed by 1-3 numbers (e.g. BK001)");
            return;
        }

        const id = rawId.replace(/^BK/, ''); 
        const paddedId = id.padStart(3, '0');
        
        // Confirm deletion with user
        if (!confirm(`Are you sure you want to delete book BK${paddedId}?`)) return;

        try {
            const response = await ApiService.deleteBook(id);
            
            if (response.ok) {
                alert(`✅ Book BK${paddedId} deleted successfully`);
                // Reset form after successful deletion
                form.reset(); 
                // Reload available book IDs
                loadAvailableBooks();
            } else {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Failed to delete book");
            }
        } catch (err) {
            console.error("Delete error details:", err);
            alert(`❌ Delete failed: ${err.message}`);
        }
    });

    // Function to load available book IDs
    async function loadAvailableBooks() {
        try {
            const books = await ApiService.getBooks();
            const availableIds = books.map(book => `BK${String(book.id).padStart(3, "0")}`); 
            document.querySelector(".id-hint").textContent = `Available IDs: ${availableIds.join(", ")}`;
        } catch (err) {
            console.error("Load books error:", err);
        }
    }
});