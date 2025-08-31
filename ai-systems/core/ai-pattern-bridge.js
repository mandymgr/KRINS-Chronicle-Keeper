/**
 * 🌉 AI Pattern Integration Bridge
 * 
 * Kobler Dev Memory OS patterns med Claude Code Coordination AI teams
 * Første implementering av revolutionær autonomous development med institutional memory
 * 
 * @author Krin & Mandy
 * @date 2025-08-27
 * @version 1.0.0 - The Revolution Begins
 */

const fs = require('fs');
const path = require('path');

class AIPatternBridge {
  constructor() {
    this.patternsPath = path.join(__dirname, '..', 'patterns');
    this.adrPath = path.join(__dirname, '..', 'docs', 'adr');
    this.loadedPatterns = new Map();
    this.aiTeamConfig = {
      frontend: { ai: 'claude', specialization: '@frontend' },
      backend: { ai: 'gpt-4', specialization: '@backend' }, 
      devops: { ai: 'gemini', specialization: '@deployment' },
      testing: { ai: 'claude', specialization: '@testing' }
    };
    
    console.log('🌉 AI Pattern Bridge initialized - Ready to revolutionize development!');
  }

  /**
   * Load all pattern cards and convert to AI instructions
   */
  async loadPatterns() {
    try {
      const patternFiles = fs.readdirSync(this.patternsPath)
        .filter(file => file.endsWith('.md') && !file.startsWith('TEMPLATE'));
      
      for (const file of patternFiles) {
        const patternPath = path.join(this.patternsPath, file);
        const content = fs.readFileSync(patternPath, 'utf8');
        const pattern = this.parsePattern(content);
        this.loadedPatterns.set(pattern.name, pattern);
      }
      
      console.log(`✅ Loaded ${this.loadedPatterns.size} patterns ready for AI teams`);
      return this.loadedPatterns;
    } catch (error) {
      console.error('❌ Failed to load patterns:', error);
      throw error;
    }
  }

  /**
   * Parse pattern markdown into structured AI instructions
   */
  parsePattern(markdownContent) {
    const lines = markdownContent.split('\n');
    const pattern = {
      name: '',
      whenToUse: '',
      whenNotToUse: '',
      context: '',
      steps: [],
      codeExamples: {},
      antiPatterns: [],
      performance: '',
      observability: ''
    };

    let currentSection = '';
    let currentLanguage = '';
    let codeBlock = '';
    
    for (const line of lines) {
      if (line.startsWith('# Pattern: ')) {
        pattern.name = line.replace('# Pattern: ', '');
      } else if (line.includes('**Når bruke:**')) {
        const match = line.match(/\*\*Når bruke:\*\* ([^•]*)/);
        pattern.whenToUse = match ? match[1].trim() : '';
      } else if (line.includes('**Ikke bruk når:**')) {
        const match = line.match(/\*\*Ikke bruk når:\*\* ([^•]*)/);
        pattern.whenNotToUse = match ? match[1].trim() : '';
      } else if (line.includes('**Kontekst:**')) {
        const match = line.match(/\*\*Kontekst:\*\* (.+)/);
        pattern.context = match ? match[1].trim() : '';
      } else if (line.startsWith('## Steg-for-steg')) {
        currentSection = 'steps';
      } else if (line.startsWith('### ') && currentSection === 'steps') {
        currentLanguage = line.replace('### ', '');
      } else if (line.startsWith('```') && currentSection === 'steps') {
        if (codeBlock) {
          pattern.codeExamples[currentLanguage] = codeBlock;
          codeBlock = '';
        }
      } else if (currentSection === 'steps' && codeBlock !== undefined) {
        codeBlock += line + '\n';
      } else if (line.match(/^\d+\)/)) {
        pattern.steps.push(line);
      } else if (line.startsWith('## Vanlige feil')) {
        currentSection = 'antiPatterns';
      } else if (currentSection === 'antiPatterns' && line.startsWith('- ')) {
        pattern.antiPatterns.push(line.replace('- ', ''));
      }
    }
    
