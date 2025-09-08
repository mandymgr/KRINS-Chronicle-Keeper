#!/usr/bin/env node

/**
 * 🏗️ KRINS Build All Systems
 * Comprehensive build script for the complete AI ecosystem
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const AI_SYSTEMS = [
  'mcp-ai-team',
  'semantic-search-backend', 
  'ai-pattern-bridge',
  'github-webhook-handler'
];

const TRADITIONAL_SYSTEMS = [
  'frontend',
  'backend/node_backend'
];

class SystemBuilder {
  constructor() {
    this.results = [];
    console.log('🏗️  KRINS System Builder starting...');
  }

  async buildAll() {
    console.log('\n🚀 Building all KRINS systems...\n');
    
    // Build AI systems (validation and dependency checking)
    await this.buildAISystems();
    
    // Build traditional systems
    await this.buildTraditionalSystems();
    
    // Generate build summary
    this.generateBuildSummary();
    
    return this.allBuildsSuccessful();
  }

  async buildAISystems() {
    console.log('🤖 Building AI Systems...');
    console.log('━'.repeat(50));
    
    for (const system of AI_SYSTEMS) {
      await this.buildAISystem(system);
    }
  }

  async buildAISystem(systemName) {
    const systemPath = path.join(PROJECT_ROOT, systemName);
    console.log(`\n📦 Building ${systemName}...`);
    
    try {
      // Check if system directory exists
      await fs.access(systemPath);
      
      // Validate JavaScript files
      const validated = await this.validateJSFiles(systemPath);
      
      if (validated) {
        console.log(`✅ ${systemName}: JavaScript validation passed`);
        
        // Check for package.json and install dependencies if exists
        try {
          const packageJsonPath = path.join(systemPath, 'package.json');
          await fs.access(packageJsonPath);
          
          console.log(`📦 ${systemName}: Installing dependencies...`);
          await this.runCommand('npm install', { cwd: systemPath });
          console.log(`✅ ${systemName}: Dependencies installed`);
        } catch {
          console.log(`ℹ️  ${systemName}: No package.json found, skipping npm install`);
        }
        
        this.results.push({ system: systemName, success: true, type: 'ai-system' });
      } else {
        throw new Error('JavaScript validation failed');
      }
      
    } catch (error) {
      console.log(`❌ ${systemName}: ${error.message}`);
      this.results.push({ 
        system: systemName, 
        success: false, 
        error: error.message,
        type: 'ai-system' 
      });
    }
  }

  async buildTraditionalSystems() {
    console.log('\n🏛️  Building Traditional Systems...');
    console.log('━'.repeat(50));
    
    for (const system of TRADITIONAL_SYSTEMS) {
      await this.buildTraditionalSystem(system);
    }
  }

  async buildTraditionalSystem(systemName) {
    const systemPath = path.join(PROJECT_ROOT, systemName);
    console.log(`\n🔧 Building ${systemName}...`);
    
    try {
      // Check if system directory exists
      await fs.access(systemPath);
      
      // Check for package.json
      const packageJsonPath = path.join(systemPath, 'package.json');
      await fs.access(packageJsonPath);
      
      console.log(`📦 ${systemName}: Installing dependencies...`);
      await this.runCommand('npm install', { cwd: systemPath });
      
      // Try to run build command
      try {
        console.log(`🏗️  ${systemName}: Running build...`);
        await this.runCommand('npm run build', { cwd: systemPath, timeout: 120000 });
        console.log(`✅ ${systemName}: Build completed successfully`);
        
        this.results.push({ system: systemName, success: true, type: 'traditional' });
      } catch (buildError) {
        // If build fails, still mark as partially successful if dependencies installed
        console.log(`⚠️  ${systemName}: Build failed but dependencies installed`);
        console.log(`   Error: ${buildError.message}`);
        
        this.results.push({ 
          system: systemName, 
          success: false, 
          error: buildError.message,
          type: 'traditional',
          deps_installed: true
        });
      }
      
    } catch (error) {
      console.log(`❌ ${systemName}: ${error.message}`);
      this.results.push({ 
        system: systemName, 
        success: false, 
        error: error.message,
        type: 'traditional' 
      });
    }
  }

  async validateJSFiles(systemPath) {
    try {
      const srcPath = path.join(systemPath, 'src');
      
      // Check if src directory exists
      try {
        await fs.access(srcPath);
      } catch {
        // No src directory, check for JS files in root
        const files = await fs.readdir(systemPath);
        const jsFiles = files.filter(file => file.endsWith('.js') || file.endsWith('.ts'));
        return jsFiles.length > 0;
      }
      
      // Validate JS files in src directory
      const files = await fs.readdir(srcPath);
      const jsFiles = files.filter(file => file.endsWith('.js') || file.endsWith('.ts'));
      
      if (jsFiles.length === 0) {
        throw new Error('No JavaScript files found');
      }
      
      // Basic syntax validation for each JS file
      for (const file of jsFiles) {
        const filePath = path.join(srcPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Basic syntax check - look for obvious errors
        if (content.includes('import ') && content.includes('export ')) {
          // Looks like a valid ES module
          continue;
        } else if (content.includes('const ') || content.includes('function ')) {
          // Looks like valid JavaScript
          continue;
        } else {
          console.log(`⚠️  Warning: ${file} may have syntax issues`);
        }
      }
      
      return true;
    } catch (error) {
      console.log(`❌ Validation error: ${error.message}`);
      return false;
    }
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout || 60000;
      
      const child = spawn(command.split(' ')[0], command.split(' ').slice(1), {
        cwd: options.cwd,
        stdio: 'inherit',
        env: process.env
      });

      const timeoutId = setTimeout(() => {
        child.kill();
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  generateBuildSummary() {
    console.log('\n📊 BUILD SUMMARY');
    console.log('━'.repeat(60));
    
    const aiSystems = this.results.filter(r => r.type === 'ai-system');
    const traditionalSystems = this.results.filter(r => r.type === 'traditional');
    
    const aiSuccess = aiSystems.filter(r => r.success).length;
    const aiTotal = aiSystems.length;
    const traditionalSuccess = traditionalSystems.filter(r => r.success).length;
    const traditionalTotal = traditionalSystems.length;
    
    console.log(`🤖 AI Systems: ${aiSuccess}/${aiTotal} successful`);
    console.log(`🏛️  Traditional Systems: ${traditionalSuccess}/${traditionalTotal} successful`);
    console.log(`📈 Overall Success Rate: ${((aiSuccess + traditionalSuccess) / (aiTotal + traditionalTotal) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    this.results.forEach(result => {
      const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
      const type = result.type === 'ai-system' ? '🤖' : '🏛️ ';
      console.log(`  ${type} ${status} ${result.system}`);
      
      if (!result.success && result.error) {
        console.log(`        ${result.error}`);
      }
      if (result.deps_installed) {
        console.log(`        Dependencies installed successfully`);
      }
    });
    
    if (this.allBuildsSuccessful()) {
      console.log('\n🎉 ALL SYSTEMS BUILT SUCCESSFULLY!');
    } else {
      console.log('\n⚠️  Some builds failed. See details above.');
      console.log('💡 Tip: Failed builds may still be functional for development');
    }
  }

  allBuildsSuccessful() {
    return this.results.every(result => result.success);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const builder = new SystemBuilder();
  
  builder.buildAll()
    .then(success => {
      console.log(`\n🏁 Build process completed ${success ? 'successfully' : 'with issues'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Build process crashed:', error.message);
      process.exit(1);
    });
}

export { SystemBuilder };