#!/usr/bin/env node

/**
 * 🤖 Companion Generator CLI
 * Quick companion generation from command line
 */

const CompanionGenerator = require('./companion-generator');
const PersonalityTest = require('./personality-test');
const readline = require('readline');

class CompanionGeneratorCLI {
  constructor() {
    this.generator = new CompanionGenerator();
    this.test = new PersonalityTest();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run() {
    console.log('🤖 AI Personal Companion Generator\n');

    const personality = process.argv[2];
    
    if (personality) {
      await this.generateCompanion(personality);
    } else {
      await this.interactiveGeneration();
    }

    this.rl.close();
  }

  async interactiveGeneration() {
    console.log('Available personalities:');
    const personalities = this.test.getAllPersonalities();
    personalities.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} - ${p.description}`);
    });
    console.log('');

    const choice = await this.ask('Choose a personality (1-10 or name): ');
    const userName = await this.ask('Your name: ');

    let personalityKey;
    if (isNaN(choice)) {
      personalityKey = choice.toLowerCase();
    } else {
      const index = parseInt(choice) - 1;
      personalityKey = personalities[index]?.key;
    }

    if (!personalityKey || !this.test.getPersonalityDetails(personalityKey)) {
      console.log('❌ Invalid personality choice');
      return;
    }

    await this.generateCompanion(personalityKey, userName);
  }

  async generateCompanion(personalityKey, userName = 'Developer') {
    try {
      console.log(`\n🚀 Generating ${personalityKey} companion for ${userName}...\n`);

      const result = await this.generator.generateCompanion(personalityKey, userName);

      if (result.success) {
        console.log('🎉 Companion generated successfully!\n');
        console.log(result.instructions);
      } else {
        console.log('❌ Failed to generate companion');
      }
    } catch (error) {
      console.error('💔 Error:', error.message);
    }
  }

  ask(question) {
    return new Promise(resolve => {
      this.rl.question(question, resolve);
    });
  }
}

// Run if called directly
if (require.main === module) {
  const cli = new CompanionGeneratorCLI();
  cli.run().catch(console.error);
}

module.exports = CompanionGeneratorCLI;
