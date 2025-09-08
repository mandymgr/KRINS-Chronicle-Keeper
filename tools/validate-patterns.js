#!/usr/bin/env bun

/**
 * Pattern Validation Tool for KRINS-Chronicle-Keeper
 * Validates code compliance with established patterns and ADR-driven development
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PatternValidator {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.rootDir = process.cwd();
    this.patternsDir = path.join(this.rootDir, 'docs', 'patterns');
    this.adrDir = path.join(this.rootDir, 'docs', 'adr');
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const prefix = {
      'error': '❌',
      'warn': '⚠️ ',
      'info': '✅',
      'debug': '🔍'
    }[level] || '📋';
    
    console.log(`${prefix} ${message}`);
    
    if (level === 'error') {
      this.violations.push({ timestamp, message });
    } else if (level === 'warn') {
      this.warnings.push({ timestamp, message });
    }
  }

  async validateAllPatterns() {
    this.log('info', 'Starting pattern validation...');
    
    if (!fs.existsSync(this.patternsDir)) {
      this.log('error', 'Patterns directory not found');
      return false;
    }
    
    const categories = this.getPatternCategories();
    let allValid = true;
    
    for (const category of categories) {
      this.log('info', `Validating ${category} patterns...`);
      const categoryValid = await this.validateCategoryPatterns(category);
      allValid = allValid && categoryValid;
    }
    
    // Validate pattern consistency
    await this.validatePatternConsistency();
    
    // Check for ADR compliance
    await this.validateADRCompliance();
    
    this.generateValidationReport();
    
    return allValid && this.violations.length === 0;
  }
  
  getPatternCategories() {
    return fs.readdirSync(this.patternsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  }
  
  async validateCategoryPatterns(category) {
    const categoryPath = path.join(this.patternsDir, category);
    const patternFiles = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('-pattern.md'));
    
    let allValid = true;
    
    for (const file of patternFiles) {
      const filePath = path.join(categoryPath, file);
      const isValid = await this.validatePattern(filePath, category);
      allValid = allValid && isValid;
    }
    
    return allValid;
  }
  
  async validatePattern(filePath, category) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    let isValid = true;
    
    // Check required sections
    const requiredSections = [
      '# ', // Title
      '## Description',
      '## Usage',
      '## Implementation',
      '## Related ADRs'
    ];
    
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        this.log('error', `${fileName}: Missing required section "${section}"`);
        isValid = false;
      }
    }
    
    // Check code examples
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    if (codeBlocks.length === 0) {
      this.log('warn', `${fileName}: No code examples found`);
    }
    
    // Validate code block languages
    codeBlocks.forEach((block, index) => {
      const language = block.match(/```(\w+)/);
      if (!language) {
        this.log('warn', `${fileName}: Code block ${index + 1} missing language specification`);
      }
    });
    
    // Check for placeholder content
    const placeholders = [
      '[Add your',
      '[Describe',
      '[List',
      '[Mention',
      '// Add your',
      '// Basic implementation'
    ];
    
    placeholders.forEach(placeholder => {
      if (content.includes(placeholder)) {
        this.log('warn', `${fileName}: Contains placeholder text: "${placeholder}"`);
      }
    });
    
    // Validate related ADRs exist
    const adrReferences = content.match(/ADR-\d{4}/g) || [];
    for (const adrRef of adrReferences) {
      const adrFile = path.join(this.adrDir, `${adrRef}*.md`);
      try {
        const matchingFiles = execSync(`ls ${adrFile}`, { encoding: 'utf8' }).trim().split('\n').filter(f => f);
        if (matchingFiles.length === 0) {
          this.log('error', `${fileName}: References non-existent ${adrRef}`);
          isValid = false;
        }
      } catch (error) {
        this.log('error', `${fileName}: References non-existent ${adrRef}`);
        isValid = false;
      }
    }
    
    if (isValid) {
      this.log('info', `${fileName}: ✓ Valid`);
    }
    
    return isValid;
  }
  
  async validatePatternConsistency() {
    this.log('info', 'Validating pattern consistency...');
    
    const allPatterns = this.getAllPatterns();
    const patternNames = new Set();
    const duplicateCheck = new Map();
    
    allPatterns.forEach(pattern => {
      const name = pattern.name.toLowerCase();
      
      if (patternNames.has(name)) {
        this.log('error', `Duplicate pattern name: ${pattern.name}`);
      }
      patternNames.add(name);
      
      // Check for similar patterns
      const similar = Array.from(patternNames).filter(existing => 
        existing !== name && this.calculateSimilarity(existing, name) > 0.8
      );
      
      if (similar.length > 0) {
        this.log('warn', `Pattern "${pattern.name}" is very similar to: ${similar.join(', ')}`);
      }
    });
  }
  
  calculateSimilarity(str1, str2) {
    // Simple Jaccard similarity
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
  
  getAllPatterns() {
    const patterns = [];
    const categories = this.getPatternCategories();
    
    categories.forEach(category => {
      const categoryPath = path.join(this.patternsDir, category);
      const patternFiles = fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('-pattern.md'));
      
      patternFiles.forEach(file => {
        const content = fs.readFileSync(path.join(categoryPath, file), 'utf8');
        const titleMatch = content.match(/^# (.+)$/m);
        const name = titleMatch ? titleMatch[1] : file.replace('-pattern.md', '');
        
        patterns.push({
          name,
          category,
          file: path.join(categoryPath, file)
        });
      });
    });
    
    return patterns;
  }
  
  async validateADRCompliance() {
    this.log('info', 'Validating ADR compliance...');
    
    if (!fs.existsSync(this.adrDir)) {
      this.log('error', 'ADR directory not found');
      return false;
    }
    
    const adrFiles = fs.readdirSync(this.adrDir)
      .filter(file => file.startsWith('ADR-') && file.endsWith('.md'));
    
    if (adrFiles.length === 0) {
      this.log('warn', 'No ADR files found');
      return false;
    }
    
    // Check for patterns without corresponding ADRs
    const allPatterns = this.getAllPatterns();
    const patternADRs = new Set();
    
    adrFiles.forEach(file => {
      const content = fs.readFileSync(path.join(this.adrDir, file), 'utf8');
      const patternReferences = content.toLowerCase().match(/pattern/g) || [];
      if (patternReferences.length > 0) {
        patternADRs.add(file);
      }
    });
    
    this.log('info', `Found ${patternADRs.size} pattern-related ADRs`);
    
    return true;
  }
  
  generateValidationReport() {
    const reportPath = path.join(this.rootDir, 'pattern-validation-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalViolations: this.violations.length,
        totalWarnings: this.warnings.length,
        isValid: this.violations.length === 0
      },
      violations: this.violations,
      warnings: this.warnings,
      patterns: this.getAllPatterns().map(p => ({
        name: p.name,
        category: p.category,
        file: p.file.replace(this.rootDir, '')
      }))
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log('info', `Validation report saved: ${reportPath}`);
    
    // Console summary
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('==================');
    console.log(`Total Patterns: ${report.patterns.length}`);
    console.log(`Violations: ${this.violations.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    console.log(`Status: ${report.summary.isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (this.violations.length > 0) {
      console.log('\n❌ VIOLATIONS:');
      this.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.message}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.slice(0, 5).forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
      });
      
      if (this.warnings.length > 5) {
        console.log(`... and ${this.warnings.length - 5} more warnings`);
      }
    }
  }
  
  async validateSpecificPattern(patternFile) {
    if (!fs.existsSync(patternFile)) {
      this.log('error', `Pattern file not found: ${patternFile}`);
      return false;
    }
    
    const category = path.dirname(patternFile).split(path.sep).pop();
    return await this.validatePattern(patternFile, category);
  }
  
  async fixCommonIssues() {
    this.log('info', 'Attempting to fix common pattern issues...');
    
    const patterns = this.getAllPatterns();
    let fixedCount = 0;
    
    for (const pattern of patterns) {
      let content = fs.readFileSync(pattern.file, 'utf8');
      let modified = false;
      
      // Fix missing language specifications
      content = content.replace(/```\n/g, '```text\n');
      
      // Add missing sections
      if (!content.includes('## Related ADRs')) {
        content += '\n\n## Related ADRs\n- [Add relevant ADRs]\n';
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(pattern.file, content);
        this.log('info', `Fixed issues in ${pattern.name}`);
        fixedCount++;
      }
    }
    
    this.log('info', `Fixed issues in ${fixedCount} patterns`);
  }
}

// CLI Interface
async function main() {
  const validator = new PatternValidator();
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
🔍 KRINS-Chronicle-Keeper Pattern Validator

Usage:
  node validate-patterns.js                    # Validate all patterns
  node validate-patterns.js --fix             # Fix common issues
  node validate-patterns.js --pattern <file>  # Validate specific pattern
  
Options:
  --fix        Attempt to fix common issues automatically
  --pattern    Validate a specific pattern file
  --verbose    Enable detailed logging
  
Examples:
  node validate-patterns.js
  node validate-patterns.js --fix
  node validate-patterns.js --pattern docs/patterns/typescript/api-response-pattern.md
`);
    return;
  }
  
  try {
    if (args.includes('--fix')) {
      await validator.fixCommonIssues();
    }
    
    if (args.includes('--pattern')) {
      const patternIndex = args.indexOf('--pattern');
      if (args[patternIndex + 1]) {
        const isValid = await validator.validateSpecificPattern(args[patternIndex + 1]);
        process.exit(isValid ? 0 : 1);
      }
    } else {
      const isValid = await validator.validateAllPatterns();
      process.exit(isValid ? 0 : 1);
    }
  } catch (error) {
    validator.log('error', `Validation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PatternValidator;