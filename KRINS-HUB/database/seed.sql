-- Seed data for Dev Memory OS development and testing

-- Insert sample projects
INSERT INTO projects (id, name, description, repository_url, owner_id) VALUES 
(
    uuid_generate_v4(),
    'Chat Application',
    'Real-time chat application with WebSocket support, file upload, and user presence',
    'https://github.com/example/chat-app',
    (SELECT id FROM users WHERE username = 'admin')
),
(
    uuid_generate_v4(),
    'E-commerce Platform',
    'Full-stack e-commerce platform with payment integration and inventory management',
    'https://github.com/example/ecommerce',
    (SELECT id FROM users WHERE username = 'developer')
);

-- Insert components for projects
INSERT INTO components (project_id, name, path, component_type, description) VALUES 
-- Chat App components
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    'Frontend React App',
    'src/frontend',
    'frontend',
    'React TypeScript application with real-time chat interface'
),
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    'WebSocket Server',
    'src/backend/websocket',
    'backend',
    'Node.js WebSocket server handling real-time messaging'
),
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    'File Upload Service',
    'src/backend/upload',
    'backend',
    'File upload and storage service with MinIO integration'
),
-- E-commerce components
(
    (SELECT id FROM projects WHERE name = 'E-commerce Platform'),
    'Product Catalog API',
    'src/api/products',
    'backend',
    'REST API for product management and search'
),
(
    (SELECT id FROM projects WHERE name = 'E-commerce Platform'),
    'Payment Service',
    'src/services/payment',
    'backend',
    'Payment processing with Stripe integration'
);

-- Sample ADRs with realistic content
INSERT INTO adrs (
    project_id,
    component_id,
    number,
    title,
    status,
    problem_statement,
    alternatives,
    decision,
    rationale,
    evidence,
    author_id
) VALUES 
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    (SELECT id FROM components WHERE name = 'Frontend React App'),
    1,
    'Choose WebSocket library for real-time communication',
    'accepted',
    'Need reliable real-time bidirectional communication between client and server for chat messages, user presence, and typing indicators.',
    '[
        {
            "name": "Socket.IO",
            "pros": ["Automatic fallback to polling", "Built-in rooms/namespaces", "Large community"],
            "cons": ["Larger bundle size", "More complex than needed"],
            "effort": "Low"
        },
        {
            "name": "Native WebSocket",
            "pros": ["Lightweight", "Standard browser API", "Full control"],
            "cons": ["No automatic fallback", "Manual reconnection logic", "No room concept"],
            "effort": "Medium"
        },
        {
            "name": "ws library",
            "pros": ["Simple", "Fast", "Small footprint"],
            "cons": ["Node.js only", "Manual client implementation", "No fallback"],
            "effort": "High"
        }
    ]',
    'Use Socket.IO for both client and server implementation',
    'Socket.IO provides the best developer experience with automatic fallbacks and built-in reconnection. The bundle size increase (~45KB gzipped) is acceptable for our use case. Room functionality will simplify multi-chat support in the future.',
    '{
        "before": {
            "bundle_size": "340KB",
            "development_time": "Unknown"
        },
        "after": {
            "bundle_size": "385KB",
            "development_time": "2 days",
            "reliability": "99.9%"
        },
        "links": {
            "pr": "#123",
            "benchmark": "https://socketio-benchmark.com",
            "documentation": "/docs/websocket-integration.md"
        }
    }',
    (SELECT id FROM users WHERE username = 'admin')
),
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    (SELECT id FROM components WHERE name = 'File Upload Service'),
    2,
    'File storage solution for chat attachments',
    'accepted',
    'Users need to share files, images, and documents in chat. Need scalable storage with CDN capabilities and reasonable costs.',
    '[
        {
            "name": "AWS S3",
            "pros": ["Highly scalable", "CDN integration", "Enterprise proven"],
            "cons": ["Cost for small scale", "AWS lock-in", "Complex pricing"],
            "estimated_cost": "$50-200/month"
        },
        {
            "name": "MinIO (self-hosted)",
            "pros": ["S3-compatible", "Cost effective", "Full control"],
            "cons": ["Operational overhead", "Need backup strategy", "Scaling complexity"],
            "estimated_cost": "$20/month"
        },
        {
            "name": "Supabase Storage",
            "pros": ["Simple integration", "Good pricing", "Built-in optimization"],
            "cons": ["Less mature", "Vendor lock-in", "Limited customization"],
            "estimated_cost": "$30-80/month"
        }
    ]',
    'Implement MinIO with S3-compatible API for development, easy migration to AWS S3 for production',
    'MinIO provides S3 compatibility allowing future migration while keeping costs low during development. Docker deployment simplifies local development setup.',
    '{
        "before": {
            "storage_cost": "$0",
            "deployment_complexity": "Low"
        },
        "after": {
            "storage_cost": "$20/month estimated",
            "deployment_complexity": "Medium",
            "migration_path": "S3-compatible API enables cloud migration"
        },
        "links": {
            "pr": "#145",
            "deployment_guide": "/docs/minio-setup.md"
        }
    }',
    (SELECT id FROM users WHERE username = 'admin')
),
(
    (SELECT id FROM projects WHERE name = 'E-commerce Platform'),
    (SELECT id FROM components WHERE name = 'Payment Service'),
    1,
    'Payment processing provider selection',
    'accepted',
    'Need secure, reliable payment processing with support for multiple payment methods and international transactions.',
    '[
        {
            "name": "Stripe",
            "pros": ["Excellent developer experience", "Global support", "Strong security"],
            "cons": ["2.9% + 30¢ per transaction", "US-focused initially"],
            "integration_effort": "1-2 weeks"
        },
        {
            "name": "PayPal",
            "pros": ["Widely trusted", "Easy customer adoption", "Good international support"],
            "cons": ["Limited customization", "Higher fees for small transactions", "Complex API"],
            "integration_effort": "2-3 weeks"
        },
        {
            "name": "Square",
            "pros": ["Good for physical + online", "Competitive rates", "Good tooling"],
            "cons": ["Less international support", "Smaller ecosystem", "Limited advanced features"],
            "integration_effort": "1-2 weeks"
        }
    ]',
    'Implement Stripe as primary payment processor with PayPal as secondary option',
    'Stripe offers the best developer experience and security features. Starting with Stripe reduces implementation time while PayPal addition later provides customer choice.',
    '{
        "before": {
            "payment_methods": 0,
            "security_compliance": "None"
        },
        "after": {
            "payment_methods": "Credit cards, Apple Pay, Google Pay",
            "security_compliance": "PCI DSS Level 1",
            "transaction_fees": "2.9% + 30¢",
            "estimated_revenue_impact": "+15-25%"
        },
        "links": {
            "stripe_docs": "https://stripe.com/docs",
            "security_audit": "/docs/security/payment-security-review.md"
        }
    }',
    (SELECT id FROM users WHERE username = 'developer')
);

