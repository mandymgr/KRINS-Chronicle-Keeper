-- Dev Memory OS Database Schema with pgvector
-- This script sets up PostgreSQL with pgvector extension for semantic search

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
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
CREATE TABLE components (
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

-- ADRs (Architecture Decision Records)
CREATE TABLE adrs (
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
    embedding VECTOR(1536), -- OpenAI embedding dimension
    UNIQUE(project_id, number)
);

-- Patterns library
CREATE TABLE patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
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
    embedding VECTOR(1536)
);

-- Runbooks for operational procedures
CREATE TABLE runbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    trigger_conditions TEXT[], -- What situations trigger this runbook
    steps JSONB NOT NULL, -- Step-by-step procedures
    escalation_path JSONB, -- Who to contact, when to escalate
    slo_targets JSONB, -- Expected resolution times, success criteria
    last_used TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(5,2), -- Percentage of successful executions
    avg_resolution_time INTERVAL, -- Average time to complete
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding VECTOR(1536)
);

-- Messages/Chat for real-time communication
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'file', 'image', 'code'
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    thread_id UUID, -- For organizing conversations
    reply_to UUID REFERENCES messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding VECTOR(1536) -- For semantic search of conversations
);

-- Knowledge artifacts (files, documents, diagrams)
CREATE TABLE knowledge_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    artifact_type VARCHAR(100), -- 'document', 'diagram', 'code', 'screenshot'
    content TEXT, -- Extracted text content for search
    file_url TEXT,
    file_path VARCHAR(1000),
    metadata JSONB, -- File size, format, author, etc.
    tags TEXT[],
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding VECTOR(1536)
);

-- Decision relationships and provenance
CREATE TABLE decision_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_adr_id UUID REFERENCES adrs(id) ON DELETE CASCADE,
    to_adr_id UUID REFERENCES adrs(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'supersedes', 'depends_on', 'conflicts_with', 'implements'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_adr_id, to_adr_id, relationship_type)
);

-- Pattern usage tracking
CREATE TABLE pattern_usage (
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

-- Search history and analytics
CREATE TABLE search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    query_embedding VECTOR(1536),
    results_found INTEGER,
    clicked_result_id UUID, -- Which result was actually useful
    satisfaction_rating INTEGER, -- 1-5 rating
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incidents and post-mortems
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'closed'
    root_cause TEXT,
    resolution TEXT,
    runbook_id UUID REFERENCES runbooks(id),
    lessons_learned TEXT[],
    action_items JSONB,
    reporter_id UUID REFERENCES users(id),
    assignee_id UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding VECTOR(1536)
);

-- Indexes for performance
CREATE INDEX idx_adrs_project_id ON adrs(project_id);
CREATE INDEX idx_adrs_component_id ON adrs(component_id);
CREATE INDEX idx_adrs_embedding ON adrs USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_adrs_status ON adrs(status);
CREATE INDEX idx_adrs_valid_period ON adrs(valid_from, valid_to);

CREATE INDEX idx_patterns_category ON patterns(category);
CREATE INDEX idx_patterns_status ON patterns(status);
CREATE INDEX idx_patterns_context_tags ON patterns USING GIN(context_tags);
CREATE INDEX idx_patterns_embedding ON patterns USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_embedding ON messages USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_knowledge_artifacts_project_id ON knowledge_artifacts(project_id);
CREATE INDEX idx_knowledge_artifacts_type ON knowledge_artifacts(artifact_type);
CREATE INDEX idx_knowledge_artifacts_tags ON knowledge_artifacts USING GIN(tags);
CREATE INDEX idx_knowledge_artifacts_embedding ON knowledge_artifacts USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX idx_search_queries_project_id ON search_queries(project_id);
CREATE INDEX idx_search_queries_embedding ON search_queries USING ivfflat (query_embedding vector_cosine_ops);

-- Functions for semantic search
CREATE OR REPLACE FUNCTION search_similar_adrs(
    query_embedding VECTOR(1536),
    project_id_filter UUID DEFAULT NULL,
    similarity_threshold FLOAT DEFAULT 0.7,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    adr_id UUID,
    title VARCHAR(500),
    similarity FLOAT,
    project_id UUID,
    component_id UUID,
    status VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        1 - (a.embedding <=> query_embedding) AS similarity,
        a.project_id,
        a.component_id,
        a.status
    FROM adrs a
    WHERE 
        (project_id_filter IS NULL OR a.project_id = project_id_filter)
        AND a.status IN ('accepted', 'proposed')
        AND (1 - (a.embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY a.embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_similar_patterns(
    query_embedding VECTOR(1536),
    context_filter TEXT[] DEFAULT NULL,
    similarity_threshold FLOAT DEFAULT 0.7,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    pattern_id UUID,
    name VARCHAR(255),
    similarity FLOAT,
    category VARCHAR(100),
    effectiveness_score DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        1 - (p.embedding <=> query_embedding) AS similarity,
        p.category,
        p.effectiveness_score
    FROM patterns p
    WHERE 
        p.status = 'active'
        AND (context_filter IS NULL OR p.context_tags && context_filter)
        AND (1 - (p.embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY p.embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adrs_updated_at BEFORE UPDATE ON adrs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO users (username, email, password_hash) VALUES 
('admin', 'admin@devmemory.os', '$2b$12$dummy_hash_for_development'),
('developer', 'dev@devmemory.os', '$2b$12$dummy_hash_for_development');

INSERT INTO projects (name, description, owner_id) VALUES 
('Dev Memory OS', 'Revolutionary development knowledge management system', 
 (SELECT id FROM users WHERE username = 'admin'));

-- Sample patterns
INSERT INTO patterns (name, category, description, when_to_use, when_not_to_use, context_tags, author_id) VALUES 
(
    'ADR-Driven Development',
    'architectural',
    'Systematic approach to capturing and tracking architectural decisions',
    'When making significant architectural choices that affect multiple team members or future development',
    'For trivial implementation details or temporary solutions',
    ARRAY['@team', '@documentation', '@governance'],
    (SELECT id FROM users WHERE username = 'admin')
),
(
    'Component Library Pattern',
    'design',
    'Reusable UI components with consistent design and behavior',
    'When building user interfaces with repeated patterns and design consistency requirements',
    'For one-off components or prototypes where consistency is not important',
    ARRAY['@frontend', '@react', '@design-system'],
    (SELECT id FROM users WHERE username = 'admin')
);

COMMENT ON DATABASE postgres IS 'Dev Memory OS - Revolutionary AI Development Knowledge Management System';
COMMENT ON TABLE adrs IS 'Architecture Decision Records with semantic search capabilities';
COMMENT ON TABLE patterns IS 'Reusable development patterns with multi-language examples';
COMMENT ON TABLE runbooks IS 'Operational procedures for incident response and maintenance';
COMMENT ON TABLE messages IS 'Real-time chat with searchable history';
COMMENT ON TABLE knowledge_artifacts IS 'Files, diagrams, and documents with semantic indexing';
COMMENT ON COLUMN adrs.embedding IS 'Vector embedding for semantic search using OpenAI text-embedding-ada-002';
COMMENT ON COLUMN patterns.embedding IS 'Vector embedding for pattern matching and recommendations';