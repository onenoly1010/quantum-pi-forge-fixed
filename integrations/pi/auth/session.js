/**
 * Pi Network Authentication - Session Management
 * Manages user sessions and authentication state
 */

class PiSession {
  constructor() {
    this.sessionKey = "pi_auth_session";
    this.sessionData = null;
  }

  /**
   * Save authentication session
   */
  saveSession(authData) {
    try {
      const session = {
        user: authData.user,
        accessToken: authData.accessToken,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
      }

      this.sessionData = session;
      return true;
    } catch (error) {
      console.error("Failed to save Pi session:", error);
      return false;
    }
  }

  /**
   * Load authentication session
   */
  loadSession() {
    try {
      if (typeof window === "undefined") return null;

      const sessionStr = localStorage.getItem(this.sessionKey);
      if (!sessionStr) return null;

      const session = JSON.parse(sessionStr);

      // Check if session is expired
      if (session.expiresAt < Date.now()) {
        this.clearSession();
        return null;
      }

      this.sessionData = session;
      return session;
    } catch (error) {
      console.error("Failed to load Pi session:", error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear authentication session
   */
  clearSession() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.sessionKey);
    }
    this.sessionData = null;
  }

  /**
   * Get current session data
   */
  getSessionData() {
    return this.sessionData || this.loadSession();
  }

  /**
   * Check if session is valid
   */
  isSessionValid() {
    const session = this.getSessionData();
    return session && session.expiresAt > Date.now();
  }
}

export default PiSession;
