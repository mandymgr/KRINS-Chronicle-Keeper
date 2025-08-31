#!/usr/bin/env node

/**
 * Pattern Template Generator for Dev Memory OS
 * Creates new patterns based on established templates with automatic ADR creation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PatternGenerator {
  constructor() {
    this.rootDir = process.cwd();
    this.patternsDir = path.join(this.rootDir, 'docs', 'patterns');
    this.adrDir = path.join(this.rootDir, 'docs', 'adr');
  }

  log(level, message) {
    const prefix = {
      'error': '❌',
      'warn': '⚠️ ',
      'info': '✅',
      'success': '🎉',
      'debug': '🔍'
    }[level] || '📋';
    
    console.log(`${prefix} ${message}`);
  }

  validatePatternName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Pattern name is required');
    }
    
    if (name.length < 3) {
      throw new Error('Pattern name must be at least 3 characters long');
    }
    
    if (!/^[a-zA-Z0-9-_\s]+$/.test(name)) {
      throw new Error('Pattern name can only contain letters, numbers, hyphens, underscores and spaces');
    }
    
    return true;
  }

  createPatternSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async getPatternTemplate() {
    const templatePath = path.join(this.patternsDir, 'TEMPLATE-pattern.md');
    
    if (!fs.existsSync(templatePath)) {
      // Fallback template if TEMPLATE-pattern.md doesn't exist
      return this.getDefaultTemplate();
    }
    
    return fs.readFileSync(templatePath, 'utf-8');
  }

  getDefaultTemplate() {
    return `# Pattern: {{PATTERN_NAME}}
**Når bruke:** {{WHEN_TO_USE}}  •  **Ikke bruk når:** {{WHEN_NOT_TO_USE}}  •  **Kontekst:** {{CONTEXT}}

## Steg-for-steg
1) {{STEP_1}}
2) {{STEP_2}}
3) {{STEP_3}}

## Språkvarianter

### TypeScript/Node (Next.js)
\`\`\`ts
// {{PATTERN_NAME}} implementation
interface {{PATTERN_NAME}}Config {
  // Add configuration properties here
}

export class {{PATTERN_NAME}}Service {
  constructor(private config: {{PATTERN_NAME}}Config) {}
  
  async execute(): Promise<void> {
    // Implementation here
  }
}
\`\`\`

### Python (FastAPI)
\`\`\`py
from typing import Optional
from pydantic import BaseModel

class {{PATTERN_NAME}}Config(BaseModel):
    """Configuration for {{PATTERN_NAME}} pattern"""
    pass

class {{PATTERN_NAME}}Service:
    def __init__(self, config: {{PATTERN_NAME}}Config):
        self.config = config
    
    async def execute(self) -> None:
        """Execute the {{PATTERN_NAME}} pattern"""
        pass
\`\`\`

### Java (Spring)
\`\`\`java
@Service
public class {{PATTERN_NAME}}Service {
    
    @Autowired
    private {{PATTERN_NAME}}Config config;
    
    public void execute() {
        // Implementation here
    }
}
\`\`\`

## Ytelse/Sikkerhet
- **Ytelse**: Forventet latens, ressursbruk og skalering
- **Sikkerhet**: Trusselflate analyse og hardening anbefalinger
- **SLO**: Service Level Objectives og monitorering

## Observability
**Nøkkel-metrics:**
- \`{{pattern_name}}_execution_duration\` - Tid for pattern utførelse
- \`{{pattern_name}}_success_rate\` - Suksessrate for pattern
- \`{{pattern_name}}_error_count\` - Antall feil

**Logging:**
\`\`\`json
{
  "pattern": "{{pattern_name}}",
  "operation": "execute",
  "duration_ms": 150,
  "status": "success"
}
\`\`\`

**Tracing:** Trace ID: \`{{pattern_name}}-<correlation-id>\`

## Vanlige feil / Anti-mønstre
- ❌ **Anti-pattern**: Ikke implementer {{PATTERN_NAME}} uten proper konfiguration
- ❌ **Vanlig feil**: Glemme error handling og logging
- ❌ **Performance issue**: Ikke cache resultater når mulig
- ✅ **Best practice**: Følg single responsibility principle

## Relaterte patterns
- Se også: [Pattern Name](./related-pattern.md)
- Kombineres ofte med: [Another Pattern](./another-pattern.md)

## Eksempler og brukstilfeller
### Use Case 1: {{USE_CASE_1}}
Beskrivelse av når og hvordan dette pattern brukes.

### Use Case 2: {{USE_CASE_2}}
Ytterligere eksempel på bruk av pattern.

---
*Opprettet: {{CREATION_DATE}}*
*Status: Draft*
*Versjon: 1.0*
`;
  }

  async promptForDetails(patternName) {
    // In a real CLI tool, we'd use inquirer.js or similar
    // For now, we'll use sensible defaults and placeholders
    
    const slug = this.createPatternSlug(patternName);
    const className = patternName
      .split(/[-\s_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    return {
      patternName: patternName,
      className: className,
      slug: slug,
      whenToUse: `For å implementere ${patternName} funksjonalitet på en konsistent måte`,
      whenNotToUse: `Når du trenger en enkel løsning uten ${patternName} kompleksitet`,
      context: '@onprem/@cloud',
      step1: `Konfigurer ${patternName} parametere`,
      step2: `Implementer ${patternName} logikk`,
      step3: `Valider og test ${patternName} funksjonalitet`,
      useCase1: `Standard ${patternName} implementering`,
      useCase2: `Avansert ${patternName} med tilpassede konfigurasjoner`,
      creationDate: new Date().toISOString().split('T')[0]
    };
  }

  async generatePattern(patternName) {
    this.log('info', `Generating pattern: ${patternName}`);
    
    // Validate input
    this.validatePatternName(patternName);
    
    // Get template and details
    const template = await this.getPatternTemplate();
    const details = await this.promptForDetails(patternName);
    
    // Replace placeholders in template
    let patternContent = template;
    const replacements = {
      '{{PATTERN_NAME}}': details.className,
      '{{pattern_name}}': details.slug,
      '{{WHEN_TO_USE}}': details.whenToUse,
      '{{WHEN_NOT_TO_USE}}': details.whenNotToUse,
      '{{CONTEXT}}': details.context,
      '{{STEP_1}}': details.step1,
      '{{STEP_2}}': details.step2,
      '{{STEP_3}}': details.step3,
      '{{USE_CASE_1}}': details.useCase1,
      '{{USE_CASE_2}}': details.useCase2,
      '{{CREATION_DATE}}': details.creationDate,
      '<navn>': patternName
    };
    
    for (const [placeholder, value] of Object.entries(replacements)) {
      patternContent = patternContent.replace(new RegExp(placeholder, 'g'), value);
    }
    
    // Create pattern file
    const patternFilename = `${details.slug}-pattern.md`;
    const patternPath = path.join(this.patternsDir, patternFilename);
    
    if (fs.existsSync(patternPath)) {
      throw new Error(`Pattern file already exists: ${patternFilename}`);
    }
    
    // Ensure patterns directory exists
    if (!fs.existsSync(this.patternsDir)) {
      fs.mkdirSync(this.patternsDir, { recursive: true });
    }
    
    fs.writeFileSync(patternPath, patternContent);
    this.log('success', `Pattern created: ${patternFilename}`);
    
    return {
      patternPath,
      patternFilename,
      details
    };
  }

  async createADR(patternDetails) {
    this.log('info', 'Creating corresponding ADR...');
    
    try {
      // Check if ADR creation script exists
      const adrScript = path.join(this.rootDir, 'tools', 'adr_new.sh');
      
      if (fs.existsSync(adrScript)) {
        const adrTitle = `Implement ${patternDetails.patternName} Pattern`;
        execSync(`chmod +x "${adrScript}"`, { stdio: 'inherit' });
        execSync(`"${adrScript}" "${adrTitle}"`, { stdio: 'inherit' });
        this.log('success', `ADR created for ${patternDetails.patternName} pattern`);
      } else {
        this.log('warn', 'ADR creation script not found - skipping ADR creation');
        this.log('info', `💡 Manually create ADR: ./tools/adr_new.sh "Implement ${patternDetails.patternName} Pattern"`);
      }
    } catch (error) {
      this.log('warn', `Could not create ADR automatically: ${error.message}`);
      this.log('info', `💡 Manually create ADR: ./tools/adr_new.sh "Implement ${patternDetails.patternName} Pattern"`);
    }
  }

  async generateCodeSamples(patternDetails) {
    this.log('info', 'Generating starter code samples...');
    
    const samplesDir = path.join(this.rootDir, 'examples', 'patterns', patternDetails.slug);
    
    if (!fs.existsSync(samplesDir)) {
      fs.mkdirSync(samplesDir, { recursive: true });
    }
    
    // TypeScript example
    const tsExample = `// ${patternDetails.patternName} Pattern Implementation
// Auto-generated starter code

interface ${patternDetails.className}Config {
  // Add your configuration here
  enabled: boolean;
  timeout: number;
}

export class ${patternDetails.className}Service {
  constructor(private config: ${patternDetails.className}Config) {}
  
  async execute(): Promise<void> {
    if (!this.config.enabled) {
      throw new Error('${patternDetails.className} is not enabled');
    }
    
    // TODO: Implement your ${patternDetails.patternName} logic here
    console.log(\`Executing \${this.constructor.name} with timeout: \${this.config.timeout}ms\`);
  }
  
  async validate(): Promise<boolean> {
    // TODO: Add validation logic
    return true;
  }
}

// Usage example:
// const service = new ${patternDetails.className}Service({
//   enabled: true,
//   timeout: 5000
// });
// await service.execute();
`;
    
    fs.writeFileSync(path.join(samplesDir, `${patternDetails.slug}.service.ts`), tsExample);
    
    // Test example
    const testExample = `// ${patternDetails.patternName} Pattern Test
// Auto-generated test template

import { ${patternDetails.className}Service, ${patternDetails.className}Config } from './${patternDetails.slug}.service';

describe('${patternDetails.className}Service', () => {
  let service: ${patternDetails.className}Service;
  let config: ${patternDetails.className}Config;
  
  beforeEach(() => {
    config = {
      enabled: true,
      timeout: 1000
    };
    service = new ${patternDetails.className}Service(config);
  });
  
  it('should create service instance', () => {
    expect(service).toBeInstanceOf(${patternDetails.className}Service);
  });
  
  it('should execute successfully when enabled', async () => {
    await expect(service.execute()).resolves.not.toThrow();
  });
  
  it('should throw error when disabled', async () => {
    service = new ${patternDetails.className}Service({ ...config, enabled: false });
    await expect(service.execute()).rejects.toThrow('${patternDetails.className} is not enabled');
  });
  
  it('should validate successfully', async () => {
    const result = await service.validate();
    expect(result).toBe(true);
  });
});
`;
    
    fs.writeFileSync(path.join(samplesDir, `${patternDetails.slug}.service.test.ts`), testExample);
    
    this.log('success', `Code samples created in: examples/patterns/${patternDetails.slug}/`);
  }

  async displaySummary(result) {
    console.log('\\n' + '='.repeat(60));
    console.log('🎉 PATTERN GENERATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📋 Pattern: ${result.details.patternName}`);
    console.log(`📁 File: docs/patterns/${result.patternFilename}`);
    console.log(`🗂️  Examples: examples/patterns/${result.details.slug}/`);
    console.log('\\n📝 Next steps:');
    console.log('1. Edit the pattern file to add specific implementation details');
    console.log('2. Customize the code examples in the examples directory');
    console.log('3. Update the ADR with architectural decisions');
    console.log('4. Add the pattern to your development workflow');
    console.log('\\n🚀 Happy pattern-driven development!');
    console.log('='.repeat(60));
  }
}

// CLI interface
async function main() {
  try {
    const args = process.argv.slice(2);
    const patternName = args[0];
    
    if (!patternName) {
      console.log('\\n🔧 Dev Memory OS Pattern Generator');
      console.log('\\nUsage: npm run create-pattern <pattern-name>');
      console.log('       npx create-pattern <pattern-name>');
      console.log('\\nExamples:');
      console.log('  npm run create-pattern "Authentication Service"');
      console.log('  npm run create-pattern "Rate Limiting"');
      console.log('  npm run create-pattern "Database Connection Pool"');
      console.log('\\n💡 This will create:');
      console.log('  • Pattern documentation in docs/patterns/');
      console.log('  • Starter code examples in examples/patterns/');
      console.log('  • Corresponding ADR (Architecture Decision Record)');
      process.exit(1);
    }
    
    const generator = new PatternGenerator();
    const result = await generator.generatePattern(patternName);
    
    // Create ADR
    await generator.createADR(result.details);
    
    // Generate code samples
    await generator.generateCodeSamples(result.details);
    
    // Show summary
    await generator.displaySummary(result);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Pattern generation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PatternGenerator;