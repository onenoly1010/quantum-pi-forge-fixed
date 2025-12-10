-- Seed script for initial database data
-- Run after migrations: db_migrate.sh seed db/seed.sql

-- Sample user (default credentials - CHANGE IN PRODUCTION)
INSERT INTO users (username, email, password_hash) 
VALUES ('admin', 'admin@quantum-pi-forge.local', 'bcrypt_hash_placeholder') 
ON CONFLICT DO NOTHING;

-- Sample deployment
INSERT INTO deployments (deployment_name, version, status, commit_hash, branch) 
VALUES ('Initial Deploy', '1.0.0', 'success', 'abc1234567890', 'main') 
ON CONFLICT DO NOTHING;

-- Seed complete
