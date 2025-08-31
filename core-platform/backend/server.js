const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockADRs = [
  {
    id: '1',
    title: 'Use PostgreSQL for Primary Database',
    status: 'accepted',
    problem_statement: 'We need a reliable, ACID-compliant database',
    author_name: 'Backend Specialist',
    created_at: '2024-01-15',
    similarity: 0.95
  },
  {
    id: '2',
    title: 'Implement AI Team Coordination System',
    status: 'accepted', 
    problem_statement: 'Need efficient AI specialist coordination',
    author_name: 'Krin',
    created_at: '2024-02-20',
    similarity: 0.87
  }
];

const mockPatterns = [
  {
    id: '1',
    name: 'Repository Pattern',
    description: 'Encapsulates data access logic',
    category: 'Data Access',
    effectiveness_score: 4.2,
    usage_count: 156,
    author_name: 'Architecture Team'
  },
  {
    id: '2',
    name: 'Observer Pattern', 
    description: 'Define one-to-many dependency between objects',
    category: 'Behavioral',
    effectiveness_score: 4.5,
    usage_count: 203,
    author_name: 'Design Team'
  }
];

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: { database: 'connected', search: 'operational' }
  });
});

app.post('/api/search/semantic', (req, res) => {
  const { query, max_results = 10 } = req.body;
  console.log(`Search: "${query}"`);
  
  setTimeout(() => {
    res.json({
      success: true,
      query,
      total_results: mockADRs.length + mockPatterns.length,
      results_by_type: {
        adrs: mockADRs.slice(0, Math.ceil(max_results / 2)),
        patterns: mockPatterns.slice(0, Math.floor(max_results / 2)),
        knowledge: []
      }
    });
  }, 500);
});

app.get('/api/patterns/recommend', (req, res) => {
  const { limit = 5 } = req.query;
  res.json({
    success: true,
    recommendations: mockPatterns.slice(0, parseInt(limit)),
    patterns: mockPatterns.slice(0, parseInt(limit)),
    total_found: mockPatterns.length
  });
});

app.get('/api/ai-team/activities', (req, res) => {
  const activities = [
    {
      id: 1,
      specialist: 'krin',
      specialistName: 'Krin (Team Leader)',
      emoji: '🚀',
      message: 'AI Team Coordination System initialized',
      type: 'success',
      timestamp: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: 2,
      specialist: 'backend',
      specialistName: 'Backend Specialist', 
      emoji: '⚙️',
      message: 'Semantic search API endpoints deployed',
      type: 'completed',
      timestamp: new Date(Date.now() - 180000).toISOString()
    }
  ];
  
  res.json({ success: true, activities });
});

app.get('*', (req, res) => {
  res.json({
    message: 'Dev Memory OS Backend API',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'POST /api/search/semantic', 
      'GET /api/patterns/recommend',
      'GET /api/ai-team/activities'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dev Memory OS Backend running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔍 API: http://localhost:${PORT}/api`);
});

module.exports = app;