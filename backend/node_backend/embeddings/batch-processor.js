/**
 * Batch Embedding Processor API for Dev Memory OS
 * Handles bulk processing of ADRs, patterns, and documents for embeddings
 */

const express = require('express');
const ADRBatchProcessor = require('../../embedding/adr-batch-processor');
const EmbeddingService = require('../../embedding/embedding-service');
const { initializeDatabase } = require('../../database/connection');
const DatabaseQueries = require('../../database/queries');

const router = express.Router();

class BatchProcessorAPI {
    constructor() {
        this.embeddingService = null;
        this.db = null;
        this.queries = null;
        this.activeJobs = new Map(); // Track running jobs
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            this.embeddingService = new EmbeddingService({
                openaiApiKey: process.env.OPENAI_API_KEY
            });
            
            this.db = await initializeDatabase();
            this.queries = new DatabaseQueries(this.db);
            this.initialized = true;
            
            console.log('Batch Processor API initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Batch Processor API:', error);
            throw error;
        }
    }

    /**
     * Process all ADRs in the default directory
     * POST /api/embeddings/process
     */
    async processEmbeddings(req, res) {
        try {
            const {
                type = 'adrs', // 'adrs', 'patterns', 'all'
                adr_directory = null,
                dry_run = false,
                force_reprocess = false,
                project_name = 'Dev Memory OS'
            } = req.body;

            // Generate unique job ID
            const jobId = `batch_${type}_${Date.now()}`;

            // Check if similar job is already running
            const activeJob = Array.from(this.activeJobs.values()).find(job => 
                job.type === type && job.status === 'running'
            );

            if (activeJob) {
                return res.status(409).json({
                    error: 'Similar batch job already running',
                    active_job: activeJob,
                    code: 'JOB_ALREADY_RUNNING'
                });
            }

            // Create job record
            const job = {
                id: jobId,
                type,
                status: 'starting',
                started_at: new Date().toISOString(),
                progress: {
                    total: 0,
                    processed: 0,
                    errors: 0,
                    skipped: 0
                },
                options: {
                    adr_directory,
                    dry_run,
                    force_reprocess,
                    project_name
                }
            };

            this.activeJobs.set(jobId, job);

            // Start processing in background
            this.runBatchJob(jobId, job).catch(error => {
                console.error(`Batch job ${jobId} failed:`, error);
                job.status = 'failed';
                job.error = error.message;
                job.finished_at = new Date().toISOString();
            });

            // Return immediate response with job ID
            res.status(202).json({
                success: true,
                message: 'Batch processing started',
                job_id: jobId,
                status: 'started',
                monitor_url: `/api/embeddings/jobs/${jobId}`,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Batch processing error:', error);
            res.status(500).json({
                error: 'Failed to start batch processing',
                message: error.message,
                code: 'BATCH_START_ERROR'
            });
        }
    }

    /**
     * Get status of a batch job
     * GET /api/embeddings/jobs/:jobId
     */
    async getJobStatus(req, res) {
        try {
            const { jobId } = req.params;
            const job = this.activeJobs.get(jobId);

            if (!job) {
                return res.status(404).json({
                    error: 'Job not found',
                    job_id: jobId,
                    code: 'JOB_NOT_FOUND'
                });
            }

            res.json({
                success: true,
                job: {
                    id: job.id,
                    type: job.type,
                    status: job.status,
                    started_at: job.started_at,
                    finished_at: job.finished_at || null,
                    progress: job.progress,
                    options: job.options,
                    error: job.error || null,
                    results: job.results || null
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Job status error:', error);
            res.status(500).json({
                error: 'Failed to get job status',
                message: error.message,
                code: 'JOB_STATUS_ERROR'
            });
        }
    }

    /**
     * List all batch jobs (active and recent)
     * GET /api/embeddings/jobs
     */
    async listJobs(req, res) {
        try {
            const { status = null, limit = 20 } = req.query;

            let jobs = Array.from(this.activeJobs.values());

            if (status) {
                jobs = jobs.filter(job => job.status === status);
            }

            // Sort by start time, most recent first
            jobs.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

            // Limit results
            jobs = jobs.slice(0, parseInt(limit));

            // Remove sensitive details for list view
            const jobSummaries = jobs.map(job => ({
                id: job.id,
                type: job.type,
                status: job.status,
                started_at: job.started_at,
                finished_at: job.finished_at || null,
                progress: job.progress,
                error: job.error ? true : false
            }));

            res.json({
                success: true,
                jobs: jobSummaries,
                total: jobSummaries.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('List jobs error:', error);
            res.status(500).json({
                error: 'Failed to list jobs',
                message: error.message,
                code: 'LIST_JOBS_ERROR'
            });
        }
    }

    /**
     * Cancel a running batch job
     * DELETE /api/embeddings/jobs/:jobId
     */
    async cancelJob(req, res) {
        try {
            const { jobId } = req.params;
            const job = this.activeJobs.get(jobId);

            if (!job) {
                return res.status(404).json({
                    error: 'Job not found',
                    job_id: jobId,
                    code: 'JOB_NOT_FOUND'
                });
            }

            if (job.status === 'completed' || job.status === 'failed') {
                return res.status(400).json({
                    error: 'Cannot cancel completed or failed job',
                    job_id: jobId,
                    status: job.status,
                    code: 'JOB_NOT_CANCELLABLE'
                });
            }

            job.status = 'cancelled';
            job.finished_at = new Date().toISOString();
            job.cancelled_by = 'user'; // Could be enhanced with user authentication

            res.json({
                success: true,
                message: 'Job cancelled successfully',
                job_id: jobId,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Cancel job error:', error);
            res.status(500).json({
                error: 'Failed to cancel job',
                message: error.message,
                code: 'CANCEL_JOB_ERROR'
            });
        }
    }

    /**
     * Process a single ADR file
     * POST /api/embeddings/process/single
     */
    async processSingleDocument(req, res) {
        try {
            const {
                content,
                content_type = 'adr', // 'adr', 'pattern', 'text'
                metadata = {},
                project_id = null,
                force_reprocess = false
            } = req.body;

            if (!content || typeof content !== 'string') {
                return res.status(400).json({
                    error: 'Content is required and must be a string',
                    code: 'INVALID_CONTENT'
                });
            }

            let embedding;
            let result;

            if (content_type === 'adr') {
                // Process as ADR
                const adrData = {
                    title: metadata.title || 'Untitled ADR',
                    problem_statement: content,
                    decision: metadata.decision || '',
                    rationale: metadata.rationale || '',
                    ...metadata
                };

                embedding = await this.embeddingService.generateADREmbedding(adrData);

                if (!req.body.dry_run) {
                    result = await this.queries.upsertADR({
                        project_id: project_id,
                        number: metadata.number || Date.now(),
                        title: adrData.title,
                        problem_statement: adrData.problem_statement,
                        decision: adrData.decision,
                        rationale: adrData.rationale,
                        alternatives: metadata.alternatives || [],
                        author_id: metadata.author_id || null
                    }, embedding);
                }

            } else if (content_type === 'pattern') {
                // Process as Pattern
                const patternData = {
                    name: metadata.name || 'Untitled Pattern',
                    description: content,
                    when_to_use: metadata.when_to_use || '',
                    when_not_to_use: metadata.when_not_to_use || '',
                    ...metadata
                };

                embedding = await this.embeddingService.generatePatternEmbedding(patternData);

                if (!req.body.dry_run) {
                    result = await this.queries.upsertPattern({
                        name: patternData.name,
                        category: metadata.category || 'general',
                        description: patternData.description,
                        when_to_use: patternData.when_to_use,
                        when_not_to_use: patternData.when_not_to_use,
                        context_tags: metadata.context_tags || [],
                        author_id: metadata.author_id || null
                    }, embedding);
                }

            } else {
                // Process as plain text
                embedding = await this.embeddingService.generateEmbedding(content);
            }

            res.json({
                success: true,
                content_type,
                embedding_dimensions: embedding.length,
                dry_run: req.body.dry_run || false,
                result: req.body.dry_run ? null : result,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Single document processing error:', error);
            res.status(500).json({
                error: 'Failed to process document',
                message: error.message,
                code: 'SINGLE_PROCESS_ERROR'
            });
        }
    }

    /**
     * Run batch job in background
     */
    async runBatchJob(jobId, job) {
        try {
            job.status = 'running';

            if (job.type === 'adrs' || job.type === 'all') {
                const processor = new ADRBatchProcessor({
                    adrDirectory: job.options.adr_directory,
                    dryRun: job.options.dry_run,
                    defaultProjectName: job.options.project_name
                });

                await processor.initialize();
                const results = await processor.processAllADRs();

                job.progress = {
                    total: results.processed + results.errors + results.skipped,
                    processed: results.processed,
                    errors: results.errors,
                    skipped: results.skipped
                };

                job.results = results;
                await processor.close();
            }

            // TODO: Add pattern processing when pattern files exist
            if (job.type === 'patterns' || job.type === 'all') {
                // Placeholder for pattern processing
                console.log('Pattern processing not yet implemented');
            }

            job.status = 'completed';
            job.finished_at = new Date().toISOString();

            // Clean up old jobs (keep last 100)
            if (this.activeJobs.size > 100) {
                const sortedJobs = Array.from(this.activeJobs.entries())
                    .sort(([,a], [,b]) => new Date(a.started_at) - new Date(b.started_at));
                
                // Remove oldest jobs, keep 50
                const toRemove = sortedJobs.slice(0, sortedJobs.length - 50);
                toRemove.forEach(([id]) => this.activeJobs.delete(id));
            }

        } catch (error) {
            console.error(`Batch job ${jobId} error:`, error);
            job.status = 'failed';
            job.error = error.message;
            job.finished_at = new Date().toISOString();
            throw error;
        }
    }
}

// Create singleton instance
const batchAPI = new BatchProcessorAPI();

// Middleware to ensure initialization
const ensureInitialized = async (req, res, next) => {
    try {
        await batchAPI.initialize();
        next();
    } catch (error) {
        console.error('Failed to initialize batch processor API:', error);
        res.status(503).json({
            error: 'Batch processor service unavailable',
            message: 'Failed to initialize batch processor API',
            code: 'SERVICE_UNAVAILABLE'
        });
    }
};

// Routes
router.post('/process', ensureInitialized, (req, res) => batchAPI.processEmbeddings(req, res));
router.post('/process/single', ensureInitialized, (req, res) => batchAPI.processSingleDocument(req, res));
router.get('/jobs', ensureInitialized, (req, res) => batchAPI.listJobs(req, res));
router.get('/jobs/:jobId', ensureInitialized, (req, res) => batchAPI.getJobStatus(req, res));
router.delete('/jobs/:jobId', ensureInitialized, (req, res) => batchAPI.cancelJob(req, res));

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        initialized: batchAPI.initialized,
        active_jobs: batchAPI.activeJobs.size,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;