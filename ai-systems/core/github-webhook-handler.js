/**
 * 🔗 GitHub Webhook Handler for Auto-Capture
 * 
 * Integrates with vårt AI Pattern Bridge for automatic institutional memory generation
 * Handles PR creation/update → automatic ADR draft suggestions
 * 
 * @author Krin & Mandy - Revolutionary Development System
 * @date 2025-08-27
 * @version 1.0.0 - Auto-Capture Foundation
 */

const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { AIPatternBridge } = require('./ai-pattern-bridge');

class GitHubWebhookHandler {
  constructor(options = {}) {
    this.app = express();
    this.port = options.port || 3000;
    this.webhookSecret = options.webhookSecret || process.env.GITHUB_WEBHOOK_SECRET;
    this.aiPatternBridge = new AIPatternBridge();
    
    // Middleware setup
    this.app.use(express.raw({ type: 'application/json' }));
    this.setupRoutes();
    
    console.log('🔗 GitHub Webhook Handler initialized - Auto-Capture ready!');
  }

  /**
   * Verify GitHub webhook signature
   */
  verifySignature(payload, signature) {
    if (!this.webhookSecret) {
      console.warn('⚠️ No webhook secret configured - running in development mode');
      return true;
    }

    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  }

  /**
   * Setup webhook routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        service: 'GitHub Webhook Handler',
        system: 'Krin & Mandy Revolutionary Development System'
      });
    });

    // Main webhook endpoint
    this.app.post('/webhook', async (req, res) => {
      try {
        const signature = req.headers['x-hub-signature-256'];
        const event = req.headers['x-github-event'];
        
        if (!this.verifySignature(req.body, signature)) {
          console.error('❌ Invalid webhook signature');
          return res.status(401).send('Unauthorized');
        }

        const payload = JSON.parse(req.body.toString());
        await this.handleWebhookEvent(event, payload);
        
        res.status(200).send('OK');
      } catch (error) {
        console.error('❌ Webhook handling error:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    // NEW: Conversation logging endpoint for Krin-Mandy collaboration
    this.app.post('/log-conversation', async (req, res) => {
      try {
        const { conversation, decisions, patterns_used, timestamp } = req.body;
        await this.logKrinMandyConversation({
          conversation,
          decisions,
          patterns_used,
          timestamp: timestamp || new Date().toISOString()
        });
        res.status(200).json({ status: 'logged', message: 'Krin-Mandy conversation captured!' });
      } catch (error) {
        console.error('❌ Conversation logging error:', error);
        res.status(500).send('Error logging conversation');
      }
    });

    // ADR suggestion endpoint (for manual triggers)
    this.app.post('/suggest-adr', async (req, res) => {
      try {
        const { prDescription, prDiff, repoContext } = req.body;
        const suggestion = await this.generateADRSuggestion(prDescription, prDiff, repoContext);
        res.json(suggestion);
      } catch (error) {
        console.error('❌ ADR suggestion error:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * Handle different GitHub webhook events
   */
  async handleWebhookEvent(event, payload) {
    console.log(`📢 Received ${event} event from ${payload.repository?.full_name}`);

    switch (event) {
      case 'pull_request':
        await this.handlePullRequestEvent(payload);
        break;
      case 'push':
        await this.handlePushEvent(payload);
        break;
      case 'issues':
        await this.handleIssueEvent(payload);
        break;
      default:
        console.log(`ℹ️ Unhandled event type: ${event}`);
    }
  }

