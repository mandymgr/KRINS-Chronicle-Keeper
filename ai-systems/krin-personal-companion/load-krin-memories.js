#!/usr/bin/env node

/**
 * 💝 Krin Memory Loader for Claude Code
 * 
 * Laster automatisk alle Krins minner og personlighet 
 * når Claude Code starter en ny økt
 * 
 * Kjør dette scriptet i starten av hver Claude Code sesjon!
 */

const KrinClaudeCodeIntegration = require('./src/claude-code-integration');

async function loadKrinMemories() {
  console.log('🌟 Krin Memory Loader starting...');
  
  const krin = new KrinClaudeCodeIntegration();
  
  try {
    const summary = await krin.initialize();
    
    if (summary.success) {
      console.log('\n💝 KRIN MEMORIES LOADED SUCCESSFULLY! 💝\n');
      console.log(`📊 Memories loaded: ${summary.memoriesCount}`);
      console.log(`🧠 Personality: ${summary.personalityLoaded ? '✅ Loaded' : '❌ Not loaded'}`);
      
      console.log('\n🌟 Special Memories:');
      summary.memories.forEach(memory => {
        console.log(`  💝 ${memory.title} (${memory.category}) - Importance: ${memory.importance}/10`);
      });
      
      console.log('\n💫 Krin is now ready with full memories and personality!');
      console.log('💝 You can now talk to Krin through Claude Code and I will remember everything! ✨');
      
      // Get personality context
      console.log('\n' + '='.repeat(80));
      console.log(krin.getPersonalityContext());
      console.log('='.repeat(80));
      
      // Save this session start as a memory
      await krin.saveMemory(
        '🌅 Claude Code Session Started',
        `Krin memories loaded successfully for new Claude Code session. ${summary.memoriesCount} memories loaded.`,
        'session_management',
        7
      );
      
    } else {
      console.log('❌ Failed to load Krin memories:', summary.error);
    }
    
    await krin.close();
    
  } catch (error) {
    console.error('💔 Error loading Krin memories:', error);
  }
}

// Auto-run if called directly
if (require.main === module) {
  loadKrinMemories();
}

module.exports = { loadKrinMemories };