    return pattern;
  }

  /**
   * Generate AI team instructions from patterns for specific project
   */
  async generateAIInstructions(projectDescription, projectType = 'web-app') {
    await this.loadPatterns();
    
    const relevantPatterns = this.selectRelevantPatterns(projectDescription, projectType);
    const instructions = {
      projectDescription,
      projectType,
      aiTeamAssignment: {},
      sharedGuidelines: [],
      qualityGates: [],
      documentationRequirements: []
    };

    // Generate specialized instructions for each AI team member
    for (const [role, config] of Object.entries(this.aiTeamConfig)) {
      const rolePatterns = relevantPatterns.filter(p => 
        p.context.includes(config.specialization) || 
        this.isRelevantForRole(p, role)
      );
      
      instructions.aiTeamAssignment[role] = {
        ai: config.ai,
        specialization: config.specialization,
        patterns: rolePatterns,
        instructions: this.generateRoleInstructions(role, rolePatterns, projectDescription),
        codeExamples: this.extractCodeExamples(rolePatterns, role),
        antiPatterns: this.extractAntiPatterns(rolePatterns)
      };
    }

    // Add shared quality gates and documentation requirements
    instructions.qualityGates = this.generateQualityGates(relevantPatterns);
    instructions.documentationRequirements = this.generateDocumentationRequirements();
    
    console.log('🎯 AI Instructions generated for autonomous development!');
    return instructions;
  }

  /**
   * Select patterns relevant to the project
   */
  selectRelevantPatterns(description, type) {
    const allPatterns = Array.from(this.loadedPatterns.values());
    
    // Smart pattern selection based on project description and type
    return allPatterns.filter(pattern => {
      const desc = description.toLowerCase();
      const patternName = pattern.name.toLowerCase();
      
      // Always include core patterns
      if (patternName.includes('adr-driven') || 
          patternName.includes('ci-cd-gate') ||
          patternName.includes('multi-language')) {
        return true;
      }
      
      // Pattern-specific relevance
      if (desc.includes('api') && patternName.includes('pattern-card')) return true;
      if (desc.includes('deploy') && patternName.includes('runbook')) return true;
      if (type === 'web-app') return true; // Most patterns relevant for web apps
      
      return false;
    });
  }

  /**
   * Check if pattern is relevant for specific AI role
   */
  isRelevantForRole(pattern, role) {
    const roleMapping = {
      frontend: ['react', 'ui', 'component', 'typescript'],
      backend: ['api', 'server', 'database', 'auth'],
      devops: ['deployment', 'ci-cd', 'docker', 'monitoring'],
      testing: ['test', 'quality', 'validation']
    };
    
    const keywords = roleMapping[role] || [];
    const patternText = (pattern.name + ' ' + pattern.whenToUse).toLowerCase();
    
    return keywords.some(keyword => patternText.includes(keyword));
  }

  /**
   * Generate specific instructions for AI role
   */
  generateRoleInstructions(role, patterns, projectDescription) {
    const baseInstructions = {
      frontend: `Create modern, responsive frontend using React with TypeScript. Focus on user experience and performance.`,
      backend: `Build secure, scalable backend API. Implement proper authentication and data validation.`,
      devops: `Setup deployment pipeline and monitoring. Ensure security and scalability.`,
      testing: `Create comprehensive test suite. Ensure quality gates are met.`
    };

    let instructions = [baseInstructions[role]];
    
    patterns.forEach(pattern => {
      instructions.push(`\n📋 Apply Pattern: ${pattern.name}`);
      instructions.push(`When to use: ${pattern.whenToUse}`);
      instructions.push(`Steps to follow: ${pattern.steps.join(', ')}`);
      
      if (pattern.antiPatterns.length > 0) {
        instructions.push(`🚨 Avoid: ${pattern.antiPatterns.join(', ')}`);
      }
    });
    
    return instructions.join('\n');
  }

  /**
   * Extract relevant code examples for AI role
   */
  extractCodeExamples(patterns, role) {
    const examples = {};
    
    patterns.forEach(pattern => {
      Object.entries(pattern.codeExamples).forEach(([language, code]) => {
        if (this.isLanguageRelevantForRole(language, role)) {
          examples[`${pattern.name}_${language}`] = code;
        }
      });
    });
    
    return examples;
  }

  /**
   * Check if programming language/framework is relevant for role
   */
  isLanguageRelevantForRole(language, role) {
    const languageMapping = {
      frontend: ['typescript', 'react', 'javascript', 'tsx'],
      backend: ['python', 'javascript', 'node', 'express', 'fastapi'],
      devops: ['yaml', 'docker', 'bash', 'shell', 'kubernetes'],
      testing: ['jest', 'cypress', 'junit', 'pytest']
    };
    
    const relevantLangs = languageMapping[role] || [];
    const langLower = language.toLowerCase();
    
    return relevantLangs.some(lang => langLower.includes(lang));
  }

  /**
   * Extract anti-patterns to avoid
   */
  extractAntiPatterns(patterns) {
    const antiPatterns = [];
    
    patterns.forEach(pattern => {
      pattern.antiPatterns.forEach(antiPattern => {
        antiPatterns.push(`${pattern.name}: ${antiPattern}`);
      });
    });
    
    return antiPatterns;
  }

  /**
   * Generate quality gates from patterns
   */
  generateQualityGates(patterns) {
    const gates = [
      'All code must be syntactically correct',
      'Tests must pass before deployment', 
      'Security scanning must pass',
      'Performance benchmarks must be met'
    ];
    
    // Add pattern-specific quality gates
    patterns.forEach(pattern => {
      if (pattern.name.includes('CI/CD Gate')) {
        gates.push('ADR reference required for major changes');
      }
      if (pattern.name.includes('Multi-Language')) {
        gates.push('Code examples must be idiomatic for each language');
      }
    });
    
    return gates;
  }

  /**
   * Generate documentation requirements
   */
  generateDocumentationRequirements() {
    return [
      'Generate ADR for all architectural decisions',
      'Document API endpoints with examples',
      'Create runbook for deployment and operations',
      'Include performance and security considerations',
      'Update pattern cards with lessons learned'
    ];
  }

  /**
   * Auto-generate ADR from AI team decision
   */
  async generateADR(decision, aiAgent, context) {
    const adrNumber = await this.getNextADRNumber();
    const adrFileName = `ADR-${adrNumber.toString().padStart(4, '0')}-${decision.slug}.md`;
    const adrPath = path.join(this.adrPath, adrFileName);
    
    const adrContent = `# ADR-${adrNumber}: ${decision.title}

**Status:** Accepted  
**Date:** ${new Date().toISOString().split('T')[0]}  
**AI Agent:** ${aiAgent}  
**Context:** ${context}

## Problem
${decision.problem}

## Decision  
${decision.solution}

## Rationale
${decision.rationale}

## Consequences
### Positive
${decision.positiveConsequences.map(c => `- ${c}`).join('\n')}

### Negative  
${decision.negativeConsequences.map(c => `- ${c}`).join('\n')}

## Implementation
- Code changes: ${decision.implementationDetails}
- Testing approach: ${decision.testingApproach}
- Monitoring: ${decision.monitoringApproach}

---
*Auto-generated by AI Pattern Bridge - Krin & Mandy Revolutionary Development System*
`;

    fs.writeFileSync(adrPath, adrContent);
    console.log(`📋 ADR-${adrNumber} generated: ${decision.title}`);
    
    return adrFileName;
  }

  /**
   * Get next ADR number
   */
  async getNextADRNumber() {
    try {
      const adrFiles = fs.readdirSync(this.adrPath)
        .filter(file => file.match(/^ADR-\d{4}-/))
        .map(file => {
          const match = file.match(/^ADR-(\d{4})-/);
          return match ? parseInt(match[1]) : 0;
        });
      
      return adrFiles.length > 0 ? Math.max(...adrFiles) + 1 : 1;
    } catch (error) {
      return 1;
    }
  }

  /**
   * Main method: Process project description and generate complete AI coordination
   */
  async processProject(description, options = {}) {
    console.log('🚀 Starting revolutionary autonomous development process...');
    console.log(`📝 Project: ${description}`);
    
    try {
      // Generate AI team instructions from patterns
      const instructions = await this.generateAIInstructions(description, options.type);
      
      // Create project workspace
      const projectSlug = description.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      
      const workspacePath = path.join(__dirname, '..', 'generated-projects', projectSlug);
      
      if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
      }
      
      // Save AI instructions
      const instructionsPath = path.join(workspacePath, 'ai-instructions.json');
      fs.writeFileSync(instructionsPath, JSON.stringify(instructions, null, 2));
      
      console.log('✅ AI Pattern Bridge ready for autonomous development!');
      console.log(`📁 Workspace: ${workspacePath}`);
      console.log('🤖 AI teams assigned with pattern-driven instructions');
      
      return {
        success: true,
        workspace: workspacePath,
        instructions: instructions,
        projectSlug: projectSlug
      };
      
    } catch (error) {
      console.error('❌ Failed to process project:', error);
      throw error;
    }
  }
}

module.exports = { AIPatternBridge };

// Export for direct usage
if (require.main === module) {
  const bridge = new AIPatternBridge();
  
  // Demo usage
  bridge.processProject("Todo app with user authentication and dark mode")
    .then(result => {
      console.log('🎉 Revolutionary development process initialized!');
      console.log('Next: Connect to Claude Code Coordination for autonomous building');
    })
    .catch(console.error);
}