// api.js - API service for authentication and data operations

// Base API URL - adjust if your API is hosted elsewhere
const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Registration failed');
        } catch (jsonError) {
          // If parsing JSON fails, use the status text instead
          throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
        }
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
  }
};

// Export the API Service
window.ApiService = ApiService;
