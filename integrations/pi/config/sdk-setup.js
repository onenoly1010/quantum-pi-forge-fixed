/**
 * Pi Network SDK Setup
 * Initializes and configures the Pi SDK
 */

class PiSDKSetup {
  constructor() {
    this.isInitialized = false;
    this.config = {
      version: "2.0",
      sandbox: false,
    };
  }

  /**
   * Initialize Pi SDK
   */
  async init(options = {}) {
    if (this.isInitialized) {
      console.warn("Pi SDK already initialized");
      return true;
    }

    // Check if running in Pi Browser
    if (typeof window === "undefined" || !window.Pi) {
      console.warn("Pi SDK not available - running in development mode");
      this.isInitialized = true; // Mark as initialized for demo mode
      return true;
    }

    try {
      const initConfig = {
        ...this.config,
        ...options,
      };

      window.Pi.init(initConfig);
      this.isInitialized = true;

      console.log("Pi SDK initialized successfully", initConfig);
      return true;
    } catch (error) {
      console.error("Failed to initialize Pi SDK:", error);
      throw error;
    }
  }

  /**
   * Check if SDK is available
   */
  isAvailable() {
    return typeof window !== "undefined" && !!window.Pi;
  }

  /**
   * Get SDK version
   */
  getVersion() {
    if (this.isAvailable()) {
      return window.Pi.version || "unknown";
    }
    return "not available";
  }

  /**
   * Configure SDK settings
   */
  configure(config) {
    this.config = {
      ...this.config,
      ...config,
    };

    // Re-initialize if already initialized
    if (this.isInitialized) {
      this.init(this.config);
    }
  }

  /**
   * Reset SDK state
   */
  reset() {
    this.isInitialized = false;
    this.config = {
      version: "2.0",
      sandbox: false,
    };
  }
}

// Singleton instance
const piSDK = new PiSDKSetup();

export default piSDK;
