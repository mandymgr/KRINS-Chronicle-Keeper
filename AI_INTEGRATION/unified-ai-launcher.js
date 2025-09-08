#!/usr/bin/env bun
/**
 * 🚀 KRINS Unified AI Launcher
 * 
 * Launches both Krin Personal Companion and Chronicle Keeper organizational
 * intelligence in a unified system for maximum AI coordination
 */

const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// Import unified intelligence system
const KrinChronicleKeeperIntegration = require('./krin-companion/src/chronicle-keeper-integration');

class UnifiedAILauncher {
  constructor() {
    this.integration = new KrinChronicleKeeperIntegration();
    this.isRunning = false;
  }

  async initialize() {
    console.log('🚀 KRINS Unified AI System - Initializing...');
    console.log('════════════════════════════════════════════════════════════');
    
    try {
      // Initialize unified intelligence
      const status = await this.integration.initialize();
      
      if (status.success) {
        console.log('✅ Unified AI Intelligence System Ready!');
        console.log('──────────────────────────────────────────────────────────────');
        console.log('🧠 Personal Intelligence: Krin Companion with memory database');
        console.log('🎯 Organizational Intelligence: Chronicle Keeper ADRs + Patterns');
        console.log('📊 Database Connection: PostgreSQL + pgvector for semantic search');
        console.log('🔗 AI Coordination: Unified context generation available');
        console.log('──────────────────────────────────────────────────────────────');
        this.isRunning = true;
        return status;
      } else {
        console.error('❌ Failed to initialize unified AI system:', status.error);
        return status;
      }
      
    } catch (error) {
      console.error('💥 Critical initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  async generateContext(query, contextType = 'general') {
    if (!this.isRunning) {
      console.log('🔄 System not running, initializing...');
      await this.initialize();
    }

    console.log(`🎯 Generating unified context for: "${query}"`);
    console.log(`📋 Context type: ${contextType}`);
    
    const context = await this.integration.generateUnifiedContext(query, contextType);
    
    console.log('✅ Unified context generated!');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(context);
    console.log('══════════════════════════════════════════════════════════════');
    
    return context;
  }

  async saveMemory(title, content, category = 'ai_coordination', importance = 8) {
    if (!this.isRunning) {
      await this.initialize();
    }

    console.log(`💾 Saving unified memory: ${title}`);
    const result = await this.integration.krinIntegration.saveMemory(title, content, category, importance);
    
    if (result.success) {
      console.log('✅ Memory saved successfully');
    } else {
      console.error('❌ Failed to save memory:', result.error);
    }
    
    return result;
  }

  getSystemStatus() {
    return {
      isRunning: this.isRunning,
      ...this.integration.getSystemStatus()
    };
  }

  async shutdown() {
    console.log('🔄 Shutting down unified AI system...');
    await this.integration.close();
    this.isRunning = false;
    console.log('✅ Unified AI system shutdown complete');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const launcher = new UnifiedAILauncher();
  
  try {
    switch (command) {
      case 'init':
      case 'initialize':
        await launcher.initialize();
        break;
        
      case 'context':
        const query = args[1] || 'general context request';
        const contextType = args[2] || 'general';
        await launcher.generateContext(query, contextType);
        break;
        
      case 'status':
        const status = launcher.getSystemStatus();
        console.log('🎯 UNIFIED AI SYSTEM STATUS:');
        console.log(JSON.stringify(status, null, 2));
        break;
        
      case 'memory':
        const title = args[1] || 'Test Memory';
        const content = args[2] || 'Test memory content';
        await launcher.saveMemory(title, content);
        break;
        
      case 'demo':
        console.log('🚀 Running Unified AI Demo...');
        await launcher.initialize();
        
        // Demo context generation
        await launcher.generateContext('database architecture decisions', 'architectural');
        await launcher.generateContext('TypeScript patterns', 'pattern');
        await launcher.generateContext('incident response procedures', 'operational');
        
        // Demo memory saving
        await launcher.saveMemory(
          '🚀 Unified AI Demo Completed',
          'Successfully demonstrated unified intelligence system combining Krin personal companion with Chronicle Keeper organizational intelligence.',
          'demo',
          9
        );
        
        console.log('✅ Demo completed successfully!');
        break;
        
      default:
        console.log('🚀 KRINS Unified AI System - Usage:');
        console.log('');
        console.log('Commands:');
        console.log('  bun unified-ai-launcher.js init                    - Initialize system');
        console.log('  bun unified-ai-launcher.js context "query" [type]  - Generate context');
        console.log('  bun unified-ai-launcher.js status                  - Show status');
        console.log('  bun unified-ai-launcher.js memory "title" "content" - Save memory');
        console.log('  bun unified-ai-launcher.js demo                    - Run full demo');
        console.log('');
        console.log('Context types: general, architectural, pattern, operational, troubleshooting');
        console.log('');
        console.log('Example:');
        console.log('  bun unified-ai-launcher.js context "API design patterns" architectural');
        break;
    }
    
  } catch (error) {
    console.error('💥 Command failed:', error);
    process.exit(1);
  } finally {
    if (command !== 'status') {
      await launcher.shutdown();
    }
  }
}

// Export for module use
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { UnifiedAILauncher };