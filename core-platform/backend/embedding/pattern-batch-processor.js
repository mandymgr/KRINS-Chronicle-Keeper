/**
 * Pattern Batch Processor for Dev Memory OS
 * Processes existing pattern markdown files and generates embeddings
 */

const fs = require('fs').promises;
const path = require('path');
const EmbeddingService = require('./embedding-service');
const { initializeDatabase } = require('../database/connection');
const DatabaseQueries = require('../database/queries');

class PatternBatchProcessor {
    constructor(options = {}) {
        this.patternDirectory = options.patternDirectory || path.join(__dirname, '../../docs/patterns');
        this.embeddingService = new EmbeddingService(options.embeddingOptions);
        this.db = null;
        this.queries = null;
        this.defaultAuthorName = options.defaultAuthorName || 'system';
        this.dryRun = options.dryRun || false;
    }

    /**
     * Initialize database connection
     */
    async initialize() {
        this.db = await initializeDatabase();
        this.queries = new DatabaseQueries(this.db);
        console.log('Pattern Batch Processor initialized');
    }

    /**
     * Process all pattern files in the directory
     * @returns {Promise<Object>} Processing results
     */
    async processAllPatterns() {
        console.log(`Starting batch processing of patterns in: ${this.patternDirectory}`);

        try {
            const patternFiles = await this.findPatternFiles();
            console.log(`Found ${patternFiles.length} pattern files to process`);

            if (patternFiles.length === 0) {
                return { processed: 0, errors: 0, skipped: 0 };
            }

            const results = {
                processed: 0,
                errors: 0,
                skipped: 0,
                details: []
            };

            // Get or create default author
            const author = await this.getOrCreateDefaultUser();

            // Process files in batches to manage memory and API rate limits
            const batchSize = 3;
            for (let i = 0; i < patternFiles.length; i += batchSize) {
                const batch = patternFiles.slice(i, i + batchSize);
                console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(patternFiles.length / batchSize)}`);

                for (const filePath of batch) {
                    try {
                        const result = await this.processPatternFile(filePath, author);
                        
                        if (result.skipped) {
                            results.skipped++;
                        } else {
                            results.processed++;
                        }
                        
                        results.details.push(result);

                    } catch (error) {
                        console.error(`Error processing ${filePath}:`, error.message);
                        results.errors++;
                        results.details.push({
                            file: filePath,
                            error: error.message,
                            skipped: false,
                            processed: false
                        });
                    }
                }

                // Rate limiting between batches
                if (i + batchSize < patternFiles.length) {
                    console.log('Waiting between batches...');
                    await this.delay(2000);
                }
            }

            console.log('\n=== Pattern Processing Results ===');
            console.log(`Processed: ${results.processed}`);
            console.log(`Errors: ${results.errors}`);
            console.log(`Skipped: ${results.skipped}`);
            console.log(`Total files: ${patternFiles.length}`);

            return results;

        } catch (error) {
            console.error('Pattern batch processing failed:', error);
            throw error;
        }
    }

    /**
     * Process a single pattern file
     * @param {string} filePath - Path to pattern file
     * @param {Object} author - Author record
     * @returns {Promise<Object>} Processing result
     */
    async processPatternFile(filePath, author) {
        console.log(`Processing: ${path.basename(filePath)}`);

        const fileContent = await fs.readFile(filePath, 'utf8');
        const patternData = this.parsePatternMarkdown(fileContent, filePath);

        if (!patternData) {
            return {
                file: filePath,
                skipped: true,
                reason: 'Could not parse pattern content'
            };
        }

        // Check if pattern already exists with embedding
        const existingPattern = await this.checkExistingPattern(patternData.name);
        if (existingPattern && existingPattern.embedding_text) {
            return {
                file: filePath,
                skipped: true,
                reason: 'Pattern already has embedding_text'
            };
        }

        // Generate embedding
        console.log(`Generating embedding for pattern: ${patternData.name}`);
        
        if (this.dryRun) {
            console.log('DRY RUN: Would generate embedding and store pattern');
            return {
                file: filePath,
                processed: true,
                dryRun: true,
                pattern: patternData
            };
        }

        const embedding = await this.embeddingService.generatePatternEmbedding(patternData);

        // Prepare pattern for database
        const patternRecord = {
            name: patternData.name,
            category: patternData.category || 'general',
            description: patternData.description || '',
            when_to_use: patternData.when_to_use || '',
            when_not_to_use: patternData.when_not_to_use || '',
            context_tags: patternData.context_tags || [],
            implementation_examples: patternData.implementation_examples,
            anti_patterns: patternData.anti_patterns,
            metrics: patternData.metrics,
            security_considerations: patternData.security_considerations,
            author_id: author.id
        };

        // Store in database
        const savedPattern = await this.queries.upsertPattern(patternRecord, embedding);

        return {
            file: filePath,
            processed: true,
            pattern_id: savedPattern.id,
            pattern: patternData,
            embedding_length: embedding.length
        };
    }

    /**
     * Find all pattern markdown files in the directory
     * @returns {Promise<string[]>} Array of file paths
     */
    async findPatternFiles() {
        try {
            const entries = await fs.readdir(this.patternDirectory, { withFileTypes: true });
            const patternFiles = [];

            for (const entry of entries) {
                if (entry.isFile() && entry.name.endsWith('.md')) {
                    // Skip template files
                    if (entry.name.toLowerCase().includes('template')) {
                        continue;
                    }
                    
                    const filePath = path.join(this.patternDirectory, entry.name);
                    patternFiles.push(filePath);
                }
            }

            // Sort alphabetically
            patternFiles.sort();

            return patternFiles;

        } catch (error) {
            console.error('Error reading pattern directory:', error.message);
            throw new Error(`Cannot read pattern directory: ${this.patternDirectory}`);
        }
    }

    /**
     * Parse pattern markdown content
     * @param {string} content - File content
     * @param {string} filePath - File path for context
     * @returns {Object|null} Parsed pattern data
     */
    parsePatternMarkdown(content, filePath) {
        try {
            const fileName = path.basename(filePath);
            
            // Parse markdown content
            const lines = content.split('\n');
            const pattern = {
                name: '',
                category: 'general',
                description: '',
                when_to_use: '',
                when_not_to_use: '',
                context_tags: [],
                implementation_examples: null,
                anti_patterns: null,
                metrics: null,
                security_considerations: ''
            };

            // Find title (first # header)
            let titleFound = false;
            let currentSection = '';
            let sectionContent = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Title extraction
                if (!titleFound && line.startsWith('#')) {
                    pattern.name = line.replace(/^#+\s*/, '').replace(/^Pattern:\s*/i, '').trim();
                    titleFound = true;
                    continue;
                }

                // Parse structured pattern summary line (line 2 typically)
                if (i === 1 && line.includes('Når bruke:')) {
                    this.parsePatternSummaryLine(pattern, line);
                    continue;
                }

                // Section headers
                if (line.startsWith('##')) {
                    // Save previous section
                    if (currentSection && sectionContent.length > 0) {
                        const content = sectionContent.join('\n').trim();
                        this.assignPatternSectionContent(pattern, currentSection, content);
                    }

                    // Start new section
                    currentSection = line.replace(/^#+\s*/, '').toLowerCase();
                    sectionContent = [];
                    continue;
                }

                // Category detection from various formats
                if (line.toLowerCase().includes('category:') || line.toLowerCase().includes('kategori:')) {
                    const categoryMatch = line.match(/(?:category|kategori):\s*(\w+)/i);
                    if (categoryMatch) {
                        pattern.category = categoryMatch[1].toLowerCase();
                    }
                }

                // Context tags detection
                if (line.includes('@')) {
                    const tags = line.match(/@[a-zA-Z0-9_-]+/g);
                    if (tags) {
                        pattern.context_tags = [...pattern.context_tags, ...tags];
                    }
                }

                // Collect content for current section
                if (currentSection && line) {
                    sectionContent.push(line);
                }
            }

            // Save final section
            if (currentSection && sectionContent.length > 0) {
                const content = sectionContent.join('\n').trim();
                this.assignPatternSectionContent(pattern, currentSection, content);
            }

            // Generate description from first section if missing
            if (!pattern.description && sectionContent.length > 0) {
                pattern.description = sectionContent.slice(0, 3).join(' ').substring(0, 200) + '...';
            }

            // Fallback name from filename
            if (!pattern.name) {
                pattern.name = fileName.replace(/\.md$/i, '').replace(/-/g, ' ');
            }

            // Clean up name
            pattern.name = pattern.name.replace(/^pattern:\s*/i, '').trim();

            // Validate required fields
            if (!pattern.name) {
                console.warn(`No name found for ${fileName}`);
                return null;
            }

            return pattern;

        } catch (error) {
            console.error(`Error parsing ${filePath}:`, error.message);
            return null;
        }
    }

    /**
     * Parse pattern summary line with structured format
     * @param {Object} pattern - Pattern object to update
     * @param {string} line - Summary line
     */
    parsePatternSummaryLine(pattern, line) {
        // Extract when to use
        const whenToUseMatch = line.match(/Når bruke:\s*([^•]*)/);
        if (whenToUseMatch) {
            pattern.when_to_use = whenToUseMatch[1].trim();
        }

        // Extract when not to use
        const whenNotToUseMatch = line.match(/Ikke bruk når:\s*([^•]*)/);
        if (whenNotToUseMatch) {
            pattern.when_not_to_use = whenNotToUseMatch[1].trim();
        }

        // Extract context
        const contextMatch = line.match(/Kontekst:\s*([^•]*)/);
        if (contextMatch) {
            const contextTags = contextMatch[1].match(/@[a-zA-Z0-9_-]+/g);
            if (contextTags) {
                pattern.context_tags = [...pattern.context_tags, ...contextTags];
            }
        }

        // Determine category from context or content
        if (pattern.context_tags.some(tag => tag.includes('team') || tag.includes('process'))) {
            pattern.category = 'process';
        } else if (pattern.context_tags.some(tag => tag.includes('code') || tag.includes('arch'))) {
            pattern.category = 'architectural';
        }
    }

    /**
     * Assign content to pattern section
     * @param {Object} pattern - Pattern object
     * @param {string} section - Section name
     * @param {string} content - Section content
     */
    assignPatternSectionContent(pattern, section, content) {
        if (section.includes('description') || section.includes('overview')) {
            pattern.description = content;
        } else if (section.includes('when to use') || section.includes('use case')) {
            pattern.when_to_use = content;
        } else if (section.includes('when not to use') || section.includes('avoid')) {
            pattern.when_not_to_use = content;
        } else if (section.includes('implementation') || section.includes('example')) {
            // Try to parse as JSON if it looks structured
            try {
                if (content.includes('{') || content.includes('[')) {
                    pattern.implementation_examples = JSON.parse(content);
                } else {
                    pattern.implementation_examples = { text: content };
                }
            } catch {
                pattern.implementation_examples = { text: content };
            }
        } else if (section.includes('anti-pattern') || section.includes('mistake')) {
            pattern.anti_patterns = { common_mistakes: content };
        } else if (section.includes('metric') || section.includes('performance')) {
            pattern.metrics = { notes: content };
        } else if (section.includes('security')) {
            pattern.security_considerations = content;
        }
    }

    /**
     * Check if pattern already exists
     * @param {string} patternName - Pattern name
     * @returns {Promise<Object|null>} Existing pattern or null
     */
    async checkExistingPattern(patternName) {
        const query = `
            SELECT id, embedding_text FROM patterns 
            WHERE name = $1;
        `;
        
        const result = await this.db.query(query, [patternName]);
        return result.rows[0] || null;
    }

    /**
     * Get or create default user
     * @returns {Promise<Object>} User record
     */
    async getOrCreateDefaultUser() {
        return await this.queries.getOrCreateUser({
            username: this.defaultAuthorName,
            email: `${this.defaultAuthorName}@devmemory.local`,
            password_hash: null
        });
    }

    /**
     * Delay execution
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Close database connection
     */
    async close() {
        if (this.db) {
            await this.db.close();
        }
    }
}

// CLI Interface
if (require.main === module) {
    async function main() {
        const args = process.argv.slice(2);
        const dryRun = args.includes('--dry-run');
        const patternDirectory = args.find(arg => arg.startsWith('--dir='))?.split('=')[1];

        console.log('=== Pattern Batch Processor ===');
        console.log(`Dry Run: ${dryRun}`);
        
        if (patternDirectory) {
            console.log(`Pattern Directory: ${patternDirectory}`);
        }

        const processor = new PatternBatchProcessor({
            dryRun,
            patternDirectory,
            embeddingOptions: {
                openaiApiKey: process.env.OPENAI_API_KEY
            }
        });

        try {
            await processor.initialize();
            const results = await processor.processAllPatterns();
            
            console.log('\n=== Final Results ===');
            console.log(JSON.stringify(results, null, 2));

        } catch (error) {
            console.error('Pattern batch processing failed:', error);
            process.exit(1);
        } finally {
            await processor.close();
        }
    }

    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = PatternBatchProcessor;