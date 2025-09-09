/**
 * 🚀 KRINS-Chronicle-Keeper Demo ADR API for Vercel
 * Serverless function providing demo ADR data and functionality
 */

const demoADRs = [
  {
    id: "ADR-001",
    title: "Use PostgreSQL with pgvector for semantic search",
    status: "accepted",
    component: "data-layer",
    created: "2025-01-15T10:00:00Z",
    lastModified: "2025-01-20T14:30:00Z",
    context: "We need a robust database solution that can handle both traditional relational data and vector similarity search for our AI-powered semantic search functionality. The system must support high-performance queries across both structured ADR data and vector embeddings generated from decision content.",
    decision: "Adopt PostgreSQL with the pgvector extension as our primary database solution. This provides enterprise-grade reliability for structured data while enabling efficient vector similarity search through native SQL queries.",
    consequences: "• Enables semantic search with <2s query times\n• Reduces infrastructure complexity by consolidating data storage\n• Leverages team's existing PostgreSQL expertise\n• Provides ACID compliance for critical decision data\n• Supports horizontal scaling through read replicas",
    tags: ["database", "search", "vectors", "performance"],
    aiInsights: {
      complexityScore: 7.5,
      riskLevel: "medium",
      predictedOutcomes: [
        { outcome: "Improved search relevance", probability: 0.9 },
        { outcome: "Faster query performance", probability: 0.85 },
        { outcome: "Simplified architecture", probability: 0.8 }
      ]
    }
  },
  {
    id: "ADR-002", 
    title: "Implement real-time WebSocket synchronization",
    status: "accepted",
    component: "collaboration",
    created: "2025-01-18T09:15:00Z",
    lastModified: "2025-01-22T16:45:00Z",
    context: "Multiple team members often work on the same architectural decisions simultaneously. Without real-time synchronization, we experience conflicts, lost changes, and inconsistent decision states across different users' interfaces.",
    decision: "Implement WebSocket-based real-time synchronization using Socket.IO for instant collaboration. All decision edits, comments, and status changes will be immediately synchronized across all connected clients.",
    consequences: "• Eliminates edit conflicts and lost changes\n• Improves team collaboration experience\n• Requires additional server resources for WebSocket connections\n• Adds complexity to frontend state management\n• Enables presence indicators and live cursors",
    tags: ["websocket", "real-time", "collaboration", "sync"],
    aiInsights: {
      complexityScore: 6.0,
      riskLevel: "low",
      predictedOutcomes: [
        { outcome: "Better team collaboration", probability: 0.95 },
        { outcome: "Reduced conflicts", probability: 0.9 },
        { outcome: "Increased system complexity", probability: 0.7 }
      ]
    }
  },
  {
    id: "ADR-003",
    title: "AI-powered decision intelligence with ML pattern recognition",
    status: "proposed",
    component: "ai-intelligence",
    created: "2025-01-25T11:30:00Z",
    lastModified: "2025-01-25T11:30:00Z",
    context: "Our organization makes hundreds of architectural decisions, but we lack insights into decision effectiveness, pattern recognition across similar choices, and predictive analytics for decision outcomes. This leads to repeated mistakes and missed optimization opportunities.",
    decision: "Implement a comprehensive AI-powered decision intelligence system that analyzes decision patterns, predicts outcomes, and provides recommendations based on historical data and similar organizational contexts.",
    consequences: "• Provides data-driven insights for better decision making\n• Identifies patterns across organizational decisions\n• Predicts potential risks and success factors\n• Requires significant ML model development and training\n• May introduce AI bias if not properly calibrated",
    tags: ["ai", "machine-learning", "analytics", "intelligence"],
    aiInsights: {
      complexityScore: 9.5,
      riskLevel: "high",
      predictedOutcomes: [
        { outcome: "Revolutionary decision insights", probability: 0.8 },
        { outcome: "Competitive advantage", probability: 0.85 },
        { outcome: "High implementation complexity", probability: 0.95 }
      ]
    }
  }
];

const analyticsData = {
  summary: {
    totalDecisions: demoADRs.length,
    decisionsByStatus: {
      accepted: 2,
      proposed: 1,
      rejected: 0,
      superseded: 0
    },
    averageImplementationTime: 12.5,
    successRate: 95.5
  },
  trends: {
    decisionVelocity: [
      { date: "2025-01-01", count: 0 },
      { date: "2025-01-15", count: 1 },
      { date: "2025-01-18", count: 2 },
      { date: "2025-01-25", count: 3 }
    ],
    componentActivity: [
      { component: "data-layer", decisions: 1, impact: "high" },
      { component: "collaboration", decisions: 1, impact: "medium" },
      { component: "ai-intelligence", decisions: 1, impact: "high" }
    ]
  },
  insights: [
    {
      type: "pattern",
      title: "High-impact decisions trend",
      description: "67% of recent decisions have high predicted impact",
      confidence: 0.85
    },
    {
      type: "recommendation", 
      title: "Consider gradual AI rollout",
      description: "High-complexity AI decisions benefit from phased implementation",
      confidence: 0.78
    }
  ]
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, query } = req;
  
  try {
    switch (method) {
      case 'GET':
        if (query.analytics === 'true') {
          // Return analytics data
          res.status(200).json({
            success: true,
            data: analyticsData,
            meta: {
              timestamp: new Date().toISOString(),
              version: "2.0.0",
              demo: true
            }
          });
        } else if (query.id) {
          // Return specific ADR
          const adr = demoADRs.find(a => a.id === query.id);
          if (!adr) {
            res.status(404).json({ error: "ADR not found" });
            return;
          }
          res.status(200).json({
            success: true,
            data: adr,
            meta: { timestamp: new Date().toISOString(), demo: true }
          });
        } else {
          // Return all ADRs with filtering
          let filteredADRs = demoADRs;
          
          if (query.status) {
            filteredADRs = filteredADRs.filter(adr => adr.status === query.status);
          }
          
          if (query.component) {
            filteredADRs = filteredADRs.filter(adr => adr.component === query.component);
          }
          
          res.status(200).json({
            success: true,
            data: {
              adrs: filteredADRs,
              pagination: {
                page: 1,
                perPage: filteredADRs.length,
                total: filteredADRs.length,
                pages: 1
              },
              filters: { status: query.status, component: query.component }
            },
            meta: {
              timestamp: new Date().toISOString(),
              version: "2.0.0", 
              demo: true,
              message: "🚀 KRINS Demo - World's First AI-Powered Organizational Intelligence"
            }
          });
        }
        break;

      case 'POST':
        // Create new ADR (demo mode - just return success)
        const newADR = {
          id: `ADR-${String(demoADRs.length + 1).padStart(3, '0')}`,
          ...req.body,
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          aiInsights: {
            complexityScore: Math.random() * 10,
            riskLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
            predictedOutcomes: [
              { outcome: "Successful implementation", probability: 0.8 + Math.random() * 0.15 }
            ]
          }
        };
        
        res.status(201).json({
          success: true,
          data: newADR,
          meta: {
            timestamp: new Date().toISOString(),
            demo: true,
            message: "Demo ADR created successfully"
          }
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      demo: true 
    });
  }
}