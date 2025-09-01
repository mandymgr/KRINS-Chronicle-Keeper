import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { mockSemanticSearchResponse, mockADRs, mockPatterns, mockHealthResponse } from './handlers';

// Define request handlers and response resolvers for Dev Memory OS API
export const handlers = [
  // Health check endpoint
  rest.get('http://localhost:3003/health', (req, res, ctx) => {
    return res(ctx.json(mockHealthResponse));
  }),

  // API Info endpoint
  rest.get('http://localhost:3003/', (req, res, ctx) => {
    return res(ctx.json({
      name: 'Dev Memory OS Semantic Search API',
      version: '1.0.0',
      description: 'Revolutionary AI-powered semantic search for ADRs, patterns, and development knowledge',
      krin_coordination: 'Integrated with Krin AI Team Commander',
      endpoints: {
        health: 'GET /health',
        search: {
          semantic: 'POST /api/search/semantic',
          similar_adrs: 'GET /api/search/similar/:adr-id',
          analytics: 'GET /api/search/analytics'
        }
      }
    }));
  }),

  // Semantic search endpoint
  rest.post('http://localhost:3003/api/search/semantic', async (req, res, ctx) => {
    const body = await req.json();
    const { query, max_results = 20, similarity_threshold = 0.7 } = body;

    if (!query) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Query is required and must be a non-empty string',
          code: 'INVALID_QUERY'
        })
      );
    }

    // Simulate realistic response time
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    return res(ctx.json({
      success: true,
      ...mockSemanticSearchResponse(query, max_results, similarity_threshold)
    }));
  }),

  // Similar ADRs endpoint
  rest.get('http://localhost:3003/api/search/similar/:adrId', (req, res, ctx) => {
    const { adrId } = req.params;
    const { similarity_threshold = 0.6, max_results = 10 } = req.url.searchParams;

    const referenceADR = mockADRs.find(adr => adr.id === adrId);
    if (!referenceADR) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'ADR not found',
          code: 'ADR_NOT_FOUND'
        })
      );
    }

    const similarADRs = mockADRs
      .filter(adr => adr.id !== adrId)
      .slice(0, parseInt(max_results as string))
      .map(adr => ({
        ...adr,
        similarity: 0.8 - Math.random() * 0.3 // Mock similarity scores
      }))
      .filter(adr => adr.similarity >= parseFloat(similarity_threshold as string));

    return res(ctx.json({
      success: true,
      reference_adr: {
        id: referenceADR.id,
        title: referenceADR.title,
        project_name: referenceADR.project_name
      },
      similarity_threshold: parseFloat(similarity_threshold as string),
      similar_adrs: similarADRs,
      total_found: similarADRs.length,
      timestamp: new Date().toISOString()
    }));
  }),

  // Pattern recommendations endpoint
  rest.get('http://localhost:3003/api/patterns/recommend', (req, res, ctx) => {
    const { query = '', max_results = 10, similarity_threshold = 0.6 } = req.url.searchParams;

    const recommendations = mockPatterns
      .slice(0, parseInt(max_results as string))
      .map(pattern => ({
        ...pattern,
        similarity: query ? 0.9 - Math.random() * 0.3 : null
      }));

    return res(ctx.json({
      success: true,
      query: query || null,
      similarity_threshold: query ? parseFloat(similarity_threshold as string) : null,
      recommendations,
      total_found: recommendations.length,
      timestamp: new Date().toISOString()
    }));
  }),

  // Search analytics endpoint
  rest.get('http://localhost:3003/api/search/analytics', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      period_days: 30,
      project_id: null,
      daily_searches: [
        { search_date: '2025-08-28', daily_searches: 25, avg_results_per_search: 8.5 },
        { search_date: '2025-08-27', daily_searches: 18, avg_results_per_search: 7.2 },
        { search_date: '2025-08-26', daily_searches: 32, avg_results_per_search: 9.1 },
      ],
      top_search_terms: [
        { query_text: 'authentication patterns', search_count: 15, avg_results: 8.2 },
        { query_text: 'database migration', search_count: 12, avg_results: 6.5 },
        { query_text: 'API design', search_count: 10, avg_results: 9.8 },
      ],
      timestamp: new Date().toISOString()
    }));
  }),

  // Webhook coordination endpoint
  rest.post('http://localhost:3003/webhook/coordinate', async (req, res, ctx) => {
    const body = await req.json();
    const { event, data, source } = body;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 50));

    return res(ctx.json({
      success: true,
      event,
      processed_at: new Date().toISOString(),
      message: 'Coordination event processed successfully'
    }));
  }),

  // Webhook system endpoints (port 3002)
  rest.post('http://localhost:3002/webhook/github', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      message: 'GitHub webhook processed',
      timestamp: new Date().toISOString()
    }));
  }),

  // Default 404 handler for unmatched requests
  rest.get('*', (req, res, ctx) => {
    console.warn(`Unhandled GET request: ${req.url}`);
    return res(
      ctx.status(404),
      ctx.json({ error: 'Endpoint not found', path: req.url.pathname })
    );
  }),
];

export const server = setupServer(...handlers);