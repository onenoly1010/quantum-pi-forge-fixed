-- Quantum Pi Forge Database Migration Template
-- Migration: 001_create_base_tables
-- Description: Creates base schema for Quantum Pi Forge
-- Database: PostgreSQL / MySQL / SQLite
-- Created: 2025-12-10

-- For PostgreSQL:
-- \i db/migrations/001_create_base_tables.sql

-- For MySQL:
-- source db/migrations/001_create_base_tables.sql;

-- For SQLite:
-- .read db/migrations/001_create_base_tables.sql

-- ============================================
-- User & Authentication Tables
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Deployment & Configuration Tables
-- ============================================

CREATE TABLE IF NOT EXISTS deployments (
  id SERIAL PRIMARY KEY,
  deployment_name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, success, failed, rolled_back
  deployed_at TIMESTAMP,
  deployed_by_user_id INTEGER REFERENCES users(id),
  commit_hash VARCHAR(40),
  branch VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deployment_logs (
  id SERIAL PRIMARY KEY,
  deployment_id INTEGER NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  log_level VARCHAR(20), -- DEBUG, INFO, WARN, ERROR
  message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Cost & Monitoring Tables
-- ============================================

CREATE TABLE IF NOT EXISTS cost_logs (
  id SERIAL PRIMARY KEY,
  service VARCHAR(255) NOT NULL,
  unit_type VARCHAR(50),
  quantity DECIMAL(10, 2),
  unit_cost DECIMAL(10, 6),
  total_cost DECIMAL(10, 2),
  week INTEGER,
  year INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_checks (
  id SERIAL PRIMARY KEY,
  check_name VARCHAR(255) NOT NULL,
  status VARCHAR(50), -- healthy, degraded, unhealthy
  checks_passed INTEGER,
  checks_total INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Indices for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_id ON deployment_logs(deployment_id);
CREATE INDEX IF NOT EXISTS idx_cost_logs_week_year ON cost_logs(week, year);
CREATE INDEX IF NOT EXISTS idx_health_checks_timestamp ON health_checks(timestamp);

-- Migration complete
