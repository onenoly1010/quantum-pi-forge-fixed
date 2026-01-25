/**
 * Pi Network Authentication - Token Verification
 * Verifies Pi access tokens and user authenticity
 */

class PiTokenVerifier {
  constructor() {
    this.apiBaseUrl = process.env.PI_API_BASE_URL || 'https://api.pi.network';
  }

  /**
   * Verify Pi access token
   */
  async verifyToken(accessToken) {
    if (!accessToken) {
      return { valid: false, error: 'No token provided' };
    }

    // In development/demo mode, accept demo tokens
    if (accessToken === 'demo_token') {
      return {
        valid: true,
        user: { username: 'demo_user' },
        scopes: ['username']
      };
    }

    try {
      // Verify token with Pi Platform API
      const response = await fetch(`${this.apiBaseUrl}/v1/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        return {
          valid: false,
          error: `Token verification failed: ${response.status}`
        };
      }

      const data = await response.json();

      return {
        valid: true,
        user: data.user,
        scopes: data.scopes || []
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Verify user identity
   */
  async verifyUser(username) {
    if (!username) {
      return { valid: false, error: 'No username provided' };
    }

    // In demo mode, accept demo users
    if (username === 'demo_user') {
      return {
        valid: true,
        user: { username: 'demo_user', uid: 'demo_uid' }
      };
    }

    try {
      // Verify user with Pi Platform API
      const response = await fetch(`${this.apiBaseUrl}/v1/user/${username}`);

      if (!response.ok) {
        return {
          valid: false,
          error: `User verification failed: ${response.status}`
        };
      }

      const userData = await response.json();

      return {
        valid: true,
        user: userData
      };
    } catch (error) {
      console.error('User verification error:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

export default PiTokenVerifier;