-- Sample runbooks
INSERT INTO runbooks (
    project_id,
    title,
    description,
    trigger_conditions,
    steps,
    escalation_path,
    slo_targets,
    author_id
) VALUES 
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    'WebSocket Connection Issues Troubleshooting',
    'Steps to diagnose and resolve WebSocket connection problems affecting real-time chat',
    ARRAY[
        'Users reporting delayed messages',
        'WebSocket connection failures',
        'High reconnection rates',
        'Monitoring alerts for WebSocket errors'
    ],
    '[
        {
            "step": 1,
            "action": "Check server health and load",
            "commands": [
                "kubectl get pods -n chat-app",
                "kubectl logs -n chat-app deployment/websocket-server --tail=100"
            ],
            "expected_result": "All pods running, no error logs"
        },
        {
            "step": 2,
            "action": "Verify WebSocket endpoint connectivity",
            "commands": [
                "curl -i -N -H \"Connection: Upgrade\" -H \"Upgrade: websocket\" -H \"Sec-WebSocket-Version: 13\" -H \"Sec-WebSocket-Key: SGVsbG8gV29ybGQ=\" http://chat-api.example.com/socket.io/"
            ],
            "expected_result": "HTTP 101 Switching Protocols response"
        },
        {
            "step": 3,
            "action": "Check Redis connection (session storage)",
            "commands": [
                "kubectl exec -it redis-pod -- redis-cli ping",
                "kubectl exec -it redis-pod -- redis-cli info replication"
            ],
            "expected_result": "PONG response, replication status OK"
        },
        {
            "step": 4,
            "action": "Review connection metrics",
            "queries": [
                "websocket_connections_active",
                "websocket_connection_errors_total",
                "websocket_message_latency_p95"
            ],
            "thresholds": {
                "max_connection_errors": 10,
                "max_latency_p95": "500ms"
            }
        },
        {
            "step": 5,
            "action": "If issues persist, restart WebSocket service",
            "commands": [
                "kubectl rollout restart deployment/websocket-server -n chat-app",
                "kubectl rollout status deployment/websocket-server -n chat-app"
            ],
            "rollback_plan": "kubectl rollout undo deployment/websocket-server -n chat-app"
        }
    ]',
    '{
        "level1": {
            "contact": "on-call-engineer@company.com",
            "sla": "15 minutes response"
        },
        "level2": {
            "contact": "senior-engineer@company.com",
            "sla": "30 minutes response"
        },
        "level3": {
            "contact": "tech-lead@company.com",
            "sla": "1 hour response"
        }
    }',
    '{
        "acknowledgment_time": "5 minutes",
        "resolution_time": "30 minutes",
        "success_criteria": [
            "WebSocket connections stable",
            "Message latency < 100ms",
            "Connection error rate < 1%"
        ]
    }',
    (SELECT id FROM users WHERE username = 'admin')
),
(
    (SELECT id FROM projects WHERE name = 'E-commerce Platform'),
    'Payment Processing Failure Recovery',
    'Procedures for handling payment processing failures and ensuring transaction integrity',
    ARRAY[
        'Payment gateway timeout errors',
        'Failed payment notifications',
        'Customer reports payment issues',
        'Stripe webhook failures'
    ],
    '[
        {
            "step": 1,
            "action": "Identify scope of payment issues",
            "queries": [
                "SELECT status, COUNT(*) FROM payments WHERE created_at >= NOW() - INTERVAL \"1 hour\" GROUP BY status",
                "SELECT payment_method, COUNT(*) FROM failed_payments WHERE created_at >= NOW() - INTERVAL \"1 hour\" GROUP BY payment_method"
            ],
            "expected_result": "Failed payment rate < 2%"
        },
        {
            "step": 2,
            "action": "Check Stripe dashboard and API status",
            "external_checks": [
                "https://status.stripe.com/",
                "Stripe Dashboard -> Payments -> Failed payments"
            ]
        },
        {
            "step": 3,
            "action": "Verify webhook endpoint health",
            "commands": [
                "curl -X POST https://api.company.com/webhooks/stripe -H \"Content-Type: application/json\" -d \"{\\\"test\\\": true}\"",
                "kubectl logs -n ecommerce deployment/payment-service --since=1h | grep webhook"
            ]
        },
        {
            "step": 4,
            "action": "Retry failed payments within safe window",
            "script": "scripts/retry-failed-payments.py",
            "parameters": "--since=1h --max-retries=3 --dry-run",
            "safety_checks": [
                "Verify no duplicate charges",
                "Check customer balance before retry",
                "Log all retry attempts"
            ]
        },
        {
            "step": 5,
            "action": "Customer communication if needed",
            "triggers": [
                "Multiple payment failures for same customer",
                "High-value transaction failures",
                "VIP customer affected"
            ],
            "template": "email-templates/payment-failure-notification.html"
        }
    ]',
    '{
        "level1": {
            "contact": "payments-team@company.com",
            "sla": "10 minutes response"
        },
        "level2": {
            "contact": "engineering-manager@company.com", 
            "sla": "20 minutes response"
        },
        "external": {
            "contact": "Stripe support",
            "when": "Suspected Stripe platform issue"
        }
    }',
    '{
        "acknowledgment_time": "2 minutes",
        "resolution_time": "15 minutes", 
        "customer_notification": "30 minutes for affected customers",
        "success_criteria": [
            "Payment success rate > 98%",
            "No duplicate charges created",
            "All failed payments properly logged"
        ]
    }',
    (SELECT id FROM users WHERE username = 'developer')
);

