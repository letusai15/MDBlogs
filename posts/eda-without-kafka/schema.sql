-- Pattern 2: Postgres events table (outbox pattern)
-- Run this migration once. No new infrastructure required.

CREATE TABLE events (
  id          BIGSERIAL    PRIMARY KEY,
  type        TEXT         NOT NULL,
  payload     JSONB        NOT NULL,
  occurred_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  processed   BOOLEAN      NOT NULL DEFAULT false
);

-- Partial index: only unprocessed rows — keeps the polling query fast
CREATE INDEX ON events (processed, occurred_at) WHERE NOT processed;

-- Consumer query (background job, runs on a schedule):
-- FOR UPDATE SKIP LOCKED lets multiple consumers poll without blocking each other
/*
SELECT id, type, payload
FROM   events
WHERE  NOT processed
ORDER  BY occurred_at
LIMIT  20
FOR UPDATE SKIP LOCKED;
*/
