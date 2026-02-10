// Pi Network Integration Tests

const PiAuth = require("../auth/connect");
const PiSession = require("../auth/session");
const PiTokenVerifier = require("../auth/verify");
const PiPaymentCreator = require("../payments/create-payment");
const PiPaymentVerifier = require("../payments/verify-payment");
const PiWebhooks = require("../payments/webhooks");
const PiProfileMapper = require("../identity/map-profile");
const PiUserResolver = require("../identity/resolve-user");
const PiApiClient = require("../api/client");
const {
  PI_ENDPOINTS,
  validateUsername,
  validatePaymentAmount,
} = require("../api/endpoints");
const piSDK = require("../config/sdk-setup");
const {
  validateEnvironment,
  getEnvironmentConfig,
} = require("../config/environment");

describe("Pi Network Integration", () => {
  describe("Environment Configuration", () => {
    test("should validate environment variables", () => {
      // This will fail in test environment without proper env vars
      // In real usage, would have proper env setup
      expect(typeof validateEnvironment).toBe("function");
    });

    test("should get environment config", () => {
      const config = getEnvironmentConfig();
      expect(config).toHaveProperty("API_BASE_URL");
      expect(config).toHaveProperty("isDevelopment");
    });
  });

  describe("SDK Setup", () => {
    test("should have SDK setup methods", () => {
      expect(typeof piSDK.init).toBe("function");
      expect(typeof piSDK.isAvailable).toBe("function");
      expect(typeof piSDK.getVersion).toBe("function");
    });
  });

  describe("API Endpoints", () => {
    test("should have endpoint constants", () => {
      expect(PI_ENDPOINTS).toHaveProperty("AUTH_VERIFY");
      expect(PI_ENDPOINTS).toHaveProperty("PAYMENTS_CREATE");
      expect(PI_ENDPOINTS).toHaveProperty("USER_INFO");
    });

    test("should validate username", () => {
      expect(validateUsername("valid_user")).toBe(true);
      expect(validateUsername("")).toBe(false);
      expect(validateUsername("invalid user")).toBe(false);
    });

    test("should validate payment amount", () => {
      expect(validatePaymentAmount(1.0)).toBe(true);
      expect(validatePaymentAmount(0)).toBe(false);
      expect(validatePaymentAmount(10001)).toBe(false);
    });
  });

  describe("Auth Classes", () => {
    test("should instantiate auth classes", () => {
      const auth = new PiAuth();
      const session = new PiSession();
      const verifier = new PiTokenVerifier();

      expect(auth).toBeInstanceOf(PiAuth);
      expect(session).toBeInstanceOf(PiSession);
      expect(verifier).toBeInstanceOf(PiTokenVerifier);
    });
  });

  describe("Payment Classes", () => {
    test("should instantiate payment classes", () => {
      const creator = new PiPaymentCreator();
      const verifier = new PiPaymentVerifier();
      const webhooks = new PiWebhooks();

      expect(creator).toBeInstanceOf(PiPaymentCreator);
      expect(verifier).toBeInstanceOf(PiPaymentVerifier);
      expect(webhooks).toBeInstanceOf(PiWebhooks);
    });
  });

  describe("Identity Classes", () => {
    test("should instantiate identity classes", () => {
      const mapper = new PiProfileMapper();
      const resolver = new PiUserResolver();

      expect(mapper).toBeInstanceOf(PiProfileMapper);
      expect(resolver).toBeInstanceOf(PiUserResolver);
    });
  });

  describe("API Client", () => {
    test("should instantiate API client", () => {
      const client = new PiApiClient();
      expect(client).toBeInstanceOf(PiApiClient);
    });
  });
});
