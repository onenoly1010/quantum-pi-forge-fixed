#!/bin/bash
# Database initialization script for CI/CD pipeline
# Automatically runs migrations and seeds the database on deployment

set -e

echo "[DB] Initializing database..."

# Source database migration functions
source .agent/scripts/db_migrate.sh

# Determine database type from environment
DB_TYPE="${DATABASE_TYPE:-postgres}"

# Run migrations
echo "[DB] Running migrations..."
run_migrations "$DB_TYPE"

# Seed database (optional, only on first deployment)
if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "[DB] Seeding database..."
  seed_database "$DB_TYPE"
fi

# Show migration status
echo "[DB] Current migration status:"
migration_status

echo "[DB] Database initialization complete"
