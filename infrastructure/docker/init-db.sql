-- DataFlow AI — PostgreSQL init script
-- Enables required extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- vector extension for AI embeddings (Phase 2+)
-- CREATE EXTENSION IF NOT EXISTS vector;
