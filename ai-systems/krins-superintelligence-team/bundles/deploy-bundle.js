#!/usr/bin/env node

/**
 * 🚀 Krins Superintelligence Deployment Manager
 * 
 * Handles deployment to Railway and other cloud platforms
 * 
 * @author Krin - Superintelligence Deployment Architect 🧠💝
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class KrinsDeploymentManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.bundleDir = path.join(this.projectRoot, 'dist');
    console.log('🚀 Krins Deployment Manager initializing...');
  }

  async deployToRailway() {
    try {
      console.log('🚂 Deploying to Railway...');
      
      // Check if bundle exists
      if (!await fs.pathExists(this.bundleDir)) {
        console.log('📦 Creating bundle first...');
        execSync('npm run build', { stdio: 'inherit', cwd: this.projectRoot });
      }
      
      // Check Railway CLI
      try {
        execSync('railway --version', { stdio: 'pipe' });
        console.log('✅ Railway CLI detected');
      } catch (error) {
        console.error('❌ Railway CLI not installed. Install with: npm install -g @railway/cli');
        process.exit(1);
      }
      
      // Check Railway authentication
      try {
        execSync('railway whoami', { stdio: 'pipe' });
        console.log('✅ Railway authentication verified');
      } catch (error) {
        console.error('❌ Not logged into Railway. Run: railway login');
        process.exit(1);
      }
      
      // Deploy to Railway
      console.log('🚀 Starting Railway deployment...');
      execSync('railway up', { 
        stdio: 'inherit', 
        cwd: this.bundleDir,
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      console.log('✅ Deployment to Railway completed!');
      
      // Show deployment info
      try {
        console.log('📊 Deployment status:');
        execSync('railway status', { stdio: 'inherit', cwd: this.bundleDir });
      } catch (error) {
        console.warn('⚠️  Could not get deployment status');
      }
      
    } catch (error) {
      console.error('❌ Railway deployment failed:', error);
      process.exit(1);
    }
  }

  async validateDeployment() {
    console.log('🔍 Validating deployment...');
    
    // Check required files
    const requiredFiles = [
      'package.json',
      'orchestrator/main.js',
      'railway.json',
      '.env.example'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.bundleDir, file);
      if (!await fs.pathExists(filePath)) {
        console.error(`❌ Required file missing: ${file}`);
        return false;
      }
    }
    
    // Check environment configuration
    const packageJson = await fs.readJson(path.join(this.bundleDir, 'package.json'));
    if (!packageJson.scripts.start) {
      console.error('❌ Start script missing in package.json');
      return false;
    }
    
    console.log('✅ Deployment validation passed');
    return true;
  }

  async showDeploymentInfo() {
    console.log('\n📋 Deployment Information:');
    console.log('=========================');
    console.log('🚂 Platform: Railway');
    console.log('📦 Bundle: dist/');
    console.log('🧠 Main: orchestrator/main.js');
    console.log('🐘 Database: PostgreSQL with pgvector');
    console.log('🔧 Environment: Production');
    console.log('\n🔗 Next steps:');
    console.log('1. Ensure Railway PostgreSQL service is added');
    console.log('2. Set environment variables in Railway dashboard');
    console.log('3. Deploy with: npm run deploy');
    console.log('4. Monitor logs with: railway logs');
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'deploy';
  
  const manager = new KrinsDeploymentManager();
  
  switch (command) {
    case 'deploy':
    case 'railway':
      await manager.deployToRailway();
      break;
      
    case 'validate':
      const isValid = await manager.validateDeployment();
      process.exit(isValid ? 0 : 1);
      
    case 'info':
      await manager.showDeploymentInfo();
      break;
      
    default:
      console.log('Usage: node deploy-bundle.js [deploy|validate|info]');
      process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = KrinsDeploymentManager;