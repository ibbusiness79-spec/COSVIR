CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  context TEXT NOT NULL,
  category_type VARCHAR(50) NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  horizon VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decision_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  before_state JSONB,
  after_state JSONB,
  actor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  agent_type VARCHAR(50) NOT NULL,
  analysis TEXT NOT NULL,
  recommendation VARCHAR(30) NOT NULL,
  conditions JSONB NOT NULL,
  risks JSONB NOT NULL,
  confidence INT NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS strategic_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID UNIQUE NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  global_risk_score INT NOT NULL CHECK (global_risk_score BETWEEN 0 AND 100),
  financial_score INT NOT NULL,
  marketing_score INT NOT NULL,
  legal_score INT NOT NULL,
  growth_score INT NOT NULL,
  operational_risk_score INT NOT NULL,
  weighting_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS critical_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  zone_type VARCHAR(150) NOT NULL,
  severity INT NOT NULL CHECK (severity BETWEEN 0 AND 100),
  rationale TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  scenario_type VARCHAR(30) NOT NULL,
  assumptions TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  risk_delta INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  format VARCHAR(20) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(128) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_user_created ON decisions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_decision_agent ON agent_analyses(decision_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_history_decision_created ON decision_history(decision_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_active ON refresh_tokens(user_id) WHERE revoked_at IS NULL;
