/**
 * ADR Batch Processor for Dev Memory OS
 * Production-ready processor for ADR markdown files with pgvector embeddings
 * Features: Parallel processing, error handling, progress tracking, vector optimization
 */

const fs = require('fs').promises;
const path = require('path');
const EmbeddingService = require('./embedding-service');
const { initializeDatabase } = require('../database/connection');
const DatabaseQueries = require('../database/queries');

class ADRBatchProcessor {
    constructor(options = {}) {
        this.adrDirectory = options.adrDirectory || path.join(__dirname, '../../docs/adr');
        this.embeddingService = new EmbeddingService(options.embeddingOptions);
        this.db = null;
        this.queries = null;
        this.defaultProjectName = options.defaultProjectName || 'Dev Memory OS';
        this.defaultAuthorName = options.defaultAuthorName || 'system';
        this.dryRun = options.dryRun || false;
    }

    /**
     * Initialize database connection
     */
    async initialize() {
        this.db = await initializeDatabase();
        this.queries = new DatabaseQueries(this.db);
        console.log('ADR Batch Processor initialized');
    }

    /**
     * Process all ADR files in the directory
     * @returns {Promise<Object>} Processing results
     */
    async processAllADRs() {
        console.log(`Starting batch processing of ADRs in: ${this.adrDirectory}`);

        try {
            const adrFiles = await this.findADRFiles();
            console.log(`Found ${adrFiles.length} ADR files to process`);

            if (adrFiles.length === 0) {
                return { processed: 0, errors: 0, skipped: 0 };
            }

            const results = {
                processed: 0,
                errors: 0,
                skipped: 0,
                details: []
            };

            // Get or create default project and user
            const project = await this.getOrCreateDefaultProject();
            const author = await this.getOrCreateDefaultUser();

            // Process files in batches to manage memory and API rate limits
            const batchSize = 5;
            for (let i = 0; i < adrFiles.length; i += batchSize) {
                const batch = adrFiles.slice(i, i + batchSize);
                console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(adrFiles.length / batchSize)}`);

                for (const filePath of batch) {
                    try {
                        const result = await this.processADRFile(filePath, project, author);
                        
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
                if (i + batchSize < adrFiles.length) {
                    console.log('Waiting between batches...');
                    await this.delay(2000);
                }
            }

            console.log('\n=== Batch Processing Results ===');
            console.log(`Processed: ${results.processed}`);
            console.log(`Errors: ${results.errors}`);
            console.log(`Skipped: ${results.skipped}`);
            console.log(`Total files: ${adrFiles.length}`);

            return results;

        } catch (error) {
            console.error('Batch processing failed:', error);
            throw error;
        }
    }

    /**
     * Process a single ADR file
     * @param {string} filePath - Path to ADR file
     * @param {Object} project - Project record
     * @param {Object} author - Author record
     * @returns {Promise<Object>} Processing result
     */
    async processADRFile(filePath, project, author) {
        console.log(`Processing: ${path.basename(filePath)}`);

        const fileContent = await fs.readFile(filePath, 'utf8');
        const adrData = this.parseADRMarkdown(fileContent, filePath);

        if (!adrData) {
            return {
                file: filePath,
                skipped: true,
                reason: 'Could not parse ADR content'
            };
        }

        // Check if ADR already exists with embedding_text
        const existingADR = await this.checkExistingADR(project.id, adrData.number);
        if (existingADR && existingADR.embedding_text) {
            return {
                file: filePath,
                skipped: true,
                reason: 'ADR already has embedding_text'
            };
        }

        // Generate embedding
        console.log(`Generating embedding for ADR-${adrData.number}: ${adrData.title}`);
        
        if (this.dryRun) {
            console.log('DRY RUN: Would generate embedding and store ADR');
            return {
                file: filePath,
                processed: true,
                dryRun: true,
                adr: adrData
            };
        }

        const embedding = await this.embeddingService.generateADREmbedding(adrData);

        // Prepare ADR for database
        const adrRecord = {
            project_id: project.id,
            component_id: null, // Could be enhanced to detect component from file path
            number: adrData.number,
            title: adrData.title,
            status: adrData.status || 'accepted',
            problem_statement: adrData.problem_statement || adrData.context || '',
            alternatives: adrData.alternatives || [],
            decision: adrData.decision || '',
            rationale: adrData.rationale || adrData.consequences || '',
            evidence: adrData.evidence,
            author_id: author.id
        };

        // Store in database
        const savedADR = await this.queries.upsertADR(adrRecord, embedding);

        return {
            file: filePath,
            processed: true,
            adr_id: savedADR.id,
            adr: adrData,
            embedding_length: embedding.length
        };
    }

    /**
     * Find all ADR markdown files in the directory
     * @returns {Promise<string[]>} Array of file paths
     */
    async findADRFiles() {
        try {
            const entries = await fs.readdir(this.adrDirectory, { withFileTypes: true });
            const adrFiles = [];

            for (const entry of entries) {
                if (entry.isFile() && entry.name.endsWith('.md')) {
                    // Skip template files
                    if (entry.name.toLowerCase().includes('template')) {
                        continue;
                    }
                    
                    const filePath = path.join(this.adrDirectory, entry.name);
                    adrFiles.push(filePath);
                }
            }

            // Sort by ADR number if possible
            adrFiles.sort((a, b) => {
                const aMatch = path.basename(a).match(/ADR-(\d+)/i);
                const bMatch = path.basename(b).match(/ADR-(\d+)/i);
                
                if (aMatch && bMatch) {
                    return parseInt(aMatch[1]) - parseInt(bMatch[1]);
                }
                
                return a.localeCompare(b);
            });

            return adrFiles;

        } catch (error) {
            console.error('Error reading ADR directory:', error.message);
            throw new Error(`Cannot read ADR directory: ${this.adrDirectory}`);
        }
    }

    /**
     * Parse ADR markdown content
     * @param {string} content - File content
     * @param {string} filePath - File path for context
     * @returns {Object|null} Parsed ADR data
     */
    parseADRMarkdown(content, filePath) {
        try {
            const fileName = path.basename(filePath);
            
            // Extract ADR number from filename
            const numberMatch = fileName.match(/ADR-(\d+)/i);
            const number = numberMatch ? parseInt(numberMatch[1]) : null;

            if (!number) {
                console.warn(`Could not extract ADR number from ${fileName}`);
                return null;
            }

            // Parse markdown content
            const lines = content.split('\n');
            const adr = {
                number,
                title: '',
                status: 'accepted',
                problem_statement: '',
                alternatives: [],
                decision: '',
                rationale: '',
                consequences: '',
                context: ''
            };

            // Find title (first # header or from filename)
            let titleFound = false;
            let currentSection = '';
            let sectionContent = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Title extraction
                if (!titleFound && line.startsWith('#')) {
                    adr.title = line.replace(/^#+\s*/, '').replace(/^ADR-\d+:?\s*/i, '').trim();
                    titleFound = true;
                    continue;
                }

                // Section headers
                if (line.startsWith('##')) {
                    // Save previous section
                    if (currentSection && sectionContent.length > 0) {
                        const content = sectionContent.join('\n').trim();
                        this.assignSectionContent(adr, currentSection, content);
                    }

                    // Start new section
                    currentSection = line.replace(/^#+\s*/, '').toLowerCase();
                    sectionContent = [];
                    continue;
                }

                // Status detection
                if (line.toLowerCase().includes('status:')) {
                    const statusMatch = line.match(/status:\s*(\w+)/i);
                    if (statusMatch) {
                        adr.status = statusMatch[1].toLowerCase();
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
                this.assignSectionContent(adr, currentSection, content);
            }

            // Fallback title from filename
            if (!adr.title) {
                adr.title = fileName.replace(/\.md$/i, '').replace(/^ADR-\d+-?/i, '').replace(/-/g, ' ');
            }

            // Validate required fields
            if (!adr.title) {
                console.warn(`No title found for ${fileName}`);
                return null;
            }

            return adr;

        } catch (error) {
            console.error(`Error parsing ${filePath}:`, error.message);
            return null;
        }
    }

    /**
     * Assign content to ADR section
     * @param {Object} adr - ADR object
     * @param {string} section - Section name
     * @param {string} content - Section content
     */
    assignSectionContent(adr, section, content) {
        if (section.includes('problem') || section.includes('context')) {
            adr.problem_statement = content;
            adr.context = content;
        } else if (section.includes('decision')) {
            adr.decision = content;
        } else if (section.includes('rationale') || section.includes('reason')) {
            adr.rationale = content;
        } else if (section.includes('consequence') || section.includes('impact')) {
            adr.consequences = content;
        } else if (section.includes('alternative') || section.includes('option')) {
            adr.alternatives = content.split('\n').filter(line => line.trim());
        }
    }

    /**
     * Check if ADR already exists
     * @param {string} projectId - Project ID
     * @param {number} adrNumber - ADR number
     * @returns {Promise<Object|null>} Existing ADR or null
     */
    async checkExistingADR(projectId, adrNumber) {
        const query = `
            SELECT id, embedding_text FROM adrs 
            WHERE project_id = $1 AND number = $2;
        `;
        
        const result = await this.db.query(query, [projectId, adrNumber]);
        return result.rows[0] || null;
    }

    /**
     * Get or create default project
     * @returns {Promise<Object>} Project record
     */
    async getOrCreateDefaultProject() {
        return await this.queries.getOrCreateProject({
            name: this.defaultProjectName,
            description: 'Default project for ADR batch processing',
            repository_url: null,
            owner_id: null
        });
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
        const adrDirectory = args.find(arg => arg.startsWith('--dir='))?.split('=')[1];

        console.log('=== ADR Batch Processor ===');
        console.log(`Dry Run: ${dryRun}`);
        
        if (adrDirectory) {
            console.log(`ADR Directory: ${adrDirectory}`);
        }

        const processor = new ADRBatchProcessor({
            dryRun,
            adrDirectory,
            embeddingOptions: {
                openaiApiKey: process.env.OPENAI_API_KEY
            }
        });

        try {
            await processor.initialize();
            const results = await processor.processAllADRs();
            
            console.log('\n=== Final Results ===');
            console.log(JSON.stringify(results, null, 2));

        } catch (error) {
            console.error('Batch processing failed:', error);
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

module.exports = ADRBatchProcessor;