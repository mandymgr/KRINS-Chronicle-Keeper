-- KRINS Chronicle Keeper Database Schema with pgvector
-- Advanced organizational intelligence platform with decision management

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

-- Projects/Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    repository_url TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System components within organizations
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(500),
    component_type VARCHAR(50) NOT NULL, -- 'frontend', 'backend', 'database', 'infrastructure', 'ai-system'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, path)
);

-- ADRs (Architecture Decision Records) - Core of Chronicle Keeper
CREATE TABLE adrs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    component_id UUID REFERENCES components(id) ON DELETE SET NULL,
    number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'proposed', 'accepted', 'rejected', 'superseded'
    problem_statement TEXT NOT NULL,
    alternatives JSONB NOT NULL, -- Array of alternatives considered
    decision TEXT NOT NULL,
    rationale TEXT,
    evidence JSONB, -- Before/after metrics, links, etc.
    consequences TEXT, -- Expected outcomes and trade-offs
    author_id UUID REFERENCES users(id),
    reviewers UUID[], -- Array of reviewer user IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    superseded_by UUID REFERENCES adrs(id),
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_to TIMESTAMP WITH TIME ZONE,
    embedding VECTOR(1536), -- OpenAI embedding for semantic search
    confidence_score DECIMAL(3,2), -- AI-computed confidence 0.00-1.00
    complexity_score DECIMAL(3,2), -- AI-computed complexity 0.00-1.00
    actionability_score DECIMAL(3,2), -- AI-computed actionability 0.00-1.00
    UNIQUE(organization_id, number)
);

-- Patterns library - Multi-language code patterns
CREATE TABLE patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'architectural', 'design', 'security', 'performance', 'typescript', 'python', 'java'
    description TEXT NOT NULL,
    when_to_use TEXT NOT NULL,
    when_not_to_use TEXT NOT NULL,
    context_tags TEXT[], -- '@cloud', '@onprem', '@PII', '@typescript', etc.
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
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100), -- 'incident-response', 'maintenance', 'troubleshooting'
    description TEXT,
    trigger_conditions TEXT[], -- What situations trigger this runbook
    steps JSONB NOT NULL, -- Step-by-step procedures
    escalation_path JSONB, -- Who to contact, when to escalate
    slo_targets JSONB, -- Expected resolution times, success criteria
    prerequisites TEXT[],
    last_used TIMESTAMP WITH TIME ZONE,
    success_rate DECIMAL(5,2), -- Percentage of successful executions
    avg_resolution_time INTERVAL, -- Average time to complete
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding VECTOR(1536)
);

-- Decision relationships and provenance - Advanced linking system
CREATE TABLE decision_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_adr_id UUID REFERENCES adrs(id) ON DELETE CASCADE,
    to_adr_id UUID REFERENCES adrs(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'supersedes', 'depends_on', 'conflicts_with', 'implements', 'influences'
    description TEXT,
    strength DECIMAL(3,2) DEFAULT 1.0, -- Relationship strength 0.00-1.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_adr_id, to_adr_id, relationship_type)
);

