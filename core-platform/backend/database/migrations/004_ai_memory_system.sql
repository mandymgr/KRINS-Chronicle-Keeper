-- AI Memory System - Persistent Storage for All AI Specialists
-- Revolutionary memory persistence for continuous learning

-- Specialist Memory Store - Core memory for each AI specialist
CREATE TABLE ai_specialist_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL,
    specialist_role VARCHAR(50) NOT NULL,
    specialist_name VARCHAR(255) NOT NULL,
    memory_type VARCHAR(50) NOT NULL, -- 'project', 'pattern', 'decision', 'learning', 'collaboration', 'metrics'
    memory_key VARCHAR(255) NOT NULL,
    memory_data JSONB NOT NULL,
    context_tags TEXT[] DEFAULT '{}',
    relevance_score INTEGER DEFAULT 50,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Metrics History - Track specialist performance over time
CREATE TABLE ai_performance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL,
    specialist_role VARCHAR(50) NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 100.00,
    average_response_time INTEGER DEFAULT 0,
    specialty_score INTEGER DEFAULT 95,
    session_id VARCHAR(255),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Learning Records - What specialists learn from each task
CREATE TABLE ai_task_learnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL,
    specialist_role VARCHAR(50) NOT NULL,
    task_id UUID NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    task_description TEXT,
    patterns_applied TEXT[] DEFAULT '{}',
    success BOOLEAN DEFAULT true,
    lessons_learned TEXT[] DEFAULT '{}',
    performance_impact JSONB, -- Before/after metrics
    knowledge_gained TEXT,
    applied_optimizations TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collaboration History - Inter-specialist communication and coordination
CREATE TABLE ai_collaboration_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_specialist_id UUID NOT NULL,
    to_specialist_id UUID,
    from_specialist_role VARCHAR(50) NOT NULL,
    to_specialist_role VARCHAR(50),
    message_type VARCHAR(50) NOT NULL, -- 'coordination', 'question', 'answer', 'collaboration'
    message_content TEXT NOT NULL,
    context_data JSONB,
    response_id UUID REFERENCES ai_collaboration_history(id),
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Patterns and Knowledge Base - Shared knowledge across all specialists
CREATE TABLE ai_pattern_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(100) NOT NULL, -- 'optimization', 'security', 'architecture', 'coordination'
    pattern_description TEXT,
    pattern_implementation JSONB,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    usage_count INTEGER DEFAULT 0,
    contributed_by_specialist VARCHAR(50),
    applicable_roles TEXT[] DEFAULT '{}',
    effectiveness_score INTEGER DEFAULT 50,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Specialist Sessions - Track when specialists are active/inactive
CREATE TABLE ai_specialist_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    specialist_id UUID NOT NULL,
    specialist_role VARCHAR(50) NOT NULL,
    specialist_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'active', 'idle', 'busy', 'offline'
    capabilities TEXT[] DEFAULT '{}',
    startup_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shutdown_time TIMESTAMP,
    total_tasks_completed INTEGER DEFAULT 0,
    session_performance JSONB
);

-- Decision Records - Important decisions made by specialists and team
CREATE TABLE ai_decision_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_title VARCHAR(255) NOT NULL,
    decision_type VARCHAR(100) NOT NULL, -- 'architectural', 'optimization', 'security', 'coordination'
    decision_description TEXT NOT NULL,
    decided_by_specialist VARCHAR(50),
    decision_context JSONB,
    implementation_status VARCHAR(50) DEFAULT 'pending',
    impact_assessment JSONB,
    related_patterns TEXT[] DEFAULT '{}',
    decision_outcome TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    implemented_at TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- Memory Indexes for Performance
CREATE INDEX idx_specialist_memories_specialist_id ON ai_specialist_memories(specialist_id);
CREATE INDEX idx_specialist_memories_type ON ai_specialist_memories(memory_type);
CREATE INDEX idx_specialist_memories_role ON ai_specialist_memories(specialist_role);
CREATE INDEX idx_specialist_memories_accessed ON ai_specialist_memories(last_accessed_at DESC);

CREATE INDEX idx_performance_history_specialist ON ai_performance_history(specialist_id, recorded_at DESC);
CREATE INDEX idx_performance_history_role ON ai_performance_history(specialist_role, recorded_at DESC);

CREATE INDEX idx_task_learnings_specialist ON ai_task_learnings(specialist_id, created_at DESC);
CREATE INDEX idx_task_learnings_type ON ai_task_learnings(task_type);
CREATE INDEX idx_task_learnings_success ON ai_task_learnings(success, created_at DESC);

CREATE INDEX idx_collaboration_history_participants ON ai_collaboration_history(from_specialist_id, to_specialist_id);
CREATE INDEX idx_collaboration_history_session ON ai_collaboration_history(session_id, created_at DESC);
CREATE INDEX idx_collaboration_history_type ON ai_collaboration_history(message_type);

CREATE INDEX idx_pattern_knowledge_type ON ai_pattern_knowledge(pattern_type);
CREATE INDEX idx_pattern_knowledge_usage ON ai_pattern_knowledge(usage_count DESC);
CREATE INDEX idx_pattern_knowledge_effectiveness ON ai_pattern_knowledge(effectiveness_score DESC);

CREATE INDEX idx_specialist_sessions_session ON ai_specialist_sessions(session_id);
CREATE INDEX idx_specialist_sessions_status ON ai_specialist_sessions(status, last_activity_at DESC);

CREATE INDEX idx_decision_records_type ON ai_decision_records(decision_type);
CREATE INDEX idx_decision_records_specialist ON ai_decision_records(decided_by_specialist);
CREATE INDEX idx_decision_records_status ON ai_decision_records(implementation_status);

-- Comments for documentation
COMMENT ON TABLE ai_specialist_memories IS 'Persistent memory store for all AI specialists - enables continuous learning across sessions';
COMMENT ON TABLE ai_performance_history IS 'Historical performance tracking for each specialist over time';
COMMENT ON TABLE ai_task_learnings IS 'Records what each specialist learns from completing tasks';
COMMENT ON TABLE ai_collaboration_history IS 'Complete history of inter-specialist communication and coordination';
COMMENT ON TABLE ai_pattern_knowledge IS 'Shared knowledge base of patterns and best practices discovered by the team';
COMMENT ON TABLE ai_specialist_sessions IS 'Session tracking for specialist availability and activity';
COMMENT ON TABLE ai_decision_records IS 'Important architectural and operational decisions made by the AI team';