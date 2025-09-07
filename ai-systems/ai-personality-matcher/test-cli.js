#!/usr/bin/env node

/**
 * 🧠 AI Personality Matcher - CLI Test Interface
 * 
 * Terminal interface for å ta personlighetstesten og finne
 * din perfekte AI Personal Companion
 */

const PersonalityTest = require('./personality-test');
const readline = require('readline');
const chalk = require('chalk');

class PersonalityTestCLI {
  constructor() {
    this.test = new PersonalityTest();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.answers = [];
  }

  /**
   * Start the personality test
   */
  async start() {
    this.displayWelcome();
    
    const questions = this.test.getFormattedQuestions();
    
    for (let i = 0; i < questions.length; i++) {
      const answer = await this.askQuestion(questions[i]);
      this.answers.push(answer);
    }

    this.showResults();
    this.rl.close();
  }

  /**
   * Display welcome message
   */
  displayWelcome() {
    console.clear();
    console.log(chalk.cyan.bold('🧠 AI PERSONALITY MATCHER'));
    console.log(chalk.white('═'.repeat(50)));
    console.log();
    console.log(chalk.yellow('Finn din perfekte AI Personal Companion!'));
    console.log(chalk.gray('Svar på 8 spørsmål for å få matchet med din ideelle AI partner.'));
    console.log();
    console.log(chalk.green('Tilgjengelige personligheter:'));
    
    const personalities = this.test.getAllPersonalities();
    personalities.forEach(p => {
      console.log(chalk.cyan(`  ${p.name} - ${p.description}`));
    });
    
    console.log();
    console.log(chalk.white('─'.repeat(50)));
    console.log();
  }

  /**
   * Ask a single question
   */
  async askQuestion(question) {
    return new Promise((resolve) => {
      console.log(chalk.bold.blue(`Spørsmål ${question.id}/8:`));
      console.log(chalk.white(question.question));
      console.log();

      question.answers.forEach(answer => {
        console.log(chalk.green(`  ${answer.key}) ${answer.text}`));
      });
      
      console.log();
      
      const askForAnswer = () => {
        this.rl.question(chalk.yellow('Ditt svar (A/B/C/D): '), (answer) => {
          const upperAnswer = answer.toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(upperAnswer)) {
            console.log();
            console.log(chalk.white('─'.repeat(50)));
            console.log();
            resolve(upperAnswer);
          } else {
            console.log(chalk.red('Vennligst svar A, B, C eller D'));
            askForAnswer();
          }
        });
      };
      
      askForAnswer();
    });
  }

  /**
   * Show test results
   */
  showResults() {
    console.clear();
    
    const results = this.test.calculateMatch(this.answers);
    
    console.log(chalk.cyan.bold('🎉 DINE RESULTATER!'));
    console.log(chalk.white('═'.repeat(50)));
    console.log();
    
    // Show top match
    const topMatch = results.topMatch;
    console.log(chalk.green.bold(`🏆 DIN PERFEKTE MATCH: ${topMatch.name}`));
    console.log(chalk.white(`Match Score: ${(topMatch.score * 100).toFixed(1)}%`));
    console.log();
    console.log(chalk.yellow(`"${topMatch.tagline}"`));
    console.log();
    console.log(chalk.gray(`Ideell for: ${topMatch.ideal_for}`));
    console.log();
    console.log(chalk.white('─'.repeat(50)));
    console.log();
    
    // Show top 3 matches
    console.log(chalk.cyan.bold('🎯 DINE TOP 3 MATCHES:'));
    console.log();
    
    results.top3.forEach((match, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
      console.log(chalk.bold(`${medal} ${match.name} - ${(match.score * 100).toFixed(1)}% match`));
      console.log(chalk.gray(`   ${match.description}`));
      console.log();
    });
    
    console.log(chalk.white('─'.repeat(50)));
    console.log();
    
    // Show personality analysis
    console.log(chalk.cyan.bold('📊 DIN PERSONLIGHETS-PROFIL:'));
    console.log();
    
    const traits = results.userProfile;
    const maxTrait = Math.max(...Object.values(traits));
    
    Object.entries(traits).forEach(([trait, score]) => {
      const percentage = maxTrait > 0 ? (score / maxTrait) * 100 : 0;
      const bar = '█'.repeat(Math.round(percentage / 5));
      const traitName = trait.charAt(0).toUpperCase() + trait.slice(1);
      
      console.log(chalk.white(`${traitName.padEnd(15)} ${bar.padEnd(20)} ${score}`));
    });
    
    console.log();
    console.log(chalk.white('═'.repeat(50)));
    console.log();
    console.log(chalk.green.bold('🚀 NESTE STEG:'));
    console.log(chalk.white('1. Installer AI Personal Companion Generator'));
    console.log(chalk.white(`2. Velg ${topMatch.name} som din companion`));
    console.log(chalk.white('3. Start din personlige AI-partner!'));
    console.log();
    console.log(chalk.gray('Takk for at du tok testen! 💝'));
  }
}

// Check if we have required dependencies
try {
  require('chalk');
} catch (e) {
  console.log('Installing required dependencies...');
  require('child_process').execSync('npm install chalk', { stdio: 'inherit' });
  console.log('Dependencies installed! Restarting test...');
  require('child_process').spawn(process.argv0, process.argv.slice(1), { stdio: 'inherit' });
  process.exit();
}

// Start the test
const cli = new PersonalityTestCLI();
cli.start().catch(console.error);