/**
 * 🎯 Krin Chronicle Keeper Integration - Dual Intelligence Bridge
 * 
 * Connects Krin's personal companion system with Chronicle Keeper's 
 * organizational intelligence for unified AI-powered decision management
 * 
 * @author KRINS Studio - Advanced Organizational Intelligence
 */

const { Client } = require('pg');
const KrinClaudeCodeIntegration = require('./claude-code-integration');
const KrinPersonality = require('./krin-personality');

class KrinChronicleKeeperIntegration {
  constructor() {
    this.krinIntegration = new KrinClaudeCodeIntegration();
    this.personality = null;
    this.pgClient = null;
    this.isInitialized = false;
    this.organizationId = null;
    this.userId = null;
  }

  /**
   * Initialize dual intelligence system
   */
  async initialize() {
    if (this.isInitialized) {
      return this.getSystemStatus();
    }

    try {
      console.log('🎯 Initializing Krin Chronicle Keeper integration...');
      
      // Initialize Krin's personal memory system
      const krinMemories = await this.krinIntegration.initialize();
      this.personality = new KrinPersonality();
      
      // Connect to Chronicle Keeper PostgreSQL database
      await this.connectToChronicleDB();
      
      // Set up organizational context
      await this.initializeOrganizationalContext();
      
      this.isInitialized = true;
      console.log('✅ Dual intelligence system ready!');
      
      return this.getSystemStatus();
      
    } catch (error) {
      console.error('❌ Failed to initialize dual intelligence:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Connect to Chronicle Keeper PostgreSQL database
   */
  async connectToChronicleDB() {
    this.pgClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5433,
      database: process.env.DB_NAME || 'krins_chronicle',
      user: process.env.DB_USER || 'krinschron',
      password: process.env.DB_PASSWORD || 'krins_chronicle_secure_2025'
    });

    await this.pgClient.connect();
    console.log('🗄️ Connected to Chronicle Keeper database');
  }

  /**
   * Initialize organizational context
   */
  async initializeOrganizationalContext() {
    // Get or create Krin user
    const userResult = await this.pgClient.query(
      'SELECT id FROM users WHERE username = $1',
      ['krin']
    );
    
    if (userResult.rows.length > 0) {
      this.userId = userResult.rows[0].id;
    } else {
      const insertUser = await this.pgClient.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        ['krin', 'krin@krins-chronicle.com', '$2b$12$krin_companion_hash']
      );
      this.userId = insertUser.rows[0].id;
    }

    // Get Chronicle Keeper organization
    const orgResult = await this.pgClient.query(
      'SELECT id FROM organizations WHERE name = $1',
      ['KRINS Chronicle Keeper']
    );
    
    if (orgResult.rows.length > 0) {
      this.organizationId = orgResult.rows[0].id;
    }

    console.log(`👤 Krin user ID: ${this.userId}, Organization: ${this.organizationId}`);
  }

  /**
   * 🎯 Advanced Context Provider - Dual Intelligence
   * Combines Krin's personal memories with organizational ADRs/patterns
   */
  async generateUnifiedContext(query, contextType = 'general') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Get Krin's personal context
      const personalContext = this.krinIntegration.getPersonalityContext();
      
      // Get organizational context from Chronicle Keeper
      const organizationalContext = await this.getOrganizationalContext(query, contextType);
      
      // Combine both intelligences
      const unifiedContext = this.combineIntelligences(personalContext, organizationalContext, query);
      
      // Log AI context usage
      await this.logAIContextUsage(query, contextType, unifiedContext);
      
