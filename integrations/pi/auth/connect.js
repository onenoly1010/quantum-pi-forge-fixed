/**
 * Pi Network Authentication - Connect
 * Handles Pi wallet connection and authentication flow
 */

class PiAuth {
  constructor() {
    this.isPiBrowser = typeof window !== "undefined" && window.Pi;
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  /**
   * Check if Pi SDK is available
   */
  isAvailable() {
    return this.isPiBrowser;
  }

  /**
   * Initialize Pi SDK
   */
  async init(options = {}) {
    if (!this.isPiBrowser) {
      throw new Error(
        "Pi SDK not available. This should only run in Pi Browser.",
      );
    }

    const defaultOptions = {
      version: "2.0",
      sandbox: false,
      ...options,
    };

    window.Pi.init(defaultOptions);
    return true;
  }

  /**
   * Authenticate user with Pi Network
   */
  async authenticate(scopes = ["username"]) {
    if (!this.isPiBrowser) {
      // Development mode simulation
      return new Promise((resolve) => {
        setTimeout(() => {
          this.currentUser = { username: "demo_user" };
          this.isAuthenticated = true;
          resolve({
            user: this.currentUser,
            accessToken: "demo_token",
          });
        }, 1500);
      });
    }

    try {
      const auth = await window.Pi.authenticate(scopes, () => {});
      this.currentUser = auth.user;
      this.isAuthenticated = true;
      return auth;
    } catch (error) {
      this.isAuthenticated = false;
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  /**
   * Sign out user
   */
  signOut() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }
}

export default PiAuth;
