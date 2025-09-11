#!/usr/bin/env node

/**
 * 🚀 KRINS Capabilities Tracker - Simple Node.js Version
 * Legger automatisk til nye funksjoner i KRINS-CAPABILITIES.md med dagens dato
 */

const fs = require('fs');
const path = require('path');

// Konfiguration
const CAPABILITIES_FILE = path.join(__dirname, '../KRINS-CAPABILITIES.md');

// Farger for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
};

// Hjelpefunksjon for fargede meldinger
const log = {
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}🔄 ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// Kategori mappings
const CATEGORY_MAPPINGS = {
    'decision': {
        section: '## 📋 **CORE DECISION MANAGEMENT**',
        emoji: '📋'
    },
    'governance': {
        section: '## 🔄 **ADVANCED GOVERNANCE & PROCESS**',
        emoji: '🔄'
    },
    'knowledge': {
        section: '## 📚 **COMPREHENSIVE KNOWLEDGE ORGANIZATION**',
        emoji: '📚'
    },
    'ai': {
        section: '## 🤖 **NEXT-GENERATION AI INTEGRATION**',
        emoji: '🤖'
    },
    'collaboration': {
        section: '## 👥 **ENTERPRISE TEAM COLLABORATION**',
        emoji: '👥'
    },
    'analytics': {
        section: '## 📊 **ORGANIZATIONAL INTELLIGENCE & ANALYTICS**',
        emoji: '📊'
    },
    'interface': {
        section: '## 🌐 **MODERN WEB INTERFACE**',
        emoji: '🌐'
    },
    'integration': {
        section: '## ⚙️ **INTEGRATION & AUTOMATION**',
        emoji: '⚙️'
    },
    'infrastructure': {
        section: '## 🏗️ **PRODUCTION-READY INFRASTRUCTURE**',
        emoji: '🏗️'
    },
    'testing': {
        section: '## 🧪 **TESTING & QUALITY ASSURANCE**',
        emoji: '🧪'
    },
    'platform': {
        section: '## 📱 **CROSS-PLATFORM CAPABILITIES**',
        emoji: '📱'
    }
};

function showHelp() {
    console.log(`${colors.blue}🚀 KRINS Capabilities Tracker${colors.reset}

Usage: node add-capability.js <function_name> <description> <category> [location]

CATEGORIES:
  decision, governance, knowledge, ai, collaboration, 
  analytics, interface, integration, infrastructure, testing, platform

EXAMPLES:
  node add-capability.js "Voice Interface" "Speech-based interaction system" "interface" "voice-system/"
  node add-capability.js "ML Prediction Engine" "Custom trained models for outcomes" "ai"

OPTIONS:
  --help, -h    Show this help
  --list, -l    List recent additions
    `);
}

function listRecent() {
    log.info('Recent capability additions:');
    
    try {
        const content = fs.readFileSync(CAPABILITIES_FILE, 'utf8');
        const lines = content.split('\n');
        
        // Find lines with ✅ and dates
        const recentLines = lines
            .filter(line => line.includes('✅') && line.match(/20[0-9]{2}-[0-9]{2}-[0-9]{2}/))
            .slice(-10); // Last 10 additions
        
        recentLines.forEach((line, index) => {
            console.log(`  ${index + 1}. ${line.trim()}`);
        });
        
    } catch (error) {
        log.error(`Could not read capabilities file: ${error.message}`);
    }
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
}

function updateLastModifiedDate(content, newDate) {
    return content.replace(
        /\*\*Sist oppdatert:\*\* \d{4}-\d{2}-\d{2}/,
        `**Sist oppdatert:** ${newDate}`
    );
}

function addCapability(functionName, description, category, location = 'Implementation location') {
    log.info(`Adding new capability: ${functionName}`);
    
    // Validate category
    if (!CATEGORY_MAPPINGS[category]) {
        log.error(`Invalid category: ${category}`);
        console.log('Valid categories:', Object.keys(CATEGORY_MAPPINGS).join(', '));
        return false;
    }
    
    try {
        // Read current file
        const content = fs.readFileSync(CAPABILITIES_FILE, 'utf8');
        const lines = content.split('\n');
        
        const date = getCurrentDate();
        const categoryInfo = CATEGORY_MAPPINGS[category];
        
        // Create new table row
        const newRow = `| **${functionName}** | ✅ ${date} | ${description} | \`${location}\` |`;
        
        let modified = false;
        let inCorrectSection = false;
        
        // Process each line
        for (let i = 0; i < lines.length; i++) {
            // Check if we found the correct section
            if (lines[i].includes(categoryInfo.section)) {
                inCorrectSection = true;
                continue;
            }
            
            // If we're in the correct section and find a table separator, add our row
            if (inCorrectSection && lines[i].includes('|----------|')) {
                lines.splice(i + 1, 0, newRow);
                modified = true;
                break;
            }
            
            // If we hit another section header, we've left our target section
            if (inCorrectSection && lines[i].startsWith('## ') && !lines[i].includes(categoryInfo.section)) {
                // Insert before this new section
                lines.splice(i, 0, newRow);
                modified = true;
                break;
            }
        }
        
        if (!modified) {
            log.warning(`Could not find appropriate location for category: ${category}`);
            log.info('Adding to end of file...');
            lines.push('', newRow);
        }
        
        // Update last modified date
        let newContent = lines.join('\n');
        newContent = updateLastModifiedDate(newContent, date);
        
        // Write back to file
        fs.writeFileSync(CAPABILITIES_FILE, newContent, 'utf8');
        
        log.success(`Added capability: ${functionName}`);
        log.info(`Category: ${categoryInfo.emoji} ${category}`);
        log.info(`Date: ${date}`);
        log.info(`Location: ${location}`);
        
        console.log(`\n${colors.blue}🔗 Next steps:${colors.reset}`);
        console.log(`  git add KRINS-CAPABILITIES.md`);
        console.log(`  git commit -m "📈 Add capability: ${functionName}"`);
        
        return true;
        
    } catch (error) {
        log.error(`Error updating capabilities file: ${error.message}`);
        return false;
    }
}

// Main execution
function main() {
    const args = process.argv.slice(2);
    
    // Handle flags
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }
    
    if (args.includes('--list') || args.includes('-l')) {
        listRecent();
        return;
    }
    
    // Validate arguments
    if (args.length < 3) {
        log.error('Missing required arguments');
        showHelp();
        process.exit(1);
    }
    
    // Check if capabilities file exists
    if (!fs.existsSync(CAPABILITIES_FILE)) {
        log.error(`Capabilities file not found: ${CAPABILITIES_FILE}`);
        process.exit(1);
    }
    
    const [functionName, description, category, location] = args;
    
    // Add the capability
    const success = addCapability(functionName, description, category, location);
    
    if (!success) {
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { addCapability, CATEGORY_MAPPINGS };