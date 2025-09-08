#!/usr/bin/env bun
/**
 * Explain PR Tool - Genererer detaljerte PR-beskrivelser basert på git diff og kode-endringer
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PRExplainer {
  constructor() {
    this.rootDir = process.cwd();
    this.patterns = this.loadPatterns();
  }

  loadPatterns() {
    const patternsDir = path.join(this.rootDir, 'docs', 'patterns');
    const patterns = [];
    
    try {
      if (fs.existsSync(patternsDir)) {
        const files = fs.readdirSync(patternsDir)
          .filter(f => f.endsWith('-pattern.md'));
        
        for (const file of files) {
          const content = fs.readFileSync(path.join(patternsDir, file), 'utf8');
          const name = content.match(/# Pattern: (.+)/)?.[1] || file.replace('-pattern.md', '');
          patterns.push({ name, file, keywords: this.extractKeywords(content) });
        }
      }
    } catch (error) {
      console.warn('Could not load patterns:', error.message);
    }
    
    return patterns;
  }

  extractKeywords(content) {
    const keywords = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('React') || line.includes('component')) keywords.push('React');
      if (line.includes('API') || line.includes('endpoint')) keywords.push('API');
      if (line.includes('database') || line.includes('SQL')) keywords.push('Database');
      if (line.includes('test') || line.includes('jest')) keywords.push('Testing');
      if (line.includes('security') || line.includes('auth')) keywords.push('Security');
      if (line.includes('performance') || line.includes('cache')) keywords.push('Performance');
    }
    
    return [...new Set(keywords)];
  }

  getGitDiff() {
    try {
      return execSync('git diff HEAD~1 HEAD', { encoding: 'utf8' });
    } catch (error) {
      try {
        return execSync('git diff --cached', { encoding: 'utf8' });
      } catch {
        return execSync('git diff', { encoding: 'utf8' });
      }
    }
  }

  getGitStatus() {
    try {
      return execSync('git status --porcelain', { encoding: 'utf8' });
    } catch (error) {
      return '';
    }
  }

  getCommitMessage() {
    try {
      return execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'No commit message found';
    }
  }

  analyzeDiff(diff) {
    const analysis = {
      filesChanged: 0,
      linesAdded: 0,
      linesRemoved: 0,
      fileTypes: new Set(),
      changes: [],
      patterns: []
    };

    const files = diff.split('diff --git').slice(1);
    analysis.filesChanged = files.length;

    for (const file of files) {
      const lines = file.split('\n');
      const filePath = lines[0]?.match(/b\/(.+)/)?.[1] || 'unknown';
      
      const ext = path.extname(filePath).slice(1);
      if (ext) analysis.fileTypes.add(ext);

      let added = 0, removed = 0;
      const changes = [];

      for (const line of lines) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          added++;
          changes.push({ type: 'added', content: line.slice(1) });
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          removed++;
          changes.push({ type: 'removed', content: line.slice(1) });
        }
      }

      analysis.linesAdded += added;
      analysis.linesRemoved += removed;
      analysis.changes.push({ file: filePath, added, removed, changes });
    }

    // Detect patterns
    for (const change of analysis.changes) {
      const fileContent = change.changes.map(c => c.content).join(' ').toLowerCase();
      
      for (const pattern of this.patterns) {
        if (pattern.keywords.some(keyword => 
          fileContent.includes(keyword.toLowerCase()) || 
          change.file.toLowerCase().includes(keyword.toLowerCase())
        )) {
          analysis.patterns.push(pattern.name);
        }
      }
    }

    analysis.patterns = [...new Set(analysis.patterns)];
    analysis.fileTypes = [...analysis.fileTypes];

    return analysis;
  }

  categorizeChange(analysis) {
    const { fileTypes, linesAdded, linesRemoved, patterns, changes } = analysis;
    
    // Feature detection
    if (linesAdded > linesRemoved * 2) return 'feature';
    if (linesRemoved > linesAdded * 2) return 'cleanup';
    if (patterns.includes('Testing') || fileTypes.includes('test')) return 'testing';
    if (patterns.includes('Security')) return 'security';
    if (patterns.includes('Performance')) return 'performance';
    if (fileTypes.includes('md')) return 'documentation';
    
    // Look for bug fix indicators
    const allContent = changes.flatMap(c => c.changes).map(c => c.content.toLowerCase()).join(' ');
    if (allContent.includes('fix') || allContent.includes('bug') || allContent.includes('error')) {
      return 'bugfix';
    }
    
    return 'enhancement';
  }

  generatePRDescription(analysis, commitMessage) {
    const category = this.categorizeChange(analysis);
    const categoryEmoji = {
      'feature': '✨',
      'bugfix': '🐛', 
      'enhancement': '🔧',
      'testing': '🧪',
      'security': '🔒',
      'performance': '⚡',
      'documentation': '📚',
      'cleanup': '🧹'
    }[category] || '📝';

    let description = `${categoryEmoji} **${category.toUpperCase()}**: ${commitMessage}\n\n`;

    // Summary section
    description += `## 📊 Summary\n`;
    description += `- **Files changed**: ${analysis.filesChanged}\n`;
    description += `- **Lines added**: ${analysis.linesAdded}\n`;
    description += `- **Lines removed**: ${analysis.linesRemoved}\n`;
    description += `- **File types**: ${analysis.fileTypes.join(', ')}\n\n`;

    // Changes section
    description += `## 🔄 Changes\n`;
    for (const change of analysis.changes.slice(0, 10)) { // Limit to 10 files
      description += `### \`${change.file}\`\n`;
      description += `- Added: ${change.added} lines\n`;
      description += `- Removed: ${change.removed} lines\n\n`;
    }

    // Patterns section
    if (analysis.patterns.length > 0) {
      description += `## 🏗️ Related Patterns\n`;
      for (const pattern of analysis.patterns) {
        description += `- ${pattern}\n`;
      }
      description += '\n';
    }

    // Testing section
    description += `## 🧪 Testing\n`;
    if (analysis.fileTypes.includes('test') || analysis.patterns.includes('Testing')) {
      description += `- [x] Tests included/updated\n`;
    } else {
      description += `- [ ] Tests need to be added\n`;
    }
    description += `- [ ] Manual testing completed\n`;
    description += `- [ ] CI pipeline passes\n\n`;

    // Impact section
    description += `## 💥 Impact\n`;
    description += this.generateImpactAnalysis(analysis, category);

    // Checklist
    description += `\n## ✅ Checklist\n`;
    description += `- [ ] Code follows project conventions\n`;
    description += `- [ ] Self-review completed\n`;
    description += `- [ ] Documentation updated\n`;
    description += `- [ ] No breaking changes (or documented)\n`;

    return description;
  }

  generateImpactAnalysis(analysis, category) {
    let impact = '';

    switch (category) {
      case 'feature':
        impact += '- Adds new functionality for users\n';
        impact += '- May require documentation updates\n';
        impact += '- Could impact API compatibility\n';
        break;
      case 'bugfix':
        impact += '- Fixes existing functionality\n';
        impact += '- Improves system reliability\n';
        impact += '- Low risk of side effects\n';
        break;
      case 'security':
        impact += '- Enhances system security\n';
        impact += '- May require security review\n';
        impact += '- Critical for production deployment\n';
        break;
      case 'performance':
        impact += '- Improves system performance\n';
        impact += '- May affect resource usage\n';
        impact += '- Requires performance testing\n';
        break;
      default:
        impact += '- Standard code enhancement\n';
        impact += '- Follow normal review process\n';
        impact += '- Low to medium impact\n';
    }

    return impact;
  }

  generateCommitSuggestion(analysis) {
    const category = this.categorizeChange(analysis);
    const scope = this.inferScope(analysis);
    
    const types = {
      'feature': 'feat',
      'bugfix': 'fix',
      'enhancement': 'refactor',
      'testing': 'test',
      'security': 'security',
      'performance': 'perf',
      'documentation': 'docs',
      'cleanup': 'chore'
    };

    const type = types[category] || 'update';
    const scopeText = scope ? `(${scope})` : '';
    
    return `${type}${scopeText}: [Add descriptive message]`;
  }

  inferScope(analysis) {
    const { fileTypes, changes } = analysis;
    
    // Check common directories
    const directories = changes.map(c => c.file.split('/')[0]).filter(Boolean);
    const mostCommon = directories.reduce((acc, dir) => {
      acc[dir] = (acc[dir] || 0) + 1;
      return acc;
    }, {});
    
    const topDir = Object.keys(mostCommon).reduce((a, b) => 
      mostCommon[a] > mostCommon[b] ? a : b, '');

    if (topDir && topDir !== 'src') return topDir;
    if (fileTypes.includes('tsx') || fileTypes.includes('jsx')) return 'ui';
    if (fileTypes.includes('ts') || fileTypes.includes('js')) return 'core';
    if (fileTypes.includes('py')) return 'api';
    if (fileTypes.includes('md')) return 'docs';
    
    return '';
  }

  async run(options = {}) {
    console.log('🔍 Analyzing changes for PR description...\n');

    try {
      const diff = this.getGitDiff();
      const status = this.getGitStatus();
      const commitMessage = this.getCommitMessage();

      if (!diff.trim()) {
        console.log('❌ No changes found. Make sure you have committed changes or staged files.');
        return;
      }

      console.log('📊 Change Analysis:');
      const analysis = this.analyzeDiff(diff);
      
      console.log(`- Files changed: ${analysis.filesChanged}`);
      console.log(`- Lines added: ${analysis.linesAdded}`);
      console.log(`- Lines removed: ${analysis.linesRemoved}`);
      console.log(`- File types: ${analysis.fileTypes.join(', ')}`);
      console.log(`- Related patterns: ${analysis.patterns.join(', ') || 'None detected'}\n`);

      const prDescription = this.generatePRDescription(analysis, commitMessage);
      const commitSuggestion = this.generateCommitSuggestion(analysis);

      console.log('📝 Generated PR Description:');
      console.log('=' .repeat(50));
      console.log(prDescription);
      console.log('=' .repeat(50));

      console.log(`\n💡 Suggested commit message: ${commitSuggestion}\n`);

      // Save to file if requested
      if (options.save || options.output) {
        const outputFile = options.output || 'PR_DESCRIPTION.md';
        fs.writeFileSync(outputFile, prDescription);
        console.log(`📄 PR description saved to: ${outputFile}`);
      }

    } catch (error) {
      console.error('❌ Error analyzing changes:', error.message);
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
📝 PR Explanation Tool

Automatically generates detailed PR descriptions based on git changes and code analysis.

Usage:
  node explain-pr.js                    # Generate PR description
  node explain-pr.js --save            # Save to PR_DESCRIPTION.md
  node explain-pr.js --output FILE     # Save to specific file
  
Options:
  --save            Save PR description to PR_DESCRIPTION.md
  --output FILE     Save PR description to specified file
  --help           Show this help message

Features:
  • Analyzes git diff to understand changes
  • Detects file types and change patterns
  • Maps changes to established patterns
  • Generates structured PR descriptions
  • Suggests appropriate commit messages
  • Creates testing and impact checklists

Examples:
  node explain-pr.js --save
  node explain-pr.js --output pr-template.md
`);
    return;
  }

  const options = {
    save: args.includes('--save'),
    output: args.includes('--output') ? args[args.indexOf('--output') + 1] : null
  };

  const explainer = new PRExplainer();
  await explainer.run(options);
}

if (require.main === module) {
  main();
}

module.exports = PRExplainer;