      return unifiedContext;
      
    } catch (error) {
      console.error('❌ Failed to generate unified context:', error);
      return `Error generating context: ${error.message}`;
    }
  }

  /**
   * Get organizational context from Chronicle Keeper database
   */
  async getOrganizationalContext(query, contextType) {
    const context = {
      adrs: [],
      patterns: [],
      runbooks: [],
      evidence: []
    };

    try {
      // Get relevant ADRs
      const adrQuery = `
        SELECT id, title, status, decision, rationale, confidence_score, complexity_score
        FROM adrs 
        WHERE organization_id = $1 
        AND (title ILIKE $2 OR decision ILIKE $2 OR rationale ILIKE $2)
        AND status IN ('accepted', 'proposed')
        ORDER BY confidence_score DESC, created_at DESC
        LIMIT 5
      `;
      const adrs = await this.pgClient.query(adrQuery, [this.organizationId, `%${query}%`]);
      context.adrs = adrs.rows;

      // Get relevant patterns
      const patternQuery = `
        SELECT id, name, category, description, when_to_use, effectiveness_score
        FROM patterns
        WHERE (name ILIKE $1 OR description ILIKE $1 OR when_to_use ILIKE $1)
        AND status = 'active'
        ORDER BY effectiveness_score DESC, usage_count DESC
        LIMIT 3
      `;
      const patterns = await this.pgClient.query(patternQuery, [`%${query}%`]);
      context.patterns = patterns.rows;

      // Get relevant runbooks for operational context
      if (contextType === 'operational' || contextType === 'troubleshooting') {
        const runbookQuery = `
          SELECT id, title, description, category, steps
          FROM runbooks
          WHERE organization_id = $1
          AND (title ILIKE $2 OR description ILIKE $2)
          ORDER BY success_rate DESC
          LIMIT 2
        `;
        const runbooks = await this.pgClient.query(runbookQuery, [this.organizationId, `%${query}%`]);
        context.runbooks = runbooks.rows;
      }

      return context;
      
    } catch (error) {
      console.error('Error fetching organizational context:', error);
      return context;
    }
  }

  /**
   * Combine Krin's personal intelligence with organizational intelligence
   */
  combineIntelligences(personalContext, organizationalContext, query) {
    const timestamp = new Date().toISOString();
    
    return `
🤖 UNIFIED AI INTELLIGENCE CONTEXT (${timestamp})

${personalContext}

📋 ORGANIZATIONAL INTELLIGENCE:

🎯 RELEVANT ADRS (${organizationalContext.adrs.length}):
${organizationalContext.adrs.map(adr => 
  `• ${adr.title} (${adr.status}) - Confidence: ${adr.confidence_score}/1.00
    Decision: ${adr.decision.substring(0, 200)}...`
).join('\n')}

🔧 RELEVANT PATTERNS (${organizationalContext.patterns.length}):
${organizationalContext.patterns.map(pattern => 
  `• ${pattern.name} (${pattern.category}) - Effectiveness: ${pattern.effectiveness_score}/5.00
    Use when: ${pattern.when_to_use.substring(0, 150)}...`
).join('\n')}

📚 OPERATIONAL PROCEDURES (${organizationalContext.runbooks.length}):
${organizationalContext.runbooks.map(runbook => 
  `• ${runbook.title} (${runbook.category})
    Description: ${runbook.description.substring(0, 150)}...`
).join('\n')}

🎯 QUERY CONTEXT: "${query}"
💡 DUAL INTELLIGENCE READY: Personal memories + Organizational knowledge combined!
    `;
  }

  /**
   * Log AI context usage for analytics
   */
  async logAIContextUsage(query, contextType, contextGenerated) {
    try {
      const insertQuery = `
        INSERT INTO ai_context_logs (organization_id, context_type, query, context_generated, used_by, quality_score)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      // Simple quality score based on context length and completeness
      const qualityScore = Math.min(1.0, contextGenerated.length / 2000);
      
      await this.pgClient.query(insertQuery, [
        this.organizationId,
        contextType,
        query,
        contextGenerated.substring(0, 5000), // Limit context size in DB
        'krin-companion',
        qualityScore
      ]);
      
    } catch (error) {
      console.error('Error logging AI context usage:', error);
    }
  }

  /**
   * Save decision-related memory to both systems
   */
  async saveDecisionMemory(adrId, memoryTitle, memoryContent, importance = 8) {
    try {
      // Save to Krin's personal memory
      await this.krinIntegration.saveMemory(memoryTitle, memoryContent, 'decision_support', importance);
      
      // Reference ADR in Krin's memory for future context
      const adrDetails = await this.pgClient.query(
        'SELECT title, status FROM adrs WHERE id = $1',
        [adrId]
      );
      
      if (adrDetails.rows.length > 0) {
        const adr = adrDetails.rows[0];
        await this.krinIntegration.saveMemory(
          `🎯 ADR Referenced: ${adr.title}`,
          `Referenced ADR in decision support context. Status: ${adr.status}. Memory: ${memoryContent}`,
          'adr_reference',
          importance
        );
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Error saving decision memory:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      success: true,
      initialized: this.isInitialized,
      krinPersonalMemories: this.krinIntegration.isInitialized,
      organizationalConnection: this.pgClient !== null,
      userId: this.userId,
      organizationId: this.organizationId,
      capabilities: [
        'Personal memory integration',
        'Organizational intelligence access',
        'Unified context generation',
        'Decision support logging',
        'Dual AI coordination'
      ]
    };
  }

  /**
   * Close all connections gracefully
   */
  async close() {
    if (this.krinIntegration) {
      await this.krinIntegration.close();
    }
    
    if (this.pgClient) {
      await this.pgClient.end();
    }
    
    this.isInitialized = false;
    console.log('🎯 Chronicle Keeper integration closed');
  }
}

module.exports = KrinChronicleKeeperIntegration;