-- Sample knowledge artifacts
INSERT INTO knowledge_artifacts (
    project_id,
    name,
    artifact_type,
    content,
    file_path,
    metadata,
    tags,
    author_id
) VALUES 
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    'WebSocket Architecture Diagram',
    'diagram',
    'Architecture diagram showing WebSocket server, Redis for session management, and client connections with load balancing',
    '/docs/architecture/websocket-architecture.png',
    '{"format": "PNG", "size": 245760, "dimensions": "1920x1080", "created_with": "draw.io"}',
    ARRAY['architecture', 'websocket', 'real-time', 'diagram'],
    (SELECT id FROM users WHERE username = 'admin')
),
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    'Socket.IO Integration Guide',
    'document',
    'Comprehensive guide for integrating Socket.IO including client setup, server configuration, room management, authentication, and error handling patterns',
    '/docs/guides/socketio-integration.md',
    '{"format": "Markdown", "size": 15420, "word_count": 2180}',
    ARRAY['integration', 'socketio', 'guide', 'real-time'],
    (SELECT id FROM users WHERE username = 'admin')
),
(
    (SELECT id FROM projects WHERE name = 'E-commerce Platform'),
    'Payment Flow Sequence Diagram',
    'diagram', 
    'Sequence diagram illustrating the complete payment flow from cart checkout to payment confirmation, including Stripe integration and webhook handling',
    '/docs/payments/payment-sequence-diagram.svg',
    '{"format": "SVG", "size": 89432, "created_with": "PlantUML"}',
    ARRAY['payment', 'sequence', 'stripe', 'workflow'],
    (SELECT id FROM users WHERE username = 'developer')
),
(
    (SELECT id FROM projects WHERE name = 'E-commerce Platform'),
    'API Security Checklist',
    'document',
    'Security checklist covering authentication, authorization, input validation, rate limiting, OWASP top 10 considerations, and payment data handling',
    '/docs/security/api-security-checklist.md',
    '{"format": "Markdown", "size": 8920, "checklist_items": 45}',
    ARRAY['security', 'api', 'checklist', 'owasp'],
    (SELECT id FROM users WHERE username = 'developer')
);

