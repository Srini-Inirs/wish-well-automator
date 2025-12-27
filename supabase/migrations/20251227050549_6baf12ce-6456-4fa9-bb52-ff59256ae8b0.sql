-- Recreate pg_net extension under the recommended schema (fix linter: extension in public)
-- NOTE: pg_net does not support ALTER EXTENSION ... SET SCHEMA, so we recreate it.
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION pg_net WITH SCHEMA extensions;