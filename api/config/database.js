/**
 * Database Configuration
 * MongoDB connection and schema setup for the unified API
 */

const { MongoClient, ObjectId } = require("mongodb");
const { getEnvVar, isProduction } = require("./environment");

class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  /**
   * Get database configuration
   */
  getConfig() {
    return {
      url: getEnvVar(
        "DATABASE_URL",
        "mongodb://localhost:27017/quantumpiforge",
      ),
      name: getEnvVar("DATABASE_NAME", "quantumpiforge"),
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: parseInt(getEnvVar("DB_MAX_POOL_SIZE", "10")),
        serverSelectionTimeoutMS: parseInt(
          getEnvVar("DB_SERVER_SELECTION_TIMEOUT", "5000"),
        ),
        socketTimeoutMS: parseInt(getEnvVar("DB_SOCKET_TIMEOUT", "45000")),
        connectTimeoutMS: parseInt(getEnvVar("DB_CONNECT_TIMEOUT", "10000")),
        retryWrites: getEnvVar("DB_RETRY_WRITES", "true") === "true",
        retryReads: getEnvVar("DB_RETRY_READS", "true") === "true",
        maxIdleTimeMS: parseInt(getEnvVar("DB_MAX_IDLE_TIME", "30000")),
      },
    };
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    if (this.isConnected && this.client) {
      return this.db;
    }

    try {
      const config = this.getConfig();
      this.client = new MongoClient(config.url, config.options);

      await this.client.connect();
      this.db = this.client.db(config.name);
      this.isConnected = true;

      console.log(`Connected to MongoDB: ${config.name}`);

      // Set up connection event handlers
      this.client.on("error", (error) => {
        console.error("MongoDB connection error:", error);
        this.isConnected = false;
      });

      this.client.on("close", () => {
        console.log("MongoDB connection closed");
        this.isConnected = false;
      });

      this.client.on("reconnect", () => {
        console.log("MongoDB reconnected");
        this.isConnected = true;
      });

      return this.db;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.isConnected = false;
      console.log("Disconnected from MongoDB");
    }
  }

  /**
   * Get database instance
   */
  getDatabase() {
    if (!this.isConnected || !this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  /**
   * Get collection
   */
  getCollection(name) {
    const db = this.getDatabase();
    return db.collection(name);
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: "disconnected", message: "Database not connected" };
      }

      const db = this.getDatabase();
      await db.admin().ping();

      const stats = await db.stats();
      return {
        status: "healthy",
        collections: stats.collections,
        objects: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  }

  /**
   * Create indexes
   */
  async createIndexes() {
    const db = this.getDatabase();

    try {
      // Users collection indexes
      await db
        .collection("users")
        .createIndexes([
          { key: { piAddress: 1 }, options: { unique: true, sparse: true } },
          { key: { soulId: 1 }, options: { unique: true, sparse: true } },
          { key: { email: 1 }, options: { unique: true, sparse: true } },
          { key: { createdAt: 1 } },
          { key: { lastLogin: -1 } },
        ]);

      // Souls collection indexes
      await db
        .collection("souls")
        .createIndexes([
          { key: { soulId: 1 }, options: { unique: true } },
          { key: { owner: 1 } },
          { key: { createdAt: 1 } },
          { key: { lastActivity: -1 } },
          { key: { "metadata.traits": 1 } },
          { key: { "metadata.level": 1 } },
        ]);

      // iNFTs collection indexes
      await db
        .collection("infts")
        .createIndexes([
          { key: { tokenId: 1 }, options: { unique: true } },
          { key: { soulId: 1 } },
          { key: { owner: 1 } },
          { key: { createdAt: 1 } },
          { key: { "metadata.evolutionLevel": 1 } },
          { key: { "metadata.rarity": 1 } },
          { key: { "metadata.oracleReadingId": 1 } },
        ]);

      // Oracle readings collection indexes
      await db
        .collection("oracle_readings")
        .createIndexes([
          { key: { readingId: 1 }, options: { unique: true } },
          { key: { soulId: 1 } },
          { key: { createdAt: 1 } },
          { key: { "metadata.type": 1 } },
          { key: { "metadata.intensity": 1 } },
          { key: { verified: 1 } },
        ]);

      // Payments collection indexes
      await db
        .collection("payments")
        .createIndexes([
          { key: { paymentId: 1 }, options: { unique: true } },
          { key: { userId: 1 } },
          { key: { status: 1 } },
          { key: { createdAt: 1 } },
          { key: { "metadata.amount": 1 } },
          { key: { "metadata.currency": 1 } },
        ]);

      // Sessions collection indexes
      await db
        .collection("sessions")
        .createIndexes([
          { key: { sessionId: 1 }, options: { unique: true } },
          { key: { userId: 1 } },
          { key: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },
          { key: { createdAt: 1 } },
        ]);

      console.log("Database indexes created successfully");
    } catch (error) {
      console.error("Failed to create database indexes:", error);
      throw error;
    }
  }

  /**
   * Initialize database with collections and indexes
   */
  async initialize() {
    try {
      await this.connect();
      await this.createIndexes();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

module.exports = {
  DatabaseManager,
  dbManager,
  ObjectId,
};
