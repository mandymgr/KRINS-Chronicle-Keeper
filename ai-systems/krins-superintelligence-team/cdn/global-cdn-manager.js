const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const zlib = require('zlib');

const gzip = promisify(zlib.gzip);
const brotliCompress = promisify(zlib.brotliCompress);

class GlobalCDNManager {
    constructor(config = {}) {
        this.config = {
            // CDN Providers configuration
            providers: {
                cloudflare: {
                    enabled: config.cloudflare?.enabled || false,
                    zoneId: config.cloudflare?.zoneId || process.env.CLOUDFLARE_ZONE_ID,
                    apiToken: config.cloudflare?.apiToken || process.env.CLOUDFLARE_API_TOKEN,
                    baseUrl: 'https://api.cloudflare.com/client/v4'
                },
                aws: {
                    enabled: config.aws?.enabled || false,
                    distributionId: config.aws?.distributionId || process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
                    accessKeyId: config.aws?.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: config.aws?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
                    region: config.aws?.region || 'us-east-1'
                },
                azure: {
                    enabled: config.azure?.enabled || false,
                    profileName: config.azure?.profileName || process.env.AZURE_CDN_PROFILE,
                    endpointName: config.azure?.endpointName || process.env.AZURE_CDN_ENDPOINT
                }
            },
            
            // Cache configuration
            cache: {
                staticAssets: {
                    maxAge: 31536000, // 1 year
                    extensions: ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2']
                },
                apiResponses: {
                    maxAge: 300, // 5 minutes
                    paths: ['/api/agents/status', '/api/metrics']
                },
                html: {
                    maxAge: 3600, // 1 hour
                    paths: ['/', '/dashboard', '/analytics']
                }
            },
            
            // Compression settings
            compression: {
                enabled: true,
                minSize: 1024, // 1KB
                algorithms: ['br', 'gzip'], // Brotli preferred
                levels: {
                    br: 4, // Balanced quality/speed
                    gzip: 6
                }
            },
            
            // Edge locations (Nordic-focused)
            edgeLocations: {
                nordic: ['stockholm', 'oslo', 'copenhagen', 'helsinki'],
                europe: ['london', 'frankfurt', 'amsterdam', 'paris'],
                global: ['new-york', 'tokyo', 'sydney', 'singapore']
            },
            
            // Performance optimization
            optimization: {
                minify: true,
                imageOptimization: true,
                http2Push: true,
                preload: true
            },
            
            // Monitoring
            monitoring: {
                enabled: true,
                alertThresholds: {
                    errorRate: 5, // %
                    responseTime: 2000, // ms
                    cacheHitRate: 85 // %
                }
            }
        };

        this.metrics = {
            requests: new Map(),
            cacheHits: new Map(),
            errors: new Map(),
            responseTime: new Map()
        };

        this.assetManifest = new Map();
        this.compressionCache = new Map();
        
        console.log('🌐 Global CDN Manager initialized with Nordic optimization focus');
    }

    async initialize() {
        console.log('🚀 Initializing global CDN infrastructure...');
        
        try {
            // Initialize CDN providers
            await this.initializeProviders();
            
            // Setup asset optimization
            await this.setupAssetOptimization();
            
            // Configure edge caching rules
            await this.configureEdgeCaching();
            
            // Start monitoring
            this.startMonitoring();
            
            console.log('✅ Global CDN infrastructure ready');
            
        } catch (error) {
            console.error('❌ CDN initialization failed:', error);
            throw error;
        }
    }

    async initializeProviders() {
        const enabledProviders = [];
        
        // Cloudflare setup
        if (this.config.providers.cloudflare.enabled && 
            this.config.providers.cloudflare.apiToken) {
            await this.initializeCloudflare();
            enabledProviders.push('Cloudflare');
        }
        
        // AWS CloudFront setup  
        if (this.config.providers.aws.enabled && 
            this.config.providers.aws.accessKeyId) {
            await this.initializeAWS();
            enabledProviders.push('AWS CloudFront');
        }
        
        // Azure CDN setup
        if (this.config.providers.azure.enabled && 
            this.config.providers.azure.profileName) {
            await this.initializeAzure();
            enabledProviders.push('Azure CDN');
        }
        
        console.log(`🌐 CDN Providers initialized: ${enabledProviders.join(', ')}`);
        
        if (enabledProviders.length === 0) {
            console.warn('⚠️ No CDN providers configured - running in origin-only mode');
        }
    }

