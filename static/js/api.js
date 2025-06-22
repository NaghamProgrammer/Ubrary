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
      // Get the auth token from storage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Logout failed');
        } catch (jsonError) {
          // If parsing JSON fails, use the status text instead
          throw new Error(`Logout failed: ${response.status} ${response.statusText}`);
        }
      }

      // Clear auth data from storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');

      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
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
            throw new Error(errorData?.error || `Failed to return book: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error returning book:', error);
        throw error;
    }
  },

  async getFavoriteBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/favorite-books/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
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

  async removeFavoriteBook(bookId) {
    const csrfToken = getCookie('csrftoken');
    
    if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page or login again.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/favorite-books/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ book_id: bookId }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to remove favorite book: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing favorite book:', error);
        throw error;
    }
  },

  async getBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/books/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to fetch books: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
  },

  async getBookById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${id}/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to fetch book: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching book:', error);
        throw error;
    }
  },

  async addBook(formData) {
    const csrfToken = getCookie('csrftoken');
    
    if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page or login again.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/books/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to add book: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding book:', error);
        throw error;
    }
  },

  async updateBook(id, data) {
    const csrfToken = getCookie('csrftoken');
    
    if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page or login again.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/books/${id}/`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to update book: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
  },

  async deleteBook(id) {
    const csrfToken = getCookie('csrftoken');
    
    if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page or login again.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/books/${id}/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to delete book: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting book:', error);
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
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to fetch categories: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
  }
}; 