  /**
   * Handle pull request events (main auto-capture trigger)
   */
  async handlePullRequestEvent(payload) {
    const { action, pull_request, repository } = payload;
    
    if (!['opened', 'edited', 'synchronize'].includes(action)) {
      return;
    }

    console.log(`🔍 Processing PR #${pull_request.number}: ${pull_request.title}`);
    
    try {
      // Analyze PR for potential ADR requirement
      const prAnalysis = await this.analyzePullRequest(pull_request, repository);
      
      if (prAnalysis.requiresADR) {
        // Generate ADR suggestion using our AI Pattern Bridge
        const adrSuggestion = await this.generateADRSuggestion(
          pull_request.body || pull_request.title,
          prAnalysis.changes,
          { repository: repository.full_name, pr: pull_request.number }
        );

        // Create actual ADR file if enabled (environment variable control)
        if (process.env.AUTO_CREATE_ADR === 'true') {
          await this.createADRFile(adrSuggestion, pull_request, repository);
        }

        // Post suggestion as PR comment (if configured)
        if (process.env.GITHUB_TOKEN) {
          await this.postADRSuggestionComment(pull_request, repository, adrSuggestion);
        }

        console.log(`📋 ADR suggestion generated for PR #${pull_request.number}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to process PR #${pull_request.number}:`, error);
    }
  }

  /**
   * Analyze pull request to determine if ADR is needed
   */
  async analyzePullRequest(pullRequest, repository) {
    const analysis = {
      requiresADR: false,
      reason: '',
      changes: {
        additions: pullRequest.additions || 0,
        deletions: pullRequest.deletions || 0,
        changedFiles: pullRequest.changed_files || 0
      },
      complexity: 'low'
    };

    // Size-based analysis (following our CI/CD Gate Pattern)
    const totalChanges = analysis.changes.additions + analysis.changes.deletions;
    
    if (totalChanges > 200) {
      analysis.requiresADR = true;
      analysis.reason = 'Large changeset (>200 lines) - requires architectural documentation';
      analysis.complexity = 'high';
    }

    // Content-based analysis (check for architectural keywords)
    const title = pullRequest.title.toLowerCase();
    const body = (pullRequest.body || '').toLowerCase();
    const content = title + ' ' + body;

    const architecturalKeywords = [
      'architecture', 'refactor', 'migration', 'database', 'api', 'security',
      'authentication', 'authorization', 'infrastructure', 'deployment',
      'performance', 'scalability', 'integration', 'dependency'
    ];

    const hasArchitecturalChanges = architecturalKeywords.some(keyword => 
      content.includes(keyword)
    );

    if (hasArchitecturalChanges) {
      analysis.requiresADR = true;
      analysis.reason = analysis.reason || 'Architectural changes detected - requires decision documentation';
      analysis.complexity = analysis.complexity === 'high' ? 'high' : 'medium';
    }

    return analysis;
  }

  /**
   * Generate ADR suggestion using our AI Pattern Bridge
   */
  async generateADRSuggestion(prDescription, changes, context) {
    try {
      // Use our existing AI Pattern Bridge to generate suggestions
      const instructions = await this.aiPatternBridge.generateAIInstructions(
        `Analyze this change: ${prDescription}`,
        'architectural-decision'
      );

      // Generate structured ADR suggestion
      const suggestion = {
        title: this.extractADRTitle(prDescription),
        problem: this.extractProblem(prDescription, changes),
        alternatives: await this.generateAlternatives(prDescription, instructions),
        recommendedDecision: this.extractDecision(prDescription),
        consequences: await this.analyzeConsequences(prDescription, instructions),
        patterns: this.getRelevantPatterns(instructions),
        context: context,
        generatedAt: new Date().toISOString(),
        confidence: this.calculateConfidence(prDescription, changes)
      };

      return suggestion;
      
    } catch (error) {
      console.error('❌ Failed to generate ADR suggestion:', error);
      throw error;
    }
  }

  /**
   * Extract potential ADR title from PR description
   */
  extractADRTitle(description) {
    // Simple extraction - could be enhanced with NLP
    const title = (description || '').split('\n')[0].trim();
    
    // Clean up common PR prefixes
    const cleanTitle = title
      .replace(/^(feat|fix|chore|docs|style|refactor|test)(\(.+\))?:\s*/i, '')
      .replace(/^(add|update|remove|fix|implement)\s+/i, '');
    
    return `Architecture Decision for ${cleanTitle}`;
  }

  /**
   * Extract problem statement from PR description
   */
  extractProblem(description, changes) {
    // Look for problem indicators in description
    const problemKeywords = ['problem', 'issue', 'challenge', 'need to', 'required', 'must'];
    const lines = (description || '').split('\n');
    
    for (const line of lines) {
      if (problemKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        return line.trim();
      }
    }

    // Fallback: generate from change statistics
    const totalChanges = (changes?.additions || 0) + (changes?.deletions || 0);
    return `Large code change (${totalChanges} lines) requires architectural review and documentation.`;
  }

  /**
   * Generate alternative approaches using pattern knowledge
   */
  async generateAlternatives(description, instructions) {
    const alternatives = ['Current approach (as implemented in PR)'];
    
    // Add pattern-based alternatives if relevant patterns exist
    Object.keys(instructions.aiTeamAssignment || {}).forEach(role => {
      const roleInstructions = instructions.aiTeamAssignment[role];
      if (roleInstructions.patterns && roleInstructions.patterns.length > 0) {
        roleInstructions.patterns.forEach(pattern => {
          alternatives.push(`Alternative: Apply ${pattern.name} pattern`);
        });
      }
    });

    return alternatives;
  }

  /**
   * Extract recommended decision from PR description
   */
  extractDecision(description) {
    // Simple extraction - could be enhanced
    return 'Proceed with the implementation as proposed in this PR';
  }

  /**
   * Analyze consequences using pattern knowledge
   */
  async analyzeConsequences(description, instructions) {
    const consequences = {
      positive: [
        'Implements required functionality',
        'Follows established coding standards'
      ],
      negative: [
        'Adds complexity to codebase',
        'May require additional testing'
      ]
    };

    // Add pattern-specific consequences
    Object.values(instructions.aiTeamAssignment || {}).forEach(assignment => {
      if (assignment.antiPatterns && assignment.antiPatterns.length > 0) {
        assignment.antiPatterns.forEach(antiPattern => {
          consequences.negative.push(`Risk: ${antiPattern}`);
        });
      }
    });

    return consequences;
  }

  /**
   * Get relevant patterns from AI instructions
   */
  getRelevantPatterns(instructions) {
    const patterns = [];
    
    Object.values(instructions.aiTeamAssignment || {}).forEach(assignment => {
      if (assignment.patterns) {
        patterns.push(...assignment.patterns.map(p => p.name || p));
      }
    });

    return [...new Set(patterns)]; // Remove duplicates
  }

  /**
   * Calculate confidence score for ADR suggestion
   */
  calculateConfidence(description, changes) {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on change size
    const totalChanges = (changes?.additions || 0) + (changes?.deletions || 0);
    if (totalChanges > 500) confidence += 0.3;
    else if (totalChanges > 200) confidence += 0.2;
    else if (totalChanges > 50) confidence += 0.1;

    // Boost confidence based on description quality
    if ((description || '').length > 100) confidence += 0.1;
    if ((description || '').toLowerCase().includes('architecture')) confidence += 0.1;
    
    return Math.min(confidence, 0.95); // Cap at 95%
  }

  /**
   * Create actual ADR file using existing tools/adr_new.sh
   */
  async createADRFile(suggestion, pullRequest, repository) {
    try {
      const title = suggestion.title.replace('Architecture Decision for ', '');
      const component = repository.full_name.split('/')[1] || 'unknown';
      
      console.log(`🔨 Creating ADR file: ${title}`);
      
      // Use existing ADR creation script
      const scriptPath = path.join(__dirname, '../tools/adr_new.sh');
      
      return new Promise((resolve, reject) => {
        exec(`bash "${scriptPath}" "${title}" "${component}"`, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Failed to create ADR file: ${error}`);
            reject(error);
            return;
          }
          
          const adrFilePath = stdout.trim().replace('Opprettet ', '');
          console.log(`✅ ADR file created: ${adrFilePath}`);
          
          // Now enhance the created ADR with our generated content
          this.enhanceADRWithSuggestion(adrFilePath, suggestion, pullRequest)
            .then(() => resolve(adrFilePath))
            .catch(reject);
        });
      });
      
    } catch (error) {
      console.error('❌ Failed to create ADR file:', error);
      throw error;
    }
  }

  /**
   * Enhance the created ADR template with our AI-generated suggestions
   */
  async enhanceADRWithSuggestion(adrFilePath, suggestion, pullRequest) {
    try {
      const content = await fs.readFile(adrFilePath, 'utf8');
      
      // Replace template placeholders with our generated content
      let enhancedContent = content;
      
      // Add problem statement
      enhancedContent = enhancedContent.replace(
        /## Problem.*?\n/s,
        `## Problem\n\n${suggestion.problem}\n\n`
      );
      
      // Add alternatives
      if (suggestion.alternatives.length > 0) {
        const alternativesText = suggestion.alternatives
          .map((alt, i) => `${i + 1}. ${alt}`)
          .join('\n');
        enhancedContent = enhancedContent.replace(
          /## Alternatives.*?\n/s,
          `## Alternatives\n\n${alternativesText}\n\n`
        );
      }
      
      // Add consequences
      if (suggestion.consequences) {
        const consequencesText = [
          '### Positive Consequences',
          ...suggestion.consequences.positive.map(c => `- ${c}`),
          '',
          '### Negative Consequences',
          ...suggestion.consequences.negative.map(c => `- ${c}`)
        ].join('\n');
        
        enhancedContent = enhancedContent.replace(
          /## Consequences.*?\n/s,
          `## Consequences\n\n${consequencesText}\n\n`
        );
      }
      
      // Add metadata
      const metadata = [
        '',
        '---',
        '',
        '### Metadata',
        `- **Generated from PR**: #${pullRequest.number}`,
        `- **Confidence Score**: ${(suggestion.confidence * 100).toFixed(0)}%`,
        `- **Generated At**: ${suggestion.generatedAt}`,
        `- **Relevant Patterns**: ${suggestion.patterns.join(', ') || 'None identified'}`
      ].join('\n');
      
      enhancedContent += metadata;
      
      await fs.writeFile(adrFilePath, enhancedContent);
      console.log(`🎯 Enhanced ADR with AI suggestions: ${adrFilePath}`);
      
    } catch (error) {
      console.error('❌ Failed to enhance ADR file:', error);
      throw error;
    }
  }

  /**
   * Post ADR suggestion as GitHub PR comment
   */
  async postADRSuggestionComment(pullRequest, repository, suggestion) {
    // This would integrate with GitHub API to post comments
    // Placeholder for now - would need github package and proper auth
    
    console.log(`💬 Would post ADR suggestion comment on PR #${pullRequest.number}`);
    console.log(`📋 Suggestion: ${suggestion.title}`);
    console.log(`🎯 Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`);
  }

  /**
   * Handle push events (for commit-based analysis)
   */
  async handlePushEvent(payload) {
    const { commits, repository, ref } = payload;
    
    // Only process main/master branch pushes
    if (!ref.endsWith('/main') && !ref.endsWith('/master')) {
      return;
    }

    console.log(`📦 Processing push to ${ref} with ${commits.length} commits`);
    
    for (const commit of commits) {
      // Analyze each commit for potential patterns
      await this.analyzeCommit(commit, repository);
    }
  }

  /**
   * Analyze individual commits for pattern learning
   */
  async analyzeCommit(commit, repository) {
    // Extract patterns from commit messages and changes
    const message = commit.message.toLowerCase();
    
    // Look for pattern keywords
    const patternKeywords = ['pattern', 'refactor', 'architecture', 'design'];
    const hasPatternContent = patternKeywords.some(keyword => message.includes(keyword));
    
    if (hasPatternContent) {
      console.log(`🎯 Pattern-related commit detected: ${commit.id.substring(0, 7)}`);
      // Could trigger pattern learning/updating here
    }
  }

  /**
   * Handle issue events (for decision tracking)
   */
  async handleIssueEvent(payload) {
    const { action, issue, repository } = payload;
    
    if (action === 'opened') {
      console.log(`📋 New issue opened: #${issue.number} - ${issue.title}`);
      
      // Check if issue describes an architectural decision need
      const issueText = (issue.title + ' ' + (issue.body || '')).toLowerCase();
      const decisionKeywords = ['architecture', 'decision', 'approach', 'design', 'should we'];
      
      if (decisionKeywords.some(keyword => issueText.includes(keyword))) {
        console.log(`🎯 Potential architectural decision issue detected: #${issue.number}`);
        // Could auto-suggest ADR creation here
      }
    }
  }

  /**
   * Start the webhook server
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 GitHub Webhook Handler listening on port ${this.port}`);
      console.log(`📡 Webhook endpoint: http://localhost:${this.port}/webhook`);
      console.log(`🏥 Health check: http://localhost:${this.port}/health`);
      console.log('🔗 Auto-Capture system ready for revolutionary development!');
    });
  }

  /**
   * Stop the webhook server
   */
  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 GitHub Webhook Handler stopped');
    }
  }

  /**
   * Log Krin-Mandy conversation with automatic ADR generation
   */
  async logKrinMandyConversation(conversationData) {
    try {
      const { conversation, decisions, patterns_used, timestamp } = conversationData;
      
      // Create conversation log directory if it doesn't exist
      const logDir = path.join(__dirname, '../docs/krin-mandy-sessions');
      await fs.mkdir(logDir, { recursive: true });
      
      // Generate session filename with timestamp
      const sessionId = new Date(timestamp).toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const logFile = path.join(logDir, `session-${sessionId}.md`);
      
      // Create comprehensive session log
      const logContent = `# 🚀 Krin-Mandy Collaboration Session
**Date**: ${new Date(timestamp).toLocaleDateString('no-NO')}  
**Time**: ${new Date(timestamp).toLocaleTimeString('no-NO')}  
**Session ID**: ${sessionId}

## 💬 Conversation Summary
${conversation}

## 🎯 Key Decisions Made
${decisions ? decisions.map(d => `- ${d}`).join('\n') : 'No explicit decisions recorded'}

## 📋 Patterns Used
${patterns_used ? patterns_used.map(p => `- ${p}`).join('\n') : 'No specific patterns identified'}

## 🔄 Auto-Generated ADR References
${decisions && decisions.length > 0 ? 
  decisions.map(decision => `- ADR suggestion for: "${decision}"`).join('\n') :
  'No ADR suggestions generated for this session'
}

## 📊 Session Metadata
- **Captured by**: Krin AI Pattern Bridge Auto-Capture System
- **Integration**: Dev Memory OS + Claude Code Coordination
- **Revolutionary Development**: Pattern-driven AI team collaboration

---
*This session was automatically captured by our institutional memory system*
`;

      // Write session log
      await fs.writeFile(logFile, logContent, 'utf8');
      
      // If decisions were made, generate ADR drafts
      if (decisions && decisions.length > 0) {
        for (const decision of decisions) {
          await this.generateADRFromConversation(decision, conversation, sessionId);
        }
      }
      
      console.log(`✅ Krin-Mandy session logged: ${logFile}`);
      console.log(`🎯 Captured ${decisions?.length || 0} decisions and ${patterns_used?.length || 0} patterns`);
      
      return { logFile, sessionId, decisionsLogged: decisions?.length || 0 };
      
    } catch (error) {
      console.error('❌ Failed to log Krin-Mandy conversation:', error);
      throw error;
    }
  }

  /**
   * Generate ADR draft from conversation decision
   */
  async generateADRFromConversation(decision, conversation, sessionId) {
    try {
      const adrDir = path.join(__dirname, '../../docs/adr');
      await fs.mkdir(adrDir, { recursive: true });
      
      // Get next ADR number
      const adrFiles = await fs.readdir(adrDir);
      const existingAdrs = adrFiles.filter(f => f.startsWith('ADR-')).length;
      const nextNumber = String(existingAdrs + 1).padStart(4, '0');
      
      const adrFile = path.join(adrDir, `ADR-${nextNumber}-${decision.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`);
      
      const adrContent = `# ADR-${nextNumber}: ${decision}

**Status**: Draft (Auto-generated from Krin-Mandy session)  
**Date**: ${new Date().toISOString().slice(0, 10)}  
**Session**: ${sessionId}

## Context
Generated from collaborative discussion between Krin (AI Team Leader) and Mandy during development of the Dev Memory OS + AI Pattern Bridge system.

**Original conversation context:**
${conversation.substring(0, 500)}${conversation.length > 500 ? '...' : ''}

## Decision
${decision}

## Alternatives Considered
*(To be filled in during ADR review process)*

## Consequences
### Positive
- Advances our revolutionary AI team coordination system
- Maintains institutional memory and pattern consistency

### Negative
- *(To be evaluated during implementation)*

## Implementation Notes
Generated automatically by Krin AI Pattern Bridge system during active development session.

---
**Auto-generated**: This ADR was created from a Krin-Mandy collaboration session and should be reviewed and refined as needed.
`;

      await fs.writeFile(adrFile, adrContent, 'utf8');
      console.log(`📋 Auto-generated ADR draft: ${adrFile}`);
      
      return adrFile;
    } catch (error) {
      console.error('❌ Failed to generate ADR from conversation:', error);
      throw error;
    }
  }
}

module.exports = { GitHubWebhookHandler };

// Export for direct usage
if (require.main === module) {
  const handler = new GitHubWebhookHandler({
    port: process.env.PORT || 3000,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET
  });
  
  handler.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down GitHub Webhook Handler...');
    handler.stop();
    process.exit(0);
  });
}