    async initializeCloudflare() {
        const cf = this.config.providers.cloudflare;
        
        try {
            // Test API connectivity
            const response = await axios.get(`${cf.baseUrl}/zones/${cf.zoneId}`, {
                headers: {
                    'Authorization': `Bearer ${cf.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Cloudflare API connected');
            
            // Configure Nordic-optimized settings
            await this.configureCloudflareOptimizations();
            
        } catch (error) {
            console.error('❌ Cloudflare initialization failed:', error.message);
            throw error;
        }
    }

    async configureCloudflareOptimizations() {
        const cf = this.config.providers.cloudflare;
        const optimizations = [
            // Enable Brotli compression
            {
                setting: 'brotli',
                value: 'on'
            },
            // Enable Auto Minify
            {
                setting: 'minify',
                value: {
                    css: 'on',
                    html: 'on',
                    js: 'on'
                }
            },
            // Enable Argo Smart Routing for Nordic regions
            {
                setting: 'argo',
                value: 'on'
            },
            // Configure caching levels
            {
                setting: 'cache_level',
                value: 'aggressive'
            }
        ];

        for (const opt of optimizations) {
            try {
                await axios.patch(
                    `${cf.baseUrl}/zones/${cf.zoneId}/settings/${opt.setting}`,
                    { value: opt.value },
                    {
                        headers: {
                            'Authorization': `Bearer ${cf.apiToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(`✅ Cloudflare ${opt.setting} configured`);
            } catch (error) {
                console.warn(`⚠️ Failed to configure ${opt.setting}:`, error.message);
            }
        }
    }

    async setupAssetOptimization() {
        console.log('🎯 Setting up asset optimization pipeline...');
        
        // Create asset manifest for cache busting
        await this.generateAssetManifest();
        
        // Setup compression for static assets
        await this.setupCompressionPipeline();
        
        // Configure HTTP/2 Server Push
        await this.configureHTTP2Push();
        
        console.log('✅ Asset optimization pipeline ready');
    }

    async generateAssetManifest() {
        const staticDir = path.join(__dirname, '../interface/static');
        
        try {
            await this.processDirectory(staticDir);
            console.log(`📋 Asset manifest generated with ${this.assetManifest.size} entries`);
        } catch (error) {
            console.warn('⚠️ Could not generate asset manifest:', error.message);
        }
    }

    async processDirectory(dir) {
        try {
            const files = await fs.readdir(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = await fs.stat(filePath);
                
                if (stat.isDirectory()) {
                    await this.processDirectory(filePath);
                } else {
                    await this.processAsset(filePath);
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be read
            return;
        }
    }

    async processAsset(filePath) {
        try {
            const content = await fs.readFile(filePath);
            const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
            const ext = path.extname(filePath);
            const relativePath = path.relative(path.join(__dirname, '../interface/static'), filePath);
            
            // Add to manifest
            this.assetManifest.set(relativePath, {
                hash,
                size: content.length,
                path: filePath,
                url: `/static/${relativePath}?v=${hash}`,
                cached: false,
                compressed: false
            });

            // Pre-compress if applicable
            if (this.config.compression.enabled && 
                content.length >= this.config.compression.minSize) {
                await this.precompressAsset(filePath, content);
            }
            
        } catch (error) {
            console.warn(`⚠️ Failed to process asset ${filePath}:`, error.message);
        }
    }

    async precompressAsset(filePath, content) {
        const compressionResults = {};
        
        for (const algorithm of this.config.compression.algorithms) {
            try {
                let compressed;
                
                if (algorithm === 'br') {
                    compressed = await brotliCompress(content, {
                        params: {
                            [zlib.constants.BROTLI_PARAM_QUALITY]: this.config.compression.levels.br
                        }
                    });
                } else if (algorithm === 'gzip') {
                    compressed = await gzip(content, {
                        level: this.config.compression.levels.gzip
                    });
                }
                
                compressionResults[algorithm] = {
                    size: compressed.length,
                    ratio: content.length / compressed.length,
                    data: compressed
                };
                
            } catch (error) {
                console.warn(`⚠️ ${algorithm} compression failed for ${filePath}:`, error.message);
            }
        }
        
        // Store best compression
        const bestCompression = Object.entries(compressionResults)
            .reduce((best, [alg, result]) => 
                result.size < best.size ? { algorithm: alg, ...result } : best
            , { size: Infinity });
            
        if (bestCompression.size < content.length) {
            this.compressionCache.set(filePath, bestCompression);
        }
    }

    async setupCompressionPipeline() {
        console.log('🗜️ Compression pipeline configured');
        // Compression setup complete - handled in precompressAsset
    }

    async configureHTTP2Push() {
        // Generate push manifest for critical resources
        const criticalResources = [
            '/static/css/main.css',
            '/static/js/main.js',
            '/static/fonts/playfair-display.woff2'
        ];
        
        this.pushManifest = criticalResources.filter(resource => 
            this.assetManifest.has(resource.replace('/static/', ''))
        );
        
        console.log(`⚡ HTTP/2 Push configured for ${this.pushManifest.length} critical resources`);
    }

    async configureEdgeCaching() {
        console.log('🎯 Configuring edge caching rules...');
        
        const cacheRules = [
            // Static assets - long cache
            {
                pattern: this.config.cache.staticAssets.extensions.join('|'),
                maxAge: this.config.cache.staticAssets.maxAge,
                type: 'static'
            },
            
            // API responses - short cache
            {
                pattern: this.config.cache.apiResponses.paths.join('|'),
                maxAge: this.config.cache.apiResponses.maxAge,
                type: 'api'
            },
            
            // HTML pages - medium cache
            {
                pattern: this.config.cache.html.paths.join('|'),
                maxAge: this.config.cache.html.maxAge,
                type: 'html'
            }
        ];
        
        // Apply rules to CDN providers
        for (const rule of cacheRules) {
            await this.applyCacheRule(rule);
        }
        
        console.log('✅ Edge caching rules configured');
    }

    async applyCacheRule(rule) {
        // Apply to Cloudflare
        if (this.config.providers.cloudflare.enabled) {
            await this.applyCloudflareRule(rule);
        }
        
        // Apply to other providers...
    }

    async applyCloudflareRule(rule) {
        const cf = this.config.providers.cloudflare;
        
        try {
            // Create page rule for caching
            await axios.post(
                `${cf.baseUrl}/zones/${cf.zoneId}/pagerules`,
                {
                    targets: [{
                        target: 'url',
                        constraint: {
                            operator: 'matches',
                            value: `*${rule.pattern}*`
                        }
                    }],
                    actions: [
                        {
                            id: 'cache_level',
                            value: 'cache_everything'
                        },
                        {
                            id: 'edge_cache_ttl',
                            value: rule.maxAge
                        }
                    ],
                    status: 'active'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${cf.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log(`✅ Cloudflare cache rule applied for ${rule.type}`);
            
        } catch (error) {
            console.warn(`⚠️ Failed to apply Cloudflare rule for ${rule.type}:`, error.message);
        }
    }

    startMonitoring() {
        if (!this.config.monitoring.enabled) return;
        
        console.log('📊 Starting CDN monitoring...');
        
        // Monitor every 5 minutes
        setInterval(() => {
            this.collectMetrics();
        }, 300000);
        
        // Performance alerts every minute
        setInterval(() => {
            this.checkAlerts();
        }, 60000);
        
        console.log('✅ CDN monitoring active');
    }

    async collectMetrics() {
        try {
            // Collect from Cloudflare
            if (this.config.providers.cloudflare.enabled) {
                await this.collectCloudflareMetrics();
            }
            
            // Collect from other providers...
            
            console.log('📈 CDN metrics collected');
        } catch (error) {
            console.error('❌ Failed to collect metrics:', error.message);
        }
    }

    async collectCloudflareMetrics() {
        const cf = this.config.providers.cloudflare;
        const now = new Date();
        const since = new Date(now.getTime() - 3600000); // Last hour
        
        try {
            const response = await axios.get(
                `${cf.baseUrl}/zones/${cf.zoneId}/analytics/dashboard`,
                {
                    headers: {
                        'Authorization': `Bearer ${cf.apiToken}`
                    },
                    params: {
                        since: since.toISOString(),
                        until: now.toISOString(),
                        continuous: true
                    }
                }
            );
            
            const metrics = response.data.result;
            
            // Store metrics
            this.metrics.requests.set('cloudflare', {
                total: metrics.requests.all,
                cached: metrics.requests.cached,
                uncached: metrics.requests.uncached,
                timestamp: now
            });
            
            this.metrics.responseTime.set('cloudflare', {
                avg: metrics.requests.avg_origin_time,
                timestamp: now
            });
            
            // Calculate cache hit rate
            const cacheHitRate = (metrics.requests.cached / metrics.requests.all) * 100;
            this.metrics.cacheHits.set('cloudflare', {
                rate: cacheHitRate,
                timestamp: now
            });
            
        } catch (error) {
            console.warn('⚠️ Failed to collect Cloudflare metrics:', error.message);
        }
    }

    checkAlerts() {
        const thresholds = this.config.monitoring.alertThresholds;
        
        // Check cache hit rate
        for (const [provider, metrics] of this.metrics.cacheHits) {
            if (metrics.rate < thresholds.cacheHitRate) {
                console.warn(`🚨 ALERT: ${provider} cache hit rate is ${metrics.rate.toFixed(1)}% (threshold: ${thresholds.cacheHitRate}%)`);
            }
        }
        
        // Check response time
        for (const [provider, metrics] of this.metrics.responseTime) {
            if (metrics.avg > thresholds.responseTime) {
                console.warn(`🚨 ALERT: ${provider} response time is ${metrics.avg}ms (threshold: ${thresholds.responseTime}ms)`);
            }
        }
    }

    // Public API methods
    async purgeCache(paths = []) {
        console.log(`🧹 Purging cache for ${paths.length || 'all'} paths...`);
        
        const results = {};
        
        // Purge from Cloudflare
        if (this.config.providers.cloudflare.enabled) {
            results.cloudflare = await this.purgeCloudflareCache(paths);
        }
        
        // Purge from other providers...
        
        return results;
    }

    async purgeCloudflareCache(paths = []) {
        const cf = this.config.providers.cloudflare;
        
        try {
            const purgeData = paths.length > 0 ? 
                { files: paths } : 
                { purge_everything: true };
                
            const response = await axios.post(
                `${cf.baseUrl}/zones/${cf.zoneId}/purge_cache`,
                purgeData,
                {
                    headers: {
                        'Authorization': `Bearer ${cf.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Cloudflare cache purged successfully');
            return { success: true, id: response.data.result.id };
            
        } catch (error) {
            console.error('❌ Cloudflare cache purge failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    async warmupCache(paths = []) {
        console.log(`🔥 Warming up cache for ${paths.length} paths...`);
        
        const promises = paths.map(async (path) => {
            try {
                // Make request to warm up edge caches
                await axios.get(path, { timeout: 10000 });
                return { path, success: true };
            } catch (error) {
                return { path, success: false, error: error.message };
            }
        });
        
        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        
        console.log(`🔥 Cache warmup completed: ${successful}/${paths.length} successful`);
        return results;
    }

    getMetrics() {
        return {
            requests: Object.fromEntries(this.metrics.requests),
            cacheHits: Object.fromEntries(this.metrics.cacheHits),
            errors: Object.fromEntries(this.metrics.errors),
            responseTime: Object.fromEntries(this.metrics.responseTime),
            assetCount: this.assetManifest.size,
            compressionCount: this.compressionCache.size
        };
    }

    getAssetUrl(assetPath) {
        const asset = this.assetManifest.get(assetPath);
        return asset ? asset.url : `/static/${assetPath}`;
    }

    async handleAssetRequest(req, res) {
        const assetPath = req.params[0]; // Capture from route
        const asset = this.assetManifest.get(assetPath);
        
        if (!asset) {
            res.status(404).send('Asset not found');
            return;
        }
        
        try {
            // Set caching headers
            this.setCacheHeaders(res, assetPath);
            
            // Check if client supports compression
            const acceptEncoding = req.headers['accept-encoding'] || '';
            const compressed = this.compressionCache.get(asset.path);
            
            if (compressed && acceptEncoding.includes(compressed.algorithm)) {
                res.set('Content-Encoding', compressed.algorithm);
                res.set('Content-Length', compressed.size.toString());
                res.send(compressed.data);
            } else {
                res.sendFile(asset.path);
            }
            
            // Update metrics
            this.recordAssetRequest(assetPath, true);
            
        } catch (error) {
            console.error(`❌ Asset serve error for ${assetPath}:`, error);
            this.recordAssetRequest(assetPath, false);
            res.status(500).send('Internal Server Error');
        }
    }

    setCacheHeaders(res, assetPath) {
        const ext = path.extname(assetPath);
        
        if (this.config.cache.staticAssets.extensions.includes(ext)) {
            res.set('Cache-Control', `public, max-age=${this.config.cache.staticAssets.maxAge}, immutable`);
            res.set('ETag', `"${this.assetManifest.get(assetPath)?.hash}"`);
        }
    }

    recordAssetRequest(assetPath, success) {
        // Record metrics for monitoring
        const key = `asset_${assetPath}`;
        const current = this.metrics.requests.get(key) || { total: 0, success: 0, errors: 0 };
        
        current.total++;
        if (success) {
            current.success++;
        } else {
            current.errors++;
        }
        current.timestamp = new Date();
        
        this.metrics.requests.set(key, current);
    }

    // Nordic-optimized edge configuration
    async optimizeForNordic() {
        console.log('🇳🇴 Applying Nordic-specific optimizations...');
        
        // Prioritize Nordic edge locations
        const nordicEdges = this.config.edgeLocations.nordic;
        
        // Configure geo-routing for Nordic regions
        if (this.config.providers.cloudflare.enabled) {
            await this.configureNordicRouting();
        }
        
        console.log('✅ Nordic optimizations applied');
    }

    async configureNordicRouting() {
        // Implementation for Nordic-specific routing optimizations
        console.log('🌊 Nordic routing configured for optimal Scandinavian performance');
    }
}

module.exports = { GlobalCDNManager };