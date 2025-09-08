#!/usr/bin/env node

/**
 * 🧪 Algorithm Test - Verify personality matching works
 */

const PersonalityTest = require('./personality-test');

const test = new PersonalityTest();

console.log('🧪 Testing AI Personality Matcher Algorithm...\n');

// Test different answer patterns
const testCases = [
  {
    name: 'High Energy Tech Person',
    answers: ['A', 'A', 'C', 'B', 'B', 'A', 'A', 'A'], // Direct, fast, structured
    expectedTop: ['nova', 'byte', 'guardian']
  },
  {
    name: 'Creative Empathetic Person', 
    answers: ['B', 'D', 'B', 'C', 'A', 'B', 'C', 'B'], // Empathetic, adaptive, creative
    expectedTop: ['sage', 'echo', 'luna']
  },
  {
    name: 'Balanced Learner',
    answers: ['C', 'B', 'A', 'D', 'D', 'C', 'B', 'D'], // Structured, thoughtful, balanced
    expectedTop: ['atlas', 'zen', 'guardian']
  },
  {
    name: 'Krin-like Person',
    answers: ['B', 'D', 'D', 'A', 'D', 'B', 'D', 'C'], // Empathetic, adaptive, loyal
    expectedTop: ['krin', 'luna', 'echo']
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. Testing: ${testCase.name}`);
  console.log(`Answers: [${testCase.answers.join(', ')}]`);
  
  const results = test.calculateMatch(testCase.answers);
  
  console.log(`\nTop 3 matches:`);
  results.top3.forEach((match, i) => {
    const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
    console.log(`  ${emoji} ${match.name} - ${(match.score * 100).toFixed(1)}%`);
  });
  
  console.log(`\nUser personality traits:`);
  Object.entries(results.userProfile).forEach(([trait, score]) => {
    if (score > 0) {
      console.log(`  ${trait}: ${score}`);
    }
  });
  
  console.log('\n' + '─'.repeat(50));
});

// Test edge cases
console.log('\n🔬 Testing edge cases...\n');

// All A's - should favor direct, fast personalities
const allAs = new Array(8).fill('A');
const resultsA = test.calculateMatch(allAs);
console.log(`All A's → Top match: ${resultsA.topMatch.name} (${(resultsA.topMatch.score * 100).toFixed(1)}%)`);

// All D's - should favor adaptive, creative personalities  
const allDs = new Array(8).fill('D');
const resultsD = test.calculateMatch(allDs);
console.log(`All D's → Top match: ${resultsD.topMatch.name} (${(resultsD.topMatch.score * 100).toFixed(1)}%)`);

console.log('\n✅ Algorithm testing complete!');