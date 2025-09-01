-- Dev Memory OS Database Schema (Without pgvector for initial setup)
-- This script sets up PostgreSQL tables without vector extensions

-- Enable required extensions (that don't require superuser)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    avatar_url TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    repository_url TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Components within projects
CREATE TABLE IF NOT EXISTS components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(500),
    component_type VARCHAR(50) NOT NULL, -- 'frontend', 'backend', 'database', 'infrastructure'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, path)
);

-- ADRs (Architecture Decision Records) - WITHOUT vector column for now
CREATE TABLE IF NOT EXISTS adrs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    component_id UUID REFERENCES components(id) ON DELETE SET NULL,
    number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'proposed', 'accepted', 'rejected', 'superseded'
    problem_statement TEXT NOT NULL,
    alternatives JSONB NOT NULL, -- Array of alternatives considered
    decision TEXT NOT NULL,
    rationale TEXT,
    evidence JSONB, -- Before/after metrics, links, etc.
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    superseded_by UUID REFERENCES adrs(id),
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_to TIMESTAMP WITH TIME ZONE,
    embedding_text TEXT, -- Store combined text for embedding (will be replaced by vector when pgvector is available)
    UNIQUE(project_id, number)
);

-- Patterns library - WITHOUT vector column for now
CREATE TABLE IF NOT EXISTS patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100), -- 'architectural', 'design', 'security', 'performance'
    description TEXT NOT NULL,
    when_to_use TEXT NOT NULL,
    when_not_to_use TEXT NOT NULL,
    context_tags TEXT[], -- '@cloud', '@onprem', '@PII', etc.
    implementation_examples JSONB, -- Multi-language code examples
    anti_patterns JSONB, -- Common mistakes and how to avoid them
    metrics JSONB, -- Performance characteristics, SLO expectations
    security_considerations TEXT,
    author_id UUID REFERENCES users(id),
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'deprecated', 'superseded'
    usage_count INTEGER DEFAULT 0,
    effectiveness_score DECIMAL(3,2), -- 0.00-5.00 based on usage and feedback
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding_text TEXT -- Store combined text for embedding
);

-- Decision relationships and provenance
CREATE TABLE IF NOT EXISTS decision_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_adr_id UUID REFERENCES adrs(id) ON DELETE CASCADE,
    to_adr_id UUID REFERENCES adrs(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'supersedes', 'depends_on', 'conflicts_with', 'implements'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_adr_id, to_adr_id, relationship_type)
);

-- Pattern usage tracking
CREATE TABLE IF NOT EXISTS pattern_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    adr_id UUID REFERENCES adrs(id) ON DELETE CASCADE,
    usage_context TEXT,
    outcome VARCHAR(50), -- 'success', 'failure', 'partial'
    feedback TEXT,
    metrics JSONB, -- Performance impact, effort required, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history and analytics (simplified without vector)
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    results_found INTEGER,
    clicked_result_id UUID, -- Which result was actually useful
    satisfaction_rating INTEGER, -- 1-5 rating
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_adrs_project_id ON adrs(project_id);
CREATE INDEX IF NOT EXISTS idx_adrs_component_id ON adrs(component_id);
CREATE INDEX IF NOT EXISTS idx_adrs_status ON adrs(status);
CREATE INDEX IF NOT EXISTS idx_adrs_valid_period ON adrs(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_adrs_embedding_text ON adrs USING gin(to_tsvector('english', embedding_text));

CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns(category);
CREATE INDEX IF NOT EXISTS idx_patterns_status ON patterns(status);
CREATE INDEX IF NOT EXISTS idx_patterns_context_tags ON patterns USING GIN(context_tags);
CREATE INDEX IF NOT EXISTS idx_patterns_embedding_text ON patterns USING gin(to_tsvector('english', embedding_text));

CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_project_id ON search_queries(project_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_components_updated_at ON components;
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_adrs_updated_at ON adrs;
CREATE TRIGGER update_adrs_updated_at BEFORE UPDATE ON adrs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patterns_updated_at ON patterns;
CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (username, email, password_hash) VALUES 
('admin', 'admin@devmemory.os', '$2b$12$dummy_hash_for_development'),
('developer', 'dev@devmemory.os', '$2b$12$dummy_hash_for_development')
ON CONFLICT (username) DO NOTHING;

INSERT INTO projects (name, description, owner_id) VALUES 
('Dev Memory OS', 'Revolutionary development knowledge management system', 
 (SELECT id FROM users WHERE username = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Sample patterns
INSERT INTO patterns (name, category, description, when_to_use, when_not_to_use, context_tags, author_id, embedding_text) VALUES 
(
    'ADR-Driven Development',
    'architectural',
    'Systematic approach to capturing and tracking architectural decisions',
    'When making significant architectural choices that affect multiple team members or future development',
    'For trivial implementation details or temporary solutions',
    ARRAY['@team', '@documentation', '@governance'],
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    'ADR-Driven Development architectural systematic approach capturing tracking architectural decisions significant choices team members future development'
),
(
    'Component Library Pattern',
    'design',
    'Reusable UI components with consistent design and behavior',
    'When building user interfaces with repeated patterns and design consistency requirements',
    'For one-off components or prototypes where consistency is not important',
    ARRAY['@frontend', '@react', '@design-system'],
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    'Component Library Pattern design reusable UI components consistent design behavior user interfaces repeated patterns design consistency requirements'
)
ON CONFLICT (name) DO NOTHING;

-- Add comments for documentation
COMMENT ON DATABASE dev_memory_os IS 'Dev Memory OS - Revolutionary AI Development Knowledge Management System';
COMMENT ON TABLE adrs IS 'Architecture Decision Records with text-based search capabilities (will be upgraded to semantic search with pgvector)';
COMMENT ON TABLE patterns IS 'Reusable development patterns with multi-language examples';
COMMENT ON COLUMN adrs.embedding_text IS 'Combined text content for full-text search (will be replaced by vector embedding when pgvector is available)';
COMMENT ON COLUMN patterns.embedding_text IS 'Combined text content for pattern matching and recommendations';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Dev Memory OS database initialized successfully (without pgvector)!';
    RAISE NOTICE '📝 To enable full semantic search, install pgvector extension with superuser privileges';
    RAISE NOTICE '🔍 Current setup supports full-text search using PostgreSQL built-in capabilities';
END $$;