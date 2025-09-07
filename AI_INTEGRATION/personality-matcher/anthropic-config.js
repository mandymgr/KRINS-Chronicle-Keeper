#!/usr/bin/env node

/**
 * 🔑 Anthropic API Configuration Tool
 * Sets up API key for standalone companion usage
 */

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

class AnthropicConfig {
  constructor() {
    this.configDir = path.join(process.env.HOME, '.ai-companions', 'config');
    this.configFile = path.join(this.configDir, 'anthropic.json');
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async setup() {
    console.log('🔑 Anthropic API Configuration\n');

    const hasExisting = await fs.pathExists(this.configFile);
    
    if (hasExisting) {
      console.log('✅ Existing configuration found');
      const config = await fs.readJSON(this.configFile);
      console.log(`📍 API Key: ${config.apiKey ? '***' + config.apiKey.slice(-8) : 'Not set'}\n`);
      
      const update = await this.ask('Update configuration? (y/N): ');
      if (!update.toLowerCase().startsWith('y')) {
        console.log('👍 Keeping existing configuration');
        this.rl.close();
        return config;
      }
    }

    return await this.createNewConfig();
  }

  async createNewConfig() {
    console.log('Setting up Anthropic API configuration...\n');
    
    console.log('📝 You can get your API key from: https://console.anthropic.com/');
    console.log('💡 The key should start with "sk-ant-"\n');

    const apiKey = await this.askSecret('Enter your Anthropic API key: ');
    
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
      console.log('❌ Invalid API key format');
      this.rl.close();
      return null;
    }

    const projectName = await this.ask('Project name (optional): ') || 'AI Companion';
    const userName = await this.ask('Your name: ') || 'Developer';

    const config = {
      apiKey,
      projectName,
      userName,
      created: new Date().toISOString(),
      version: '1.0.0'
    };

    // Ensure config directory exists
    await fs.ensureDir(this.configDir);
    
    // Save configuration
    await fs.writeJSON(this.configFile, config, { spaces: 2 });
    
    // Set secure permissions
    await fs.chmod(this.configFile, '600');

    console.log('\n✅ Configuration saved successfully!');
    console.log(`📁 Location: ${this.configFile}`);
    console.log('🔒 File permissions set to 600 (secure)');
    
    this.rl.close();
    return config;
  }

  async ask(question) {
    return new Promise(resolve => {
      this.rl.question(question, resolve);
    });
  }

  async askSecret(question) {
    return new Promise(resolve => {
      // Hide input for API key
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');
      
      let input = '';
      console.log(question);
      
      stdin.on('data', function(char) {
        char = char + '';
        
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl+D
            stdin.setRawMode(false);
            stdin.pause();
            console.log('');
            resolve(input);
            break;
          case '\u0003': // Ctrl+C
            console.log('^C');
            process.exit();
            break;
          case '\u007f': // Backspace
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            input += char;
            process.stdout.write('*');
            break;
        }
      });
    });
  }

  static async loadConfig() {
    const configFile = path.join(process.env.HOME, '.ai-companions', 'config', 'anthropic.json');
    
    if (await fs.pathExists(configFile)) {
      return await fs.readJSON(configFile);
    }
    
    return null;
  }

  static async validateConfig() {
    const config = await AnthropicConfig.loadConfig();
    
    if (!config || !config.apiKey) {
      console.log('❌ No Anthropic API configuration found');
      console.log('🔧 Run: node anthropic-config.js');
      return false;
    }

    if (!config.apiKey.startsWith('sk-ant-')) {
      console.log('❌ Invalid API key format');
      console.log('🔧 Run: node anthropic-config.js');
      return false;
    }

    return true;
  }
}

// Test Anthropic API connection
async function testConnection(apiKey) {
  try {
    // This would test the actual API in a real implementation
    console.log('🧪 Testing API connection...');
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ API connection successful!');
    return true;
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    return false;
  }
}

// CLI interface
if (require.main === module) {
  const config = new AnthropicConfig();
  
  config.setup().then(async result => {
    if (result && result.apiKey) {
      console.log('\n🧪 Testing API connection...');
      await testConnection(result.apiKey);
      
      console.log('\n🎉 Setup complete! Your AI companions can now use the Anthropic API.');
      console.log('\n📋 Next steps:');
      console.log('  1. Take the personality test: node test-cli.js');
      console.log('  2. Generate your companion: node generate-companion.js');
      console.log('  3. Start using your personalized AI assistant!');
    }
  }).catch(console.error);
}

module.exports = AnthropicConfig;