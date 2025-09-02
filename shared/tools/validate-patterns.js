#!/usr/bin/env bun

/**
 * Pattern Validation Tool for Dev Memory OS
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
      this.violations.push(message);
    } else if (level === 'warn') {
      this.warnings.push(message);
    }
  }

  async validateComponentNaming() {
    this.log('debug', 'Checking React component naming patterns...');
    
    const componentFiles = this.findFiles(['.tsx', '.jsx'], ['node_modules', '.git', 'dist', 'build']);
    
    // Filter out test files and other non-component files
    const realComponents = componentFiles.filter(file => {
      const basename = path.basename(file, path.extname(file));
      return !file.includes('test') && 
             !file.includes('spec') && 
             !['index', 'app', 'main', 'config', 'setup'].includes(basename.toLowerCase());
    });
    
    for (const file of realComponents) {
      const basename = path.basename(file, path.extname(file));
      const isComponent = basename.charAt(0).toUpperCase() === basename.charAt(0);
      
      if (!isComponent) {
        this.log('error', `Component ${file} should use PascalCase naming`);
      }
    }
    
    this.log('info', `Validated ${realComponents.length} components - ${componentFiles.length - realComponents.length} test/config files excluded`);
  }

  async validateImportPatterns() {
    this.log('debug', 'Checking import patterns...');
    
    const sourceFiles = this.findFiles(['.ts', '.tsx', '.js', '.jsx'], ['node_modules', '.git']);
    
    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          // Check for excessive relative imports
          const relativeImports = (line.match(/from\s+['"]\.\./g) || []).length;
          if (relativeImports > 0 && line.includes('../../../')) {
            this.log('warn', `Deep relative import in ${file}:${index + 1} - consider absolute imports`);
          }
          
          // Check for missing file extensions in imports (if needed)
          if (line.includes("from './") && !line.includes('.js') && !line.includes('.ts')) {
            // Only warn, don't error as many bundlers handle this
            // this.log('warn', `Missing file extension in ${file}:${index + 1}`);
          }
        });
      } catch (error) {
        this.log('warn', `Could not read ${file}: ${error.message}`);
      }
    }
  }

  async validateErrorHandling() {
    this.log('debug', 'Checking error handling patterns...');
    
    const sourceFiles = this.findFiles(['.ts', '.tsx', '.js', '.jsx'], ['node_modules', '.git']);
    
    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Check for fetch calls without error handling
        if (content.includes('fetch(') && !content.includes('catch') && !content.includes('try')) {
          this.log('warn', `File ${file} uses fetch() without visible error handling`);
        }
        
        // Check for async functions without try-catch
        const asyncMatches = content.match(/async\s+\w+\s*\([^)]*\)\s*{[^}]*}/g) || [];
        for (const asyncFunc of asyncMatches) {
          if (!asyncFunc.includes('try') && !asyncFunc.includes('catch')) {
            // Only warn for complex async functions
            if (asyncFunc.length > 100) {
              this.log('warn', `Complex async function in ${file} without try-catch block`);
              break; // Only report once per file
            }
          }
        }
      } catch (error) {
        this.log('warn', `Could not analyze ${file}: ${error.message}`);
      }
    }
  }

  async validateADRCompliance() {
    this.log('debug', 'Checking ADR-driven development compliance...');
    
    try {
      // Count ADRs
      const adrDir = path.join(this.rootDir, 'docs', 'adr');
      let adrCount = 0;
      
      if (fs.existsSync(adrDir)) {
        const adrFiles = fs.readdirSync(adrDir).filter(file => file.endsWith('.md'));
        adrCount = adrFiles.length;
        
        // Check if ADRs follow naming convention
        for (const adr of adrFiles) {
          if (!adr.match(/^\d{4}-/)) {
            this.log('warn', `ADR ${adr} doesn't follow NNNN-title.md naming convention`);
          }
        }
      }
      
      // Check for architectural files without ADRs
      const configFiles = this.findFiles(['.config.js', '.config.ts', 'webpack', 'vite'], ['node_modules']);
      if (configFiles.length > 3 && adrCount === 0) {
        this.log('warn', 'Multiple configuration files found but no ADRs - consider documenting architectural decisions');
      }
      
      this.log('info', `Found ${adrCount} ADRs documenting architectural decisions`);
    } catch (error) {
      this.log('warn', `Could not validate ADR compliance: ${error.message}`);
    }
  }

  async validateAntiPatterns() {
    this.log('debug', 'Scanning for anti-patterns...');
    
    const sourceFiles = this.findFiles(['.ts', '.tsx', '.js', '.jsx'], ['node_modules', '.git']);
    
    for (const file of sourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const lineNumber = index + 1;
          
          // Check for console.log in production code
          if (line.includes('console.') && !line.includes('//') && !file.includes('test')) {
            this.log('warn', `console.log found in ${file}:${lineNumber} - use proper logging`);
          }
          
          // Check for hardcoded URLs
          if (line.match(/https?:\/\/[^\s'"]+/) && !line.includes('example.com') && !line.includes('placeholder')) {
            this.log('warn', `Hardcoded URL in ${file}:${lineNumber} - consider using environment variables`);
          }
          
          // Check for potential secrets
          if (line.toLowerCase().match(/(password|secret|key|token)\s*[:=]\s*['"][^'"]+['"]/) && !line.includes('placeholder')) {
            this.log('error', `Potential hardcoded secret in ${file}:${lineNumber}`);
          }
          
          // Check for TODO comments older than 30 days (if in git)
          if (line.includes('TODO') || line.includes('FIXME')) {
            try {
              const gitBlame = execSync(`git blame -L ${lineNumber},${lineNumber} "${file}" 2>/dev/null`, { encoding: 'utf-8' });
              const dateMatch = gitBlame.match(/(\d{4}-\d{2}-\d{2})/);
              if (dateMatch) {
                const commitDate = new Date(dateMatch[1]);
                const daysDiff = (new Date() - commitDate) / (1000 * 60 * 60 * 24);
                if (daysDiff > 30) {
                  this.log('warn', `Old TODO/FIXME (${Math.floor(daysDiff)} days) in ${file}:${lineNumber}`);
                }
              }
            } catch (error) {
              // Ignore git blame errors (file might not be in git yet)
            }
          }
        });
      } catch (error) {
        this.log('warn', `Could not scan ${file} for anti-patterns: ${error.message}`);
      }
    }
  }

  findFiles(extensions, excludeDirs = []) {
    const files = [];
    const defaultExcludes = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'examples-archive'];
    const allExcludes = [...excludeDirs, ...defaultExcludes];
    const excludeFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.DS_Store'];
    
    const searchDir = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Skip excluded files
          if (excludeFiles.includes(entry.name)) {
            continue;
          }
          
          if (entry.isDirectory() && !allExcludes.some(exclude => fullPath.includes(exclude))) {
            searchDir(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.some(extension => 
              ext === extension || entry.name.includes(extension)
            )) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Ignore permission errors and continue
      }
    };
    
    searchDir(this.rootDir);
    return files;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PATTERN VALIDATION REPORT');
    console.log('='.repeat(60));
    
    if (this.violations.length === 0 && this.warnings.length === 0) {
      console.log('✅ No pattern violations found! Code follows established patterns.');
    } else {
      if (this.violations.length > 0) {
        console.log(`❌ ${this.violations.length} violation(s) found:`);
        this.violations.forEach(v => console.log(`  • ${v}`));
      }
      
      if (this.warnings.length > 0) {
        console.log(`⚠️  ${this.warnings.length} warning(s):`);
        this.warnings.slice(0, 10).forEach(w => console.log(`  • ${w}`));
        if (this.warnings.length > 10) {
          console.log(`  ... and ${this.warnings.length - 10} more warnings`);
        }
      }
    }
    
    console.log('='.repeat(60));
    return this.violations.length === 0;
  }
}

// CLI interface
async function main() {
  const validator = new PatternValidator();
  
  console.log('🚀 Starting Dev Memory OS Pattern Validation...\n');
  
  try {
    await validator.validateComponentNaming();
    await validator.validateImportPatterns();
    await validator.validateErrorHandling();
    await validator.validateADRCompliance();
    await validator.validateAntiPatterns();
    
    const passed = validator.generateReport();
    process.exit(passed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Pattern validation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PatternValidator;