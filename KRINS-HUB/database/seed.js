/**
 * Database Seeding System for Dev Memory OS
 * Populates database with initial data for development and testing
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class DatabaseSeeder {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || this.buildConnectionString(),
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    }

    buildConnectionString() {
        const {
            DB_HOST = 'localhost',
            DB_PORT = '5432',
            DB_USER = 'devmemory',
            DB_PASSWORD = 'devmemory_secure_password_2024',
            DB_NAME = 'dev_memory_os'
        } = process.env;

        return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    }

    async seedUsers() {
        console.log('👤 Seeding users...');
        
        const users = [
            {
                username: 'admin',
                email: 'admin@devmemory.os',
                password_hash: '$2b$12$dummy_hash_for_development'
            },
            {
                username: 'developer',
                email: 'dev@devmemory.os', 
                password_hash: '$2b$12$dummy_hash_for_development'
            },
            {
                username: 'architect',
                email: 'architect@devmemory.os',
                password_hash: '$2b$12$dummy_hash_for_development'
            }
        ];

        for (const user of users) {
            await this.pool.query(`
                INSERT INTO users (username, email, password_hash)
                VALUES ($1, $2, $3)
                ON CONFLICT (username) DO NOTHING
            `, [user.username, user.email, user.password_hash]);
        }

        console.log(`✅ Seeded ${users.length} users`);
    }

    async seedProjects() {
        console.log('📁 Seeding projects...');
        
        const adminUser = await this.pool.query(
            'SELECT id FROM users WHERE username = $1', ['admin']
        );
        const adminId = adminUser.rows[0]?.id;

        const projects = [
            {
                name: 'Dev Memory OS',
                description: 'Revolutionary AI-powered development knowledge management system with semantic search',
                repository_url: 'https://github.com/mandymgr/Krins-Dev-Memory-OS',
                owner_id: adminId
            },
            {
                name: 'E-commerce Platform',
                description: 'Modern e-commerce platform with microservices architecture',
                repository_url: null,
                owner_id: adminId
            },
            {
                name: 'Healthcare Management System',
                description: 'HIPAA-compliant healthcare data management platform',
                repository_url: null,
                owner_id: adminId
            }
        ];

        for (const project of projects) {
            await this.pool.query(`
                INSERT INTO projects (name, description, repository_url, owner_id)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (name) DO NOTHING
            `, [project.name, project.description, project.repository_url, project.owner_id]);
        }

        console.log(`✅ Seeded ${projects.length} projects`);
    }

    async seedComponents() {
        console.log('🧩 Seeding components...');
        
        const devMemoryProject = await this.pool.query(
            'SELECT id FROM projects WHERE name = $1', ['Dev Memory OS']
        );
        const projectId = devMemoryProject.rows[0]?.id;

        const components = [
            {
                project_id: projectId,
                name: 'Backend API',
                path: '/backend',
                component_type: 'backend',
                description: 'Express.js API server with pgvector semantic search'
            },
            {
                project_id: projectId,
                name: 'React Frontend',
                path: '/frontend',
                component_type: 'frontend', 
                description: 'React 18 + Vite frontend with TypeScript and Tailwind'
            },
            {
                project_id: projectId,
                name: 'PostgreSQL Database',
                path: '/database',
                component_type: 'database',
                description: 'PostgreSQL with pgvector extension for semantic search'
            },
            {
                project_id: projectId,
                name: 'AI Pattern Bridge',
                path: '/ai-coordination',
                component_type: 'infrastructure',
                description: 'AI coordination system for development workflows'
            }
        ];

        for (const component of components) {
            await this.pool.query(`
                INSERT INTO components (project_id, name, path, component_type, description)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (project_id, path) DO NOTHING
            `, [component.project_id, component.name, component.path, component.component_type, component.description]);
        }

        console.log(`✅ Seeded ${components.length} components`);
    }

    async seedPatterns() {
        console.log('🎨 Seeding patterns...');
        
        const adminUser = await this.pool.query(
            'SELECT id FROM users WHERE username = $1', ['admin']
        );
        const adminId = adminUser.rows[0]?.id;

        const patterns = [
            {
                name: 'ADR-Driven Development',
                category: 'architectural',
                description: 'Systematic approach to capturing and tracking architectural decisions using Architecture Decision Records (ADRs). Ensures transparency and historical context for technical choices.',
                when_to_use: 'When making significant architectural choices that affect multiple team members, future development directions, or have long-term impact on system design.',
                when_not_to_use: 'For trivial implementation details, temporary solutions, or decisions that can be easily reversed without significant cost.',
                context_tags: ['@team', '@documentation', '@governance', '@architecture'],
                implementation_examples: JSON.stringify({
                    process: 'Create ADR → Review with team → Document decision → Link to related ADRs',
                    tools: ['adr-tools', 'markdown', 'git'],
                    template: 'Status, Context, Decision, Consequences'
                }),
                anti_patterns: JSON.stringify([
                    'Creating ADRs for every small decision',
                    'Not updating ADRs when decisions change',
                    'Writing ADRs without team input'
                ]),
                security_considerations: 'Ensure ADRs do not contain sensitive information or credentials',
                author_id: adminId,
                effectiveness_score: 4.5,
                usage_count: 23
            },
            {
                name: 'Component Library Pattern',
                category: 'design',
                description: 'Reusable UI components with consistent design language, behavior patterns, and accessibility features. Promotes design consistency and development efficiency.',
                when_to_use: 'When building user interfaces with repeated patterns, design consistency requirements, or multiple frontend applications sharing common components.',
                when_not_to_use: 'For one-off components, prototypes where consistency is not important, or when rapid experimentation is more valuable than reusability.',
                context_tags: ['@frontend', '@react', '@design-system', '@ui', '@accessibility'],
                implementation_examples: JSON.stringify({
                    structure: 'Button → Input → Card → Layout components',
                    technologies: ['React', 'Storybook', 'CSS-in-JS', 'TypeScript'],
                    documentation: 'Props API, usage examples, accessibility guidelines'
                }),
                anti_patterns: JSON.stringify([
                    'Over-engineering simple components',
                    'Not documenting component APIs',
                    'Creating too many component variants'
                ]),
                security_considerations: 'Sanitize props that render HTML, implement proper ARIA attributes',
                author_id: adminId,
                effectiveness_score: 4.2,
                usage_count: 18
            },
            {
                name: 'Database Migration Pattern',
                category: 'infrastructure',
                description: 'Version-controlled database schema changes with rollback capabilities, testing, and production deployment strategies.',
                when_to_use: 'When managing database schema evolution across multiple environments, ensuring data integrity during deployments, or coordinating database changes across teams.',
                when_not_to_use: 'For development-only databases, one-time data imports, or when database schema is completely static.',
                context_tags: ['@database', '@postgresql', '@migrations', '@devops'],
                implementation_examples: JSON.stringify({
                    tools: ['Flyway', 'Liquibase', 'custom migration scripts'],
                    strategy: 'Forward-only migrations with checksums',
                    testing: 'Test migrations on production-like data'
                }),
                anti_patterns: JSON.stringify([
                    'Modifying existing migrations',
                    'Not testing rollback procedures',
                    'Ignoring migration performance impact'
                ]),
                security_considerations: 'Restrict migration execution permissions, audit schema changes',
                author_id: adminId,
                effectiveness_score: 4.7,
                usage_count: 31
            },
            {
                name: 'API Versioning Strategy',
                category: 'backend',
                description: 'Systematic approach to evolving API interfaces while maintaining backward compatibility and clear deprecation paths.',
                when_to_use: 'When building public APIs, managing breaking changes, or supporting multiple client versions with different capabilities.',
                when_not_to_use: 'For internal APIs with tight coupling, prototype APIs, or when all clients can be updated simultaneously.',
                context_tags: ['@api', '@rest', '@versioning', '@backward-compatibility'],
                implementation_examples: JSON.stringify({
                    strategies: ['URL versioning (/v1/)', 'Header versioning', 'Content negotiation'],
                    deprecation: 'Announce → Grace period → Remove',
                    documentation: 'Changelog, migration guides, compatibility matrix'
                }),
                anti_patterns: JSON.stringify([
                    'Versioning every small change',
                    'Not communicating breaking changes',
                    'Supporting too many versions simultaneously'
                ]),
                security_considerations: 'Ensure security updates apply to all supported versions',
                author_id: adminId,
                effectiveness_score: 4.1,
                usage_count: 15
            },
            {
                name: 'Circuit Breaker Pattern',
                category: 'reliability',
                description: 'Prevents cascading failures by temporarily blocking calls to failing services, allowing systems to recover gracefully.',
                when_to_use: 'When integrating with external services, microservices architectures, or any system where dependency failures could cascade.',
                when_not_to_use: 'For internal method calls, systems with acceptable downtime, or when immediate error feedback is critical.',
                context_tags: ['@resilience', '@microservices', '@fault-tolerance', '@monitoring'],
                implementation_examples: JSON.stringify({
                    states: ['Closed → Open → Half-Open'],
                    libraries: ['Hystrix', 'resilience4j', 'polly'],
                    monitoring: 'Success rate, response time, circuit state'
                }),
                anti_patterns: JSON.stringify([
                    'Too aggressive timeout settings',
                    'Not monitoring circuit breaker metrics',
                    'Opening circuits for expected errors'
                ]),
                security_considerations: 'Prevent circuit breaker bypass, log security-relevant failures',
                author_id: adminId,
                effectiveness_score: 4.6,
                usage_count: 27
            }
        ];

        for (const pattern of patterns) {
            await this.pool.query(`
                INSERT INTO patterns (
                    name, category, description, when_to_use, when_not_to_use,
                    context_tags, implementation_examples, anti_patterns, 
                    security_considerations, author_id, effectiveness_score, usage_count
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (name) DO NOTHING
            `, [
                pattern.name, pattern.category, pattern.description, 
                pattern.when_to_use, pattern.when_not_to_use, pattern.context_tags,
                pattern.implementation_examples, pattern.anti_patterns,
                pattern.security_considerations, pattern.author_id, 
                pattern.effectiveness_score, pattern.usage_count
            ]);
        }

        console.log(`✅ Seeded ${patterns.length} patterns`);
    }

    async seedADRs() {
        console.log('📋 Seeding sample ADRs...');
        
        const devMemoryProject = await this.pool.query(
            'SELECT id FROM projects WHERE name = $1', ['Dev Memory OS']
        );
        const projectId = devMemoryProject.rows[0]?.id;

        const backendComponent = await this.pool.query(
            'SELECT id FROM components WHERE name = $1 AND project_id = $2',
            ['Backend API', projectId]
        );
        const componentId = backendComponent.rows[0]?.id;

        const adminUser = await this.pool.query(
            'SELECT id FROM users WHERE username = $1', ['admin']
        );
        const authorId = adminUser.rows[0]?.id;

        const adrs = [
            {
                project_id: projectId,
                component_id: componentId,
                number: 1,
                title: 'Use pgvector for semantic search',
                status: 'accepted',
                problem_statement: 'We need to implement semantic search capabilities for ADRs and patterns to allow natural language queries and find conceptually related content beyond keyword matching.',
                alternatives: JSON.stringify([
                    'Elasticsearch with dense vector fields',
                    'Pinecone as external vector database', 
                    'Self-hosted Weaviate',
                    'pgvector extension for PostgreSQL'
                ]),
                decision: 'Use pgvector extension for PostgreSQL as our vector database solution',
                rationale: 'pgvector provides native vector operations within PostgreSQL, reducing architectural complexity. It offers excellent performance for our scale, maintains ACID properties, and integrates seamlessly with our existing PostgreSQL infrastructure.',
                evidence: JSON.stringify({
                    performance: 'Sub-100ms query times for 10k+ embeddings',
                    cost: 'No additional database hosting costs',
                    complexity: 'Single database to maintain',
                    scalability: 'Proven to scale to millions of vectors'
                }),
                author_id: authorId
            },
            {
                project_id: projectId,
                component_id: componentId,
                number: 2,
                title: 'Implement hybrid search combining semantic and keyword approaches',
                status: 'accepted',
                problem_statement: 'Users need both conceptual search (semantic) and exact term matching (keyword) capabilities. Pure semantic search sometimes misses exact matches, while keyword search lacks conceptual understanding.',
                alternatives: JSON.stringify([
                    'Semantic search only with query expansion',
                    'Keyword search with manual synonyms',
                    'Separate semantic and keyword endpoints',
                    'Hybrid approach combining both with weighted scoring'
                ]),
                decision: 'Implement hybrid search that combines semantic vector similarity with PostgreSQL full-text search, using configurable weights for result ranking',
                rationale: 'Hybrid approach provides best user experience by leveraging strengths of both methods. Users get conceptual matches from semantic search and exact term matches from keyword search in unified results.',
                evidence: JSON.stringify({
                    user_testing: 'Improved search satisfaction from 3.2 to 4.6/5',
                    recall: 'Increased relevant results found by 34%',
                    precision: 'Maintained precision while improving recall'
                }),
                author_id: authorId
            },
            {
                project_id: projectId,
                number: 3,
                title: 'Choose React 18 with Vite for frontend development',
                status: 'accepted',
                problem_statement: 'Need to select modern frontend technology stack that provides excellent developer experience, fast build times, and supports advanced React features like concurrent rendering.',
                alternatives: JSON.stringify([
                    'Create React App (CRA) with React 18',
                    'Next.js with React 18',
                    'Vite + React 18 + TypeScript',
                    'Angular or Vue.js alternatives'
                ]),
                decision: 'Use Vite as build tool with React 18, TypeScript, and Tailwind CSS',
                rationale: 'Vite provides fastest development experience with instant HMR, optimized builds, and excellent TypeScript support. React 18 concurrent features improve UX. Tailwind enables rapid UI development.',
                evidence: JSON.stringify({
                    build_performance: 'Dev server startup: <2s vs 30s+ with CRA',
                    hot_reload: 'Instant updates vs 3-5s with webpack',
                    bundle_size: '40% smaller production bundles',
                    developer_satisfaction: 'Team voted unanimously for Vite'
                }),
                author_id: authorId
            }
        ];

        for (const adr of adrs) {
            await this.pool.query(`
                INSERT INTO adrs (
                    project_id, component_id, number, title, status,
                    problem_statement, alternatives, decision, rationale, evidence, author_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (project_id, number) DO NOTHING
            `, [
                adr.project_id, adr.component_id, adr.number, adr.title, adr.status,
                adr.problem_statement, adr.alternatives, adr.decision, adr.rationale, 
                adr.evidence, adr.author_id
            ]);
        }

        console.log(`✅ Seeded ${adrs.length} ADRs`);
    }

    async seedAll() {
        console.log('🌱 Starting database seeding...');
        
        try {
            await this.seedUsers();
            await this.seedProjects(); 
            await this.seedComponents();
            await this.seedPatterns();
            await this.seedADRs();
            
            console.log('🎉 Database seeding completed successfully!');
        } catch (error) {
            console.error('💥 Seeding failed:', error);
            throw error;
        }
    }

    async close() {
        await this.pool.end();
    }
}

// CLI interface
async function main() {
    const seeder = new DatabaseSeeder();
    
    try {
        await seeder.seedAll();
    } catch (error) {
        console.error('💥 Seeding failed:', error);
        process.exit(1);
    } finally {
        await seeder.close();
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = DatabaseSeeder;