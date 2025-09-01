#!/usr/bin/env node

/**
 * 📦 Krins Superintelligence Bundle Creator
 * 
 * Creates deployment-ready bundles for Railway and other platforms
 * 
 * @author Krin - Superintelligence Bundle Architect 🧠💝
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class KrinsBundleCreator {
  constructor() {
    this.projectRoot = process.cwd();
    this.bundleDir = path.join(this.projectRoot, 'dist');
    console.log('📦 Krins Bundle Creator initializing...');
  }

  async createBundle() {
    try {
      console.log('🔨 Creating production bundle...');
      
      // Clean and create bundle directory
      await fs.remove(this.bundleDir);
      await fs.ensureDir(this.bundleDir);
      console.log('✅ Bundle directory prepared');

      // Copy essential files
      await this.copyEssentialFiles();
      
      // Generate production package.json
      await this.generateProductionPackageJson();
      
      // Copy environment example
      await this.copyEnvironmentConfig();
      
      // Generate Railway config
      await this.generateRailwayConfig();
      
      console.log('✅ Production bundle created successfully!');
      console.log(`📍 Bundle location: ${this.bundleDir}`);
      
    } catch (error) {
      console.error('❌ Bundle creation failed:', error);
      process.exit(1);
    }
  }

  async copyEssentialFiles() {
    const filesToCopy = [
      'orchestrator/',
      'agents/',
      'rag/',
      'config/',
      'production/',
      'scaling/',
      'scenarios/',
      'bundles/',
      'interface/',
      'data/',
      'integrations/',
      'README.md',
      'Dockerfile',
      'railway.json'
    ];

    for (const file of filesToCopy) {
      const srcPath = path.join(this.projectRoot, file);
      const destPath = path.join(this.bundleDir, file);
      
      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, destPath);
        console.log(`📁 Copied ${file}`);
      }
    }
  }

  async generateProductionPackageJson() {
    const packageJson = await fs.readJson(path.join(this.projectRoot, 'package.json'));
    
    // Production optimized package.json
    const prodPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      main: packageJson.main,
      scripts: {
        start: "node orchestrator/main.js",
        "railway:start": "node orchestrator/main.js",
        "railway:health": "node --check",
        test: "echo 'No tests in production bundle'"
      },
      keywords: packageJson.keywords,
      author: packageJson.author,
      license: packageJson.license,
      dependencies: packageJson.dependencies,
      engines: {
        node: ">=18.0.0",
        npm: ">=8.0.0"
      }
    };

    await fs.writeJson(
      path.join(this.bundleDir, 'package.json'), 
      prodPackageJson, 
      { spaces: 2 }
    );
    console.log('📄 Production package.json generated');
  }

  async copyEnvironmentConfig() {
    const envExample = path.join(this.projectRoot, '.env.example');
    const destEnvExample = path.join(this.bundleDir, '.env.example');
    
    if (await fs.pathExists(envExample)) {
      await fs.copy(envExample, destEnvExample);
      console.log('🔧 Environment config copied');
    }
  }

  async generateRailwayConfig() {
    const railwayConfig = {
      "$schema": "https://railway.app/railway.schema.json",
      build: {
        builder: "NIXPACKS",
        buildCommand: "npm install --production"
      },
      deploy: {
        startCommand: "npm start",
        healthcheckPath: "/health",
        healthcheckTimeout: 300,
        restartPolicyType: "ON_FAILURE",
        restartPolicyMaxRetries: 10
      },
      environments: {
        production: {
          variables: {
            NODE_ENV: "production",
            PORT: "${{PORT}}",
            DATABASE_URL: "${{DATABASE_URL}}",
            POSTGRES_URL: "${{DATABASE_URL}}"
          }
        }
      }
    };

    await fs.writeJson(
      path.join(this.bundleDir, 'railway.json'),
      railwayConfig,
      { spaces: 2 }
    );
    console.log('🚂 Railway configuration generated');
  }
}

// Run bundle creation
if (require.main === module) {
  const creator = new KrinsBundleCreator();
  creator.createBundle();
}

module.exports = KrinsBundleCreator;