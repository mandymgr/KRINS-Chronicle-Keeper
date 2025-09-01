// Mock data for testing Dev Memory OS API responses

export const mockHealthResponse = {
  status: 'ok',
  timestamp: '2025-08-28T10:00:00.000Z',
  version: '1.0.0',
  services: {
    database: true,
    embeddings: true,
    api: true
  },
  uptime: 1234.567,
  memory: {
    rss: 123456789,
    heapTotal: 87654321,
    heapUsed: 65432109,
    external: 12345678
  },
  port: 3003
};

export const mockADRs = [
  {
    id: 'adr-001',
    type: 'adr',
    title: 'Use React with TypeScript for Frontend Development',
    similarity: 0.95,
    project_name: 'Dev Memory OS',
    component_name: 'Frontend',
    status: 'accepted',
    problem_statement: 'We need to choose a frontend technology stack that provides type safety, good developer experience, and strong ecosystem support...',
    decision: 'We will use React with TypeScript for all frontend development to leverage strong typing, extensive ecosystem, and team expertise.',
    created_at: '2025-08-20T10:00:00.000Z',
    url: '/api/adrs/adr-001'
  },
  {
    id: 'adr-002',
    type: 'adr',
    title: 'Implement pgvector for Semantic Search',
    similarity: 0.88,
    project_name: 'Dev Memory OS',
    component_name: 'Backend',
    status: 'accepted',
    problem_statement: 'We need efficient vector similarity search for ADRs and patterns to enable semantic search capabilities...',
    decision: 'We will use pgvector extension for PostgreSQL to store and query embedding vectors, providing sub-200ms search performance.',
    created_at: '2025-08-18T14:30:00.000Z',
    url: '/api/adrs/adr-002'
  },
  {
    id: 'adr-003',
    type: 'adr',
    title: 'API Rate Limiting Strategy',
    similarity: 0.76,
    project_name: 'Dev Memory OS',
    component_name: 'API',
    status: 'proposed',
    problem_statement: 'Without proper rate limiting, our API could be overwhelmed by excessive requests, impacting performance for all users...',
    decision: 'Implement token bucket rate limiting with Redis backend, allowing burst capacity while maintaining average rate limits.',
    created_at: '2025-08-25T09:15:00.000Z',
    url: '/api/adrs/adr-003'
  },
  {
    id: 'adr-004',
    type: 'adr',
    title: 'Authentication and Authorization Architecture',
    similarity: 0.82,
    project_name: 'Chat Application',
    component_name: 'Auth',
    status: 'accepted',
    problem_statement: 'The application needs secure user authentication and role-based access control for different features...',
    decision: 'Use JWT tokens with refresh token rotation, implementing RBAC with fine-grained permissions stored in database.',
    created_at: '2025-08-22T16:45:00.000Z',
    url: '/api/adrs/adr-004'
  }
];

export const mockPatterns = [
  {
    id: 'pattern-001',
    type: 'pattern',
    name: 'API-First Development',
    similarity: 0.91,
    category: 'Architecture',
    description: 'Design and implement APIs before building the frontend, ensuring clear contracts and enabling parallel development...',
    when_to_use: 'When building full-stack applications with separate frontend and backend teams, or when API reusability is important...',
    context_tags: ['api', 'architecture', 'fullstack'],
    effectiveness_score: 4.5,
    usage_count: 25,
    author_name: 'krin',
    created_at: '2025-08-15T11:20:00.000Z',
    url: '/api/patterns/pattern-001'
  },
  {
    id: 'pattern-002',
    type: 'pattern',
    name: 'Semantic Search Implementation',
    similarity: 0.87,
    category: 'Search',
    description: 'Use vector embeddings and similarity search to enable natural language querying of structured data...',
    when_to_use: 'When users need to search through large amounts of unstructured or semi-structured content using natural language...',
    context_tags: ['search', 'ai', 'embeddings', 'nlp'],
    effectiveness_score: 4.8,
    usage_count: 18,
    author_name: 'ai-specialist',
    created_at: '2025-08-19T13:30:00.000Z',
    url: '/api/patterns/pattern-002'
  },
  {
    id: 'pattern-003',
    type: 'pattern',
    name: 'Progressive Enhancement Testing',
    similarity: 0.79,
    category: 'Testing',
    description: 'Start with unit tests, add integration tests, then end-to-end tests in a layered approach for maximum coverage efficiency...',
    when_to_use: 'For complex applications where comprehensive testing is needed but resources are limited...',
    context_tags: ['testing', 'quality', 'automation'],
    effectiveness_score: 4.2,
    usage_count: 32,
    author_name: 'testing-specialist',
    created_at: '2025-08-28T08:00:00.000Z',
    url: '/api/patterns/pattern-003'
  }
];

export function mockSemanticSearchResponse(query: string, max_results: number, similarity_threshold: number) {
  // Filter results based on similarity threshold
  const filteredADRs = mockADRs.filter(adr => adr.similarity >= similarity_threshold);
  const filteredPatterns = mockPatterns.filter(pattern => pattern.similarity >= similarity_threshold);

  // Simulate query-specific relevance scoring
  const relevanceBoost = query.toLowerCase().includes('search') ? 0.1 : 
                        query.toLowerCase().includes('api') ? 0.05 : 0;

  const boostedADRs = filteredADRs.map(adr => ({
    ...adr,
    similarity: Math.min(0.99, adr.similarity + relevanceBoost)
  }));

  const boostedPatterns = filteredPatterns.map(pattern => ({
    ...pattern,
    similarity: Math.min(0.99, pattern.similarity + relevanceBoost)
  }));

  return {
    query,
    similarity_threshold,
    total_results: boostedADRs.length + boostedPatterns.length,
    results_by_type: {
      adrs: boostedADRs.slice(0, Math.floor(max_results / 2)),
      patterns: boostedPatterns.slice(0, Math.floor(max_results / 2)),
      knowledge: [] // Empty for now
    },
    timestamp: new Date().toISOString()
  };
}

// Mock webhook payloads
export const mockWebhookPayloads = {
  github_push: {
    ref: 'refs/heads/main',
    commits: [
      {
        id: 'abc123',
        message: 'Add new ADR for authentication strategy',
        author: { name: 'Krin', email: 'krin@devmemoryos.com' },
        modified: ['docs/adr/ADR-0005-auth-strategy.md']
      }
    ],
    repository: {
      name: 'dev-memory-os',
      full_name: 'krin/dev-memory-os'
    }
  },
  adr_created: {
    event: 'new_adr_created',
    data: {
      adr_id: 'adr-005',
      title: 'Authentication Strategy Decision',
      file_path: 'docs/adr/ADR-0005-auth-strategy.md',
      project_name: 'Dev Memory OS'
    },
    source: 'github-webhook'
  },
  pattern_used: {
    event: 'pattern_used',
    data: {
      pattern_id: 'pattern-001',
      usage_context: 'Applied API-First Development pattern to new microservice',
      user_id: 'user-123',
      project_id: 'project-456'
    },
    source: 'pattern-application'
  }
};

// Error responses for testing error handling
export const mockErrorResponses = {
  invalidQuery: {
    error: 'Query is required and must be a non-empty string',
    code: 'INVALID_QUERY'
  },
  searchError: {
    error: 'Failed to perform semantic search',
    message: 'Database connection timeout',
    code: 'SEARCH_ERROR'
  },
  serviceUnavailable: {
    error: 'Search service unavailable',
    message: 'Failed to initialize search API',
    code: 'SERVICE_UNAVAILABLE'
  },
  adrNotFound: {
    error: 'ADR not found',
    code: 'ADR_NOT_FOUND'
  }
};