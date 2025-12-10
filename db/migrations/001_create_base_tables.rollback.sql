-- Rollback script for 001_create_base_tables migration

DROP TABLE IF EXISTS health_checks;
DROP TABLE IF EXISTS cost_logs;
DROP TABLE IF EXISTS deployment_logs;
DROP TABLE IF EXISTS deployments;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- Rollback complete