-- Evidence collection for decision tracking
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adr_id UUID REFERENCES adrs(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL, -- 'metric', 'document', 'measurement', 'feedback'
    name VARCHAR(255) NOT NULL,
    value_before JSONB, -- Metrics before decision implementation
    value_after JSONB, -- Metrics after decision implementation
    measurement_date TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(255), -- Tool/system that provided the evidence
    confidence DECIMAL(3,2) DEFAULT 1.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern usage tracking
CREATE TABLE pattern_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    adr_id UUID REFERENCES adrs(id) ON DELETE CASCADE,
    usage_context TEXT,
    outcome VARCHAR(50), -- 'success', 'failure', 'partial'
    feedback TEXT,
    metrics JSONB, -- Performance impact, effort required, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decision analytics and insights
CREATE TABLE decision_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adr_id UUID REFERENCES adrs(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4),
    metric_unit VARCHAR(50),
    measurement_date TIMESTAMP WITH TIME ZONE NOT NULL,
    trend VARCHAR(20), -- 'improving', 'stable', 'degrading'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history and analytics
CREATE TABLE search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    query_embedding VECTOR(1536),
    search_type VARCHAR(50), -- 'adr', 'pattern', 'runbook', 'semantic'
    results_found INTEGER,
    clicked_result_id UUID, -- Which result was actually useful
    satisfaction_rating INTEGER, -- 1-5 rating
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI context generation logs
CREATE TABLE ai_context_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    context_type VARCHAR(50), -- 'code-generation', 'architecture-review', 'decision-support'
    query TEXT NOT NULL,
    context_generated TEXT NOT NULL,
    adrs_referenced UUID[],
    patterns_referenced UUID[],
    quality_score DECIMAL(3,2),
    used_by VARCHAR(100), -- 'claude-code', 'universe-builder', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_adrs_organization_id ON adrs(organization_id);
CREATE INDEX idx_adrs_component_id ON adrs(component_id);
CREATE INDEX idx_adrs_embedding ON adrs USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_adrs_status ON adrs(status);
CREATE INDEX idx_adrs_valid_period ON adrs(valid_from, valid_to);
CREATE INDEX idx_adrs_scores ON adrs(confidence_score, complexity_score, actionability_score);

CREATE INDEX idx_patterns_category ON patterns(category);
CREATE INDEX idx_patterns_status ON patterns(status);
CREATE INDEX idx_patterns_context_tags ON patterns USING GIN(context_tags);
CREATE INDEX idx_patterns_embedding ON patterns USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_runbooks_organization_id ON runbooks(organization_id);
CREATE INDEX idx_runbooks_category ON runbooks(category);
CREATE INDEX idx_runbooks_embedding ON runbooks USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_evidence_adr_id ON evidence(adr_id);
CREATE INDEX idx_evidence_type_date ON evidence(evidence_type, measurement_date);

CREATE INDEX idx_decision_links_from_adr ON decision_links(from_adr_id);
CREATE INDEX idx_decision_links_to_adr ON decision_links(to_adr_id);

CREATE INDEX idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX idx_search_queries_organization_id ON search_queries(organization_id);
CREATE INDEX idx_search_queries_embedding ON search_queries USING ivfflat (query_embedding vector_cosine_ops);

-- Functions for semantic search
CREATE OR REPLACE FUNCTION search_similar_adrs(
    query_embedding VECTOR(1536),
    organization_id_filter UUID DEFAULT NULL,
    similarity_threshold FLOAT DEFAULT 0.7,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    adr_id UUID,
    title VARCHAR(500),
    similarity FLOAT,
    organization_id UUID,
    component_id UUID,
    status VARCHAR(50),
    confidence_score DECIMAL(3,2),
    complexity_score DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        1 - (a.embedding <=> query_embedding) AS similarity,
        a.organization_id,
        a.component_id,
        a.status,
        a.confidence_score,
        a.complexity_score
    FROM adrs a
    WHERE 
        (organization_id_filter IS NULL OR a.organization_id = organization_id_filter)
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

-- Function for decision analytics
CREATE OR REPLACE FUNCTION get_decision_effectiveness(adr_id_param UUID)
RETURNS TABLE (
    effectiveness_score DECIMAL(5,2),
    evidence_count INTEGER,
    positive_evidence INTEGER,
    negative_evidence INTEGER,
    trend VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    WITH evidence_summary AS (
        SELECT 
            COUNT(*) as total_evidence,
            SUM(CASE WHEN e.confidence >= 0.7 THEN 1 ELSE 0 END) as positive_count,
            SUM(CASE WHEN e.confidence < 0.3 THEN 1 ELSE 0 END) as negative_count,
            AVG(e.confidence) as avg_confidence
        FROM evidence e
        WHERE e.adr_id = adr_id_param
    ),
    analytics_trend AS (
        SELECT 
            CASE 
                WHEN AVG(da.metric_value) > LAG(AVG(da.metric_value)) OVER (ORDER BY DATE_TRUNC('month', da.measurement_date)) 
                THEN 'improving'
                WHEN AVG(da.metric_value) = LAG(AVG(da.metric_value)) OVER (ORDER BY DATE_TRUNC('month', da.measurement_date)) 
                THEN 'stable'
                ELSE 'degrading'
            END as trend_direction
        FROM decision_analytics da
        WHERE da.adr_id = adr_id_param
        AND da.measurement_date >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', da.measurement_date)
        ORDER BY DATE_TRUNC('month', da.measurement_date) DESC
        LIMIT 1
    )
    SELECT 
        COALESCE(es.avg_confidence * 100, 0.0)::DECIMAL(5,2),
        COALESCE(es.total_evidence, 0)::INTEGER,
        COALESCE(es.positive_count, 0)::INTEGER,
        COALESCE(es.negative_count, 0)::INTEGER,
        COALESCE(at.trend_direction, 'unknown')::VARCHAR(20)
    FROM evidence_summary es
    CROSS JOIN analytics_trend at;
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

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adrs_updated_at BEFORE UPDATE ON adrs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_runbooks_updated_at BEFORE UPDATE ON runbooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO users (username, email, password_hash) VALUES 
('admin', 'admin@krins-chronicle.com', '$2b$12$dummy_hash_for_development'),
('krin', 'krin@krins-chronicle.com', '$2b$12$dummy_hash_for_development');

INSERT INTO organizations (name, description, owner_id) VALUES 
('KRINS Chronicle Keeper', 'Advanced organizational intelligence platform with AI-powered decision management', 
 (SELECT id FROM users WHERE username = 'admin'));

-- Sample patterns for organizational intelligence
INSERT INTO patterns (name, category, description, when_to_use, when_not_to_use, context_tags, author_id) VALUES 
(
    'ADR-Driven Architecture',
    'architectural',
    'Systematic approach to capturing and tracking architectural decisions with evidence collection',
    'When making significant architectural choices that affect multiple team members or future development',
    'For trivial implementation details or temporary solutions',
    ARRAY['@organizational-intelligence', '@decision-management', '@documentation'],
    (SELECT id FROM users WHERE username = 'admin')
),
(
    'Evidence-Based Decision Making',
    'organizational',
    'Collection and analysis of metrics before and after architectural decisions',
    'When implementing changes that can be measured and validated over time',
    'For decisions where measurement is impractical or unnecessary',
    ARRAY['@metrics', '@validation', '@organizational-intelligence'],
    (SELECT id FROM users WHERE username = 'admin')
),
(
    'AI Context Provider Pattern',
    'ai-integration',
    'Systematic provision of organizational context to AI development systems',
    'When AI systems need rich organizational context for decision making or code generation',
    'For simple AI tasks that do not require organizational context',
    ARRAY['@ai-integration', '@context', '@automation'],
    (SELECT id FROM users WHERE username = 'admin')
);

-- Sample runbooks
INSERT INTO runbooks (organization_id, title, category, description, trigger_conditions, steps, escalation_path, slo_targets, author_id) VALUES
(
    (SELECT id FROM organizations WHERE name = 'KRINS Chronicle Keeper'),
    'ADR Review Process',
    'maintenance',
    'Standard process for reviewing and approving Architecture Decision Records',
    ARRAY['New ADR created', 'ADR status change requested', 'Quarterly ADR review'],
    '[
        {"step": 1, "action": "Review ADR for completeness", "expected_duration": "15 minutes"},
        {"step": 2, "action": "Validate alternatives were considered", "expected_duration": "10 minutes"},
        {"step": 3, "action": "Check evidence collection plan", "expected_duration": "10 minutes"},
        {"step": 4, "action": "Approve or request changes", "expected_duration": "5 minutes"}
    ]'::jsonb,
    '{"primary": "team-lead", "secondary": "architect", "escalation_threshold": "24 hours"}'::jsonb,
    '{"review_time": "30 minutes", "response_time": "4 hours"}'::jsonb,
    (SELECT id FROM users WHERE username = 'admin')
);

-- Comments
COMMENT ON DATABASE postgres IS 'KRINS Chronicle Keeper - Advanced Organizational Intelligence Platform';
COMMENT ON TABLE adrs IS 'Architecture Decision Records with AI-enhanced semantic search and analytics';
COMMENT ON TABLE patterns IS 'Multi-language development patterns with organizational intelligence';
COMMENT ON TABLE runbooks IS 'Operational procedures for organizational processes';
COMMENT ON TABLE evidence IS 'Evidence collection system for decision validation';
COMMENT ON TABLE decision_links IS 'Advanced decision relationship tracking';
COMMENT ON COLUMN adrs.embedding IS 'Vector embedding for semantic search using OpenAI text-embedding-3-small';
COMMENT ON COLUMN adrs.confidence_score IS 'AI-computed confidence in decision quality';
COMMENT ON COLUMN adrs.complexity_score IS 'AI-computed complexity assessment';
COMMENT ON COLUMN adrs.actionability_score IS 'AI-computed actionability rating';