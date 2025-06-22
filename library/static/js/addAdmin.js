document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("addBookForm");
    const categorySelect = document.getElementById("category");

    try {
        // Load categories into dropdown
        const categories = await ApiService.getCategories();
        categorySelect.innerHTML = '<option value="">Select category</option>';
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.name; 
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading categories:", err);
        alert("❌ Failed to load categories");
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData();

        // Collect form data
        formData.append("title", document.getElementById("bookName").value);
        formData.append("author", document.getElementById("author").value);
        formData.append("description", document.getElementById("description").value);
        formData.append("published_date", document.getElementById("publishedDate").value);
        formData.append("cover", document.getElementById("cover").files[0]);  
        formData.append("number_of_copies", document.getElementById("numberOfCopies").value);

        // Get category ID from selected name
        const categoryName = document.getElementById("category").value;
        const categories = await ApiService.getCategories();
        const category = categories.find(c => c.name === categoryName);
        formData.append("categories", category.id);

        try {
            await ApiService.addBook(formData);
            alert("✅ Book added!");
            
            // Reset form after successful addition
            form.reset(); 
            // Manually reset select as form.reset() doesn't always work for selects
            document.getElementById("category").value = "";
            
        } catch (err) {
            console.error("❌", err);
            alert(err.message);
        }
    });
});