#!/bin/bash
set -e

# Quantum Pi Forge — Database Migration Manager
# Handles schema changes, seeding, and rollback

MIGRATIONS_DIR="db/migrations"
MIGRATION_LOG=".agent/logs/migrations.json"

# Initialize migration log
if [ ! -f "$MIGRATION_LOG" ]; then
  mkdir -p "$(dirname "$MIGRATION_LOG")"
  echo "[]" > "$MIGRATION_LOG"
fi

# List available migrations
list_migrations() {
  if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "[INFO] No migrations directory found at $MIGRATIONS_DIR"
    return
  fi

  echo "[MIGRATIONS] Available migrations:"
  ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null || echo "  (none)"
}

# Run pending migrations
run_migrations() {
  local db_type="${1:-postgres}"  # postgres, mysql, sqlite
  local connection_string="${2:-$DATABASE_URL}"

  if [ -z "$connection_string" ]; then
    echo "[ERROR] DATABASE_URL not set"
    return 1
  fi

  if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "[WARN] No migrations directory found. Skipping."
    return 0
  fi

  echo "[MIGRATIONS] Running pending migrations for $db_type..."

  # Track which migrations have run
  local migration_history=$(cat "$MIGRATION_LOG")

  for migration_file in "$MIGRATIONS_DIR"/*.sql; do
    [ -e "$migration_file" ] || continue

    local migration_name=$(basename "$migration_file")
    local migration_hash=$(md5sum "$migration_file" | cut -d' ' -f1)

    # Check if already applied
    if echo "$migration_history" | grep -q "$migration_name"; then
      echo "[SKIP] $migration_name (already applied)"
      continue
    fi

    echo "[APPLY] $migration_name..."

    case "$db_type" in
      postgres)
        psql "$connection_string" -f "$migration_file" || {
          echo "[ERROR] Migration $migration_name failed"
          return 1
        }
        ;;
      mysql)
        mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" "$DB_NAME" < "$migration_file" || {
          echo "[ERROR] Migration $migration_name failed"
          return 1
        }
        ;;
      sqlite)
        sqlite3 "$connection_string" < "$migration_file" || {
          echo "[ERROR] Migration $migration_name failed"
          return 1
        }
        ;;
      *)
        echo "[ERROR] Unsupported database type: $db_type"
        return 1
        ;;
    esac

    # Log successful migration
    local log_entry="{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"migration\":\"$migration_name\",\"hash\":\"$migration_hash\",\"status\":\"applied\"}"
    jq ". += [$log_entry]" "$MIGRATION_LOG" > "$MIGRATION_LOG.tmp" && mv "$MIGRATION_LOG.tmp" "$MIGRATION_LOG"
    echo "[DONE] $migration_name"
  done

  echo "[MIGRATIONS] All pending migrations completed"
}

# Seed database with initial data
seed_database() {
  local db_type="${1:-postgres}"
  local seed_file="${2:-db/seed.sql}"
  local connection_string="${3:-$DATABASE_URL}"

  if [ ! -f "$seed_file" ]; then
    echo "[WARN] Seed file not found: $seed_file"
    return 0
  fi

  echo "[SEED] Seeding database from $seed_file..."

  case "$db_type" in
    postgres)
      psql "$connection_string" -f "$seed_file" || return 1
      ;;
    mysql)
      mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" "$DB_NAME" < "$seed_file" || return 1
      ;;
    sqlite)
      sqlite3 "$connection_string" < "$seed_file" || return 1
      ;;
    *)
      echo "[ERROR] Unsupported database type: $db_type"
      return 1
      ;;
  esac

  echo "[SEED] Database seeded successfully"
}

# Rollback last migration
rollback_migration() {
  local db_type="${1:-postgres}"
  local connection_string="${2:-$DATABASE_URL}"

  if [ ! -f "$MIGRATION_LOG" ]; then
    echo "[WARN] No migration history found"
    return 0
  fi

  local last_migration=$(jq -r '.[-1].migration' "$MIGRATION_LOG")
  local rollback_file="$MIGRATIONS_DIR/${last_migration%.sql}.rollback.sql"

  if [ ! -f "$rollback_file" ]; then
    echo "[ERROR] Rollback script not found: $rollback_file"
    return 1
  fi

  echo "[ROLLBACK] Rolling back $last_migration..."

  case "$db_type" in
    postgres)
      psql "$connection_string" -f "$rollback_file" || return 1
      ;;
    mysql)
      mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" "$DB_NAME" < "$rollback_file" || return 1
      ;;
    sqlite)
      sqlite3 "$connection_string" < "$rollback_file" || return 1
      ;;
    *)
      echo "[ERROR] Unsupported database type: $db_type"
      return 1
      ;;
  esac

  # Remove from history
  jq 'del(.[-1])' "$MIGRATION_LOG" > "$MIGRATION_LOG.tmp" && mv "$MIGRATION_LOG.tmp" "$MIGRATION_LOG"
  echo "[DONE] Rollback complete"
}

# Get migration status
migration_status() {
  if [ ! -f "$MIGRATION_LOG" ]; then
    echo "[INFO] No migrations have been applied"
    return
  fi

  echo "[MIGRATIONS] Applied:"
  jq -r '.[] | "\(.timestamp) - \(.migration)"' "$MIGRATION_LOG"
}

# Export functions
export -f list_migrations
export -f run_migrations
export -f seed_database
export -f rollback_migration
export -f migration_status