-- Sample chat messages for testing search
INSERT INTO messages (
    project_id,
    sender_id,
    content,
    message_type,
    thread_id
) VALUES 
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    (SELECT id FROM users WHERE username = 'admin'),
    'We need to decide on the WebSocket library for real-time chat. I''m thinking Socket.IO vs native WebSocket API. Any thoughts?',
    'text',
    uuid_generate_v4()
),
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    (SELECT id FROM users WHERE username = 'developer'),
    'Socket.IO has better fallback support and reconnection handling. Native WebSocket gives us more control but requires more implementation work.',
    'text',
    uuid_generate_v4()
),
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    (SELECT id FROM users WHERE username = 'admin'),
    'Good point. The automatic fallback to polling is valuable for enterprise firewalls. Let''s go with Socket.IO and create an ADR.',
    'text',
    uuid_generate_v4()
),
(
    (SELECT id FROM projects WHERE name = 'E-commerce Platform'),
    (SELECT id FROM users WHERE username = 'developer'),
    'Payment integration is working! Successfully processed a test transaction with Stripe. Webhook handling needs some work though.',
    'text',
    uuid_generate_v4()
),
(
    (SELECT id FROM projects WHERE name = 'E-commerce Platform'),
    (SELECT id FROM users WHERE username = 'admin'),
    'Excellent! Make sure to test webhook failure scenarios and implement proper retry logic. Also document the webhook endpoint security.',
    'text',
    uuid_generate_v4()
);

-- Sample pattern usage tracking
INSERT INTO pattern_usage (
    pattern_id,
    project_id,
    adr_id,
    usage_context,
    outcome,
    feedback,
    metrics
) VALUES 
(
    (SELECT id FROM patterns WHERE name = 'ADR-Driven Development'),
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    (SELECT id FROM adrs WHERE title = 'Choose WebSocket library for real-time communication'),
    'Used ADR pattern to document WebSocket library selection decision',
    'success',
    'ADR process helped team align on decision criteria and rationale. Good documentation for future reference.',
    '{"time_to_decision": "2 days", "team_alignment_score": 5, "documentation_quality": 4}'
),
(
    (SELECT id FROM patterns WHERE name = 'Component Library Pattern'),
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    NULL,
    'Applied to React UI components for chat interface',
    'success',
    'Reusable Button and Input components saved development time. Good TypeScript interfaces.',
    '{"components_reused": 8, "development_time_saved": "4 hours", "consistency_score": 5}'
);

-- Update pattern effectiveness scores based on usage
UPDATE patterns SET 
    effectiveness_score = 4.5,
    usage_count = 1
WHERE name = 'ADR-Driven Development';

UPDATE patterns SET 
    effectiveness_score = 4.8,
    usage_count = 1  
WHERE name = 'Component Library Pattern';

-- Sample search queries for analytics
INSERT INTO search_queries (
    user_id,
    project_id,
    query_text,
    results_found,
    satisfaction_rating
) VALUES 
(
    (SELECT id FROM users WHERE username = 'admin'),
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    'websocket authentication socket.io',
    3,
    4
),
(
    (SELECT id FROM users WHERE username = 'developer'),
    (SELECT id FROM projects WHERE name = 'E-commerce Platform'),
    'stripe webhook retry failed payment',
    2,
    5
),
(
    (SELECT id FROM users WHERE username = 'admin'),
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    'file upload minio s3 storage',
    4,
    4
);

-- Sample incident for testing
INSERT INTO incidents (
    project_id,
    title,
    description,
    severity,
    status,
    runbook_id,
    reporter_id,
    assignee_id
) VALUES 
(
    (SELECT id FROM projects WHERE name = 'Chat Application'),
    'WebSocket connections dropping frequently',
    'Users experiencing frequent disconnections from chat, messages not delivering reliably. Started approximately 2 hours ago.',
    'high',
    'investigating',
    (SELECT id FROM runbooks WHERE title = 'WebSocket Connection Issues Troubleshooting'),
    (SELECT id FROM users WHERE username = 'admin'),
    (SELECT id FROM users WHERE username = 'developer')
);

COMMIT;