-- SupportChatbot PostgreSQL Initialization
-- Enables Row-Level Security (RLS) for multi-tenant isolation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================
-- TENANTS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- USERS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member', 'viewer'
    clerk_user_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);

-- ============================
-- API KEYS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE, -- SHA-256 hash of the API key
    key_prefix VARCHAR(12) NOT NULL, -- First few chars for display (e.g., "sc_abc123")
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- ============================
-- TENANT SETTINGS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS tenant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    chatbot_name VARCHAR(255) DEFAULT 'Support Bot',
    greeting_text TEXT DEFAULT 'Hi! How can I help you today?',
    placeholder_text VARCHAR(255) DEFAULT 'Type your message...',
    primary_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    logo_url TEXT,
    is_deployed BOOLEAN DEFAULT FALSE,
    deployed_at TIMESTAMPTZ,
    custom_css TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id)
);

-- ============================
-- DOCUMENTS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    storage_path TEXT, -- Path in object storage or local filesystem
    ingestion_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    ingestion_error TEXT,
    chunk_count INT DEFAULT 0,
    qdrant_collection_name VARCHAR(255), -- Stores the Qdrant collection name for this tenant
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_ingestion_status ON documents(ingestion_status);

-- ============================
-- CHAT LOGS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_identifier VARCHAR(255), -- End-user ID from the widget (can be anonymous)
    session_id VARCHAR(255),
    messages JSONB NOT NULL, -- Array of {role, content, timestamp}
    token_usage INT,
    model_used VARCHAR(100),
    latency_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_logs_tenant_id ON chat_logs(tenant_id);
CREATE INDEX idx_chat_logs_created_at ON chat_logs(created_at DESC);

-- ============================
-- METRICS TABLE (Aggregated daily metrics)
-- ============================
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_chats INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    total_api_calls INT DEFAULT 0,
    avg_latency_ms FLOAT DEFAULT 0,
    documents_ingested INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, date)
);

CREATE INDEX idx_metrics_tenant_date ON metrics(tenant_id, date);

-- ============================
-- EMBED TOKENS TABLE (Short-lived tokens for embeddable widget)
-- ============================
CREATE TABLE IF NOT EXISTS embed_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    domain_restriction VARCHAR(255), -- Optional: restrict to specific domain
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embed_tokens_tenant_id ON embed_tokens(tenant_id);
CREATE INDEX idx_embed_tokens_token_hash ON embed_tokens(token_hash);

-- ============================
-- ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE embed_tokens ENABLE ROW LEVEL SECURITY;

-- ============================
-- RLS POLICIES (Tenant Isolation)
-- All policies enforce: rows where tenant_id = current_setting('app.current_tenant_id')
-- ============================

-- Users policies
CREATE POLICY tenant_isolation_users ON users
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- API keys policies
CREATE POLICY tenant_isolation_api_keys ON api_keys
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Tenant settings policies
CREATE POLICY tenant_isolation_tenant_settings ON tenant_settings
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Documents policies
CREATE POLICY tenant_isolation_documents ON documents
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Chat logs policies
CREATE POLICY tenant_isolation_chat_logs ON chat_logs
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Metrics policies
CREATE POLICY tenant_isolation_metrics ON metrics
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Embed tokens policies
CREATE POLICY tenant_isolation_embed_tokens ON embed_tokens
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ============================
-- HELPER FUNCTION: Set tenant context
-- ============================
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_id::TEXT, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- SAMPLE DATA (Optional - for testing)
-- ============================
-- Insert a sample tenant for development
INSERT INTO tenants (name, slug) VALUES ('Demo Tenant', 'demo')
    ON CONFLICT (slug) DO NOTHING;

-- ============================
-- COMMENTS FOR DOCUMENTATION
-- ============================
COMMENT ON TABLE tenants IS 'Multi-tenant organizations';
COMMENT ON TABLE users IS 'Users belonging to tenants, linked to Clerk';
COMMENT ON TABLE api_keys IS 'API keys scoped to tenants, hashed at rest';
COMMENT ON TABLE tenant_settings IS 'Chatbot customization and deployment settings per tenant';
COMMENT ON TABLE documents IS 'Uploaded documents pending or completed ingestion to Qdrant';
COMMENT ON TABLE chat_logs IS 'All end-user chat interactions for tenant dashboards';
COMMENT ON TABLE metrics IS 'Daily aggregated metrics per tenant';
COMMENT ON TABLE embed_tokens IS 'Short-lived tokens for embeddable widget authentication';
COMMENT ON FUNCTION set_tenant_context(UUID) IS 'Sets the current tenant context for RLS enforcement';
