/**
 * API Tests
 * Basic tests for the Unified API
 */

const { UnifiedAPIServer } = require("../index");
const { authService } = require("../services/auth");
const { soulService } = require("../services/soul");
const { oracleService } = require("../services/oracle");
const { inftService } = require("../services/inft");
const { paymentService } = require("../services/payment");

describe("Unified API", () => {
  let server;
  let app;

  beforeAll(async () => {
    server = new UnifiedAPIServer();
    await server.initialize();
    app = server.getApp();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("Server Initialization", () => {
    test("should initialize without errors", () => {
      expect(server).toBeDefined();
      expect(app).toBeDefined();
    });

    test("should have health endpoint", () => {
      expect(app).toBeDefined();
    });
  });

  describe("Services", () => {
    test("should have auth service", () => {
      expect(authService).toBeDefined();
      expect(typeof authService.generateToken).toBe("function");
    });

    test("should have soul service", () => {
      expect(soulService).toBeDefined();
      expect(typeof soulService.createSoul).toBe("function");
    });

    test("should have oracle service", () => {
      expect(oracleService).toBeDefined();
      expect(typeof oracleService.generateReading).toBe("function");
    });

    test("should have iNFT service", () => {
      expect(inftService).toBeDefined();
      expect(typeof inftService.mintINFT).toBe("function");
    });

    test("should have payment service", () => {
      expect(paymentService).toBeDefined();
      expect(typeof paymentService.createPayment).toBe("function");
    });
  });

  describe("Configuration", () => {
    test("should load server config", () => {
      const config = server.config;
      expect(config).toBeDefined();
      expect(config.port).toBeDefined();
      expect(config.jwtSecret).toBeDefined();
    });
  });
});
