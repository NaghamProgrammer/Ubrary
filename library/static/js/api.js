// api.js - API service for authentication and data operations

// Base API URL - adjust if your API is hosted elsewhere
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper to get CSRF token from cookies
function getCookie(name) {
  const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return cookieValue ? cookieValue.pop() : '';
}

// API Service object with authentication methods
const ApiService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data (username, email, password)
   * @returns {Promise} - Promise resolving to the registration response
   */
  async register(userData) {
    try {
      // Map frontend data to backend expected format
      const apiData = {
        email: userData.email,
        password: userData.password,
        // Convert role to is_admin boolean if role is provided
        ...(userData.role && { is_admin: userData.role === 'admin' })
      };

      const response = await fetch(`${API_BASE_URL}/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        let errorMessage = `Registration failed: ${response.status} ${response.statusText}`; // Default error
        try {
          const errorData = await response.json();
          // Try common error fields or stringify the data
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else {
             // If it's an object but no known error field, stringify it
             errorMessage = JSON.stringify(errorData);
          }
        } catch (jsonError) {
          // If JSON parsing fails, the default statusText message is already set
          console.error("Failed to parse error JSON response:", jsonError);
        }
        throw new Error(errorMessage); // Throw the extracted or default message
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Promise resolving to the login response with token
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Login failed');
        } catch (jsonError) {
          // If parsing JSON fails, use the status text instead
          throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Request a password reset
   * @param {string} email - User email
   * @returns {Promise} - Promise resolving to the request response
   */
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/password-reset-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Password reset request failed');
        } catch (jsonError) {
          // If parsing JSON fails, use the status text instead
          throw new Error(`Password reset request failed: ${response.status} ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  /**
   * Reset a password with token
   * @param {string} uid - User ID
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise resolving to the reset response
   */
  async resetPassword(uid, token, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/password-reset-confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid, token, new_password: newPassword }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Password reset failed');
        } catch (jsonError) {
          // If parsing JSON fails, use the status text instead
          throw new Error(`Password reset failed: ${response.status} ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  /**
   * Logout the current user
   * @returns {Promise} - Promise resolving to the logout response
   */
  async logout() {
    try {
      const csrfToken = getCookie('csrftoken');
    
      if (!csrfToken) {
          throw new Error('CSRF token not found. Please refresh the page or login again.');
      }
      const response = await fetch(`${API_BASE_URL}/logout/`, {
        method: 'POST',
        credentials: 'include', // Make sure to send cookies
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
      });
      // debugger;
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Logout failed: ${response.status}`);
      }
      // document.cookie = "";
      // ✅ Clear all stored user data
      // localStorage.removeItem('authToken');
      // localStorage.removeItem('currentUser');
      // sessionStorage.removeItem('currentUser');

      return await response.json(); // Optionally return message
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },


    /**
   * Borrow a book
   * @param {string} bookId - ID of the book to borrow
   * @returns {Promise} - Promise resolving to the borrow response
   */
  async borrowBook(bookId) {
    try {
      const csrfToken = getCookie('csrftoken');
      
      if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page.');
      }

      const response = await fetch(`${API_BASE_URL}/borrowed-books/`, {
        method: 'POST',
        credentials: 'include', // Important for session cookies
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ book: bookId })
      });

      if (!response.ok) {
        // Try to get detailed error message from response
        let errorDetail = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || 
                       errorData.error || 
                       JSON.stringify(errorData);
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(`Borrow failed: ${errorDetail}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Borrow book error:', error);
      throw error; // Re-throw for handling in the UI
    }
  },

  /**
   * Get borrowed books
   * @returns {Promise} - Promise resolving to the borrowed books list
   */
  async getBorrowedBooks() {
    try {
      const response = await fetch(`${API_BASE_URL}/borrowed-books/`, {
        method: 'GET',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header needed
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to fetch borrowed books: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      throw error;
    }
  },

  async returnBorrowedBook(bookId) {
    const csrfToken = getCookie('csrftoken');
    
    if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page or login again.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/borrowed-books/`, {
            method: 'PATCH',
            credentials: 'include',  // Important for session cookies
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ book_id: bookId }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to return book: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error returning book:', error);
        throw error;
    }
},


  /**
   * Add a book to favorites
   * @param {string} bookId - ID of the book to favorite
   * @returns {Promise} - Promise resolving to the favorite response
   */
  async addFavoriteBook(bookId) {
    try {
      const csrfToken = getCookie('csrftoken');
      
      if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page.');
      }

      const response = await fetch(`${API_BASE_URL}/favorite-books/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ book: bookId })
      });

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || 
                       errorData.error || 
                       JSON.stringify(errorData);
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(`Add to favorites failed: ${errorDetail}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Add favorite error:', error);
      throw error;
    }
  },

  /**
   * Check if a book is favorited
   * @param {string} bookId - ID of the book to check
   * @returns {Promise<boolean>} - Promise resolving to whether the book is favorited
   */
  async checkIfFavorited(bookId) {
    try {
      const response = await fetch(`${API_BASE_URL}/favorite-books/`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) return false;
      
      const favoriteBooks = await response.json();
      return favoriteBooks.some(fav => fav.book_id == bookId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  /**
   * Get favorite books
   * @returns {Promise} - Promise resolving to the favorite books list
   */
  async getFavoriteBooks() {
    try {
      const response = await fetch(`${API_BASE_URL}/favorite-books/`, {
        method: 'GET',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to fetch favorite books: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching favorite books:', error);
      throw error;
    }
  },

  /**
   * Remove a book from favorites
   * @param {string} bookId - ID of the book to remove
   * @returns {Promise} - Promise resolving to the removal response
   */
  async removeFavoriteBook(bookId) {
    try {
        const csrfToken = getCookie('csrftoken');
        const response = await fetch(`${API_BASE_URL}/favorite-books/${bookId}/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            }
        });

        if (!response.ok && response.status !== 204) {
            // Still try to get error JSON
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to remove favorite: ${response.status}`);
        }

        // ✅ If 204 (No Content), treat it as success without parsing
        if (response.status === 204) {
            return { success: true };
        }

        // ✅ If any body is returned (200 OK), parse it
        return await response.json();
    } catch (error) {
        console.error('Error removing favorite book:', error);
        throw error;
    }
  },

 async getBooks() {
    // Fetch only available books for the user page
    const response = await fetch(`${API_BASE_URL}/books/available/`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Failed to get books: ${response.status}`);
    return await response.json();
  },

  async getBookById(id) {
    try {
        // Fetch a single book from the standard books endpoint
        const response = await fetch(`${API_BASE_URL}/books/${id}/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            // Try to parse error JSON, otherwise use status text
            let errorDetail = `Book not found or error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorData.error || errorDetail;
            } catch (e) { /* Ignore JSON parse error */ }
            throw new Error(errorDetail);
        }
        const book = await response.json();
        // Ensure categories is an array if it exists
        if (book.categories && !Array.isArray(book.categories)) {
            book.categories = [book.categories]; 
        }
        // Ensure cover image is formatted for display
        if (book.cover && !book.cover.startsWith('data:image')) {
             book.cover = `data:image/jpeg;base64,${book.cover}`;
         }
        return book;
    } catch (error) {
        console.error('Get book error:', error);
        throw error;
    }
  },

  async addBook(formData) {
    const csrfToken = getCookie('csrftoken');
    const response = await fetch(`${API_BASE_URL}/admin/books/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrfToken
        // Content-Type is set automatically for FormData
      },
      body: formData
    });
    if (!response.ok) {
        let errorDetail = `Failed to add book: ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || JSON.stringify(errorData) || errorDetail;
        } catch (e) { /* Ignore JSON parse error */ }
        throw new Error(errorDetail);
    }
    return await response.json();
  },

  /**
   * Update book details
   * @param {string} id - Book ID
   * @param {object} data - Updated book data
   * @returns {Promise} - Promise resolving to updated book
   */
  async updateBook(id, data) {
    try {
        const csrfToken = getCookie('csrftoken');
        const response = await fetch(`${API_BASE_URL}/admin/books/${id}/`, {
            method: 'PUT', // Or PATCH if your backend supports partial updates
            credentials: 'include', // <<< Added this line
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            let errorDetail = `Failed to update book: ${response.status}`;
            try {
                const errorData = await response.json();
                console.error("API Error Response:", errorData); 
                // Use specific error fields if available
                errorDetail = errorData.detail || errorData.error || JSON.stringify(errorData) || errorDetail;
            } catch (e) { /* Ignore JSON parse error */ }
            throw new Error(errorDetail);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Update book error:', error);
        throw error; // Re-throw the error for the calling function to handle
    }
  },

  async deleteBook(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/books/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        }
      });
      if (!response.ok && response.status !== 204) { // Allow 204 No Content
        let errorDetail = `Failed to delete book: ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.error || errorDetail;
        } catch (e) { /* Ignore JSON parse error */ }
        throw new Error(errorDetail);
      }
      // For DELETE, returning the response status might be enough
      return response; 
    } catch (error) {
      console.error('Delete book error:', error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to load categories: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },

  async searchBooks(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const results = await response.json();
      return {
        count: results.length,
        results: results.map(book => ({
          ...book,
          cover: book.cover ? `data:image/jpeg;base64,${book.cover}` : null,
          borrowed: !book.is_available
        }))
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
};


// Add this new function to check if a book is borrowed
async function checkIfBorrowed(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/borrowed-books/`, {
            method: 'GET',
            credentials: 'include' // Send session cookies
        });
        
        if (!response.ok) return false;
        
        const borrowedBooks = await response.json();
        // Check if this book is borrowed and not returned
        return borrowedBooks.some(b => b.book_id == bookId && !b.returned);
    } catch (error) {
        console.error('Error checking borrow status:', error);
        return false;
    }
}


/**
 * Get the currently logged-in user from the backend
 * @returns {Promise} - Resolves to the user object (includes is_admin, email, etc.)
 */
async function getCurrentUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/me/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to get current user: ${response.status}`);
        }

        return await response.json(); // should include is_admin, email, etc.
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
}


// Add the function to ApiService (right before the last line)
ApiService.checkIfBorrowed = checkIfBorrowed;

ApiService.getCurrentUser = getCurrentUser;

// Make ApiService available globally
window.ApiService = ApiService;
