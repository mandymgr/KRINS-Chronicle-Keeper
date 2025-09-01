const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));

class ProjectAnalyzer {
    constructor(agentOrchestrator) {
        this.agents = agentOrchestrator;
        this.analysisCache = new Map();
        this.patterns = new Map();
        
        // Initialize analysis patterns
        this.initializePatterns();
        
        // Analysis metrics
        this.metrics = {
            codeQuality: 0,
            security: 0,
            performance: 0,
            maintainability: 0,
            testCoverage: 0,
            documentation: 0,
            architecture: 0
        };
    }

    initializePatterns() {
        // Architecture patterns
        this.patterns.set('mvc', {
            indicators: ['controller', 'model', 'view', 'routes'],
            score: 0.8,
            type: 'architecture'
        });
        
        this.patterns.set('microservices', {
            indicators: ['service', 'api', 'gateway', 'docker', 'kubernetes'],
            score: 0.9,
            type: 'architecture'
        });

        this.patterns.set('layered', {
            indicators: ['controller', 'service', 'repository', 'entity'],
            score: 0.7,
            type: 'architecture'
        });

        // Security patterns
        this.patterns.set('authentication', {
            indicators: ['auth', 'jwt', 'passport', 'oauth', 'session'],
            score: 0.8,
            type: 'security'
        });

        this.patterns.set('encryption', {
            indicators: ['crypto', 'bcrypt', 'hash', 'encrypt', 'ssl'],
            score: 0.9,
            type: 'security'
        });

        // Performance patterns
        this.patterns.set('caching', {
            indicators: ['cache', 'redis', 'memcached', 'cdn'],
            score: 0.8,
            type: 'performance'
        });

        this.patterns.set('async', {
            indicators: ['async', 'await', 'promise', 'queue', 'worker'],
            score: 0.7,
            type: 'performance'
        });

        // Testing patterns
        this.patterns.set('testing', {
            indicators: ['test', 'spec', 'jest', 'mocha', 'cypress'],
            score: 0.9,
            type: 'testing'
        });
    }

    async analyzeProject(projectPath, options = {}) {
        const startTime = Date.now();
        console.log('🔍 Starting comprehensive project analysis...');

        const analysis = {
            timestamp: new Date().toISOString(),
            projectPath,
            options,
            metrics: {},
            patterns: {},
            files: {},
            dependencies: {},
            architecture: {},
            recommendations: [],
            risks: [],
            insights: []
        };

        try {
            // Phase 1: File structure analysis
            console.log('📁 Analyzing file structure...');
            analysis.files = await this.analyzeFileStructure(projectPath);
            
            // Phase 2: Dependency analysis
            console.log('📦 Analyzing dependencies...');
            analysis.dependencies = await this.analyzeDependencies(projectPath);
            
            // Phase 3: Code pattern detection
            console.log('🔍 Detecting code patterns...');
            analysis.patterns = await this.detectPatterns(projectPath, analysis.files);
            
            // Phase 4: Architecture assessment
            console.log('🏗️ Assessing architecture...');
            analysis.architecture = await this.assessArchitecture(analysis);
            
            // Phase 5: Multi-agent deep analysis
            console.log('🤖 Conducting multi-agent analysis...');
            const agentAnalysis = await this.conductAgentAnalysis(analysis);
            
            // Phase 6: Generate recommendations
            console.log('💡 Generating recommendations...');
            analysis.recommendations = await this.generateRecommendations(analysis, agentAnalysis);
            
            // Phase 7: Risk assessment
            console.log('⚠️ Assessing risks...');
            analysis.risks = await this.assessRisks(analysis);
            
            // Phase 8: Generate insights
            console.log('🧠 Generating insights...');
            analysis.insights = await this.generateInsights(analysis);
            
            // Calculate final metrics
            analysis.metrics = this.calculateMetrics(analysis);
            
            const duration = Date.now() - startTime;
            console.log(`✅ Project analysis completed in ${duration}ms`);
            
            return analysis;
            
        } catch (error) {
            console.error('❌ Project analysis failed:', error);
            throw error;
        }
    }

    async analyzeFileStructure(projectPath) {
        const structure = {
            totalFiles: 0,
            totalLines: 0,
            languages: {},
            directories: [],
            largeFiles: [],
            complexity: 'low',
            organization: 'good'
        };

        try {
            // Get all files
            const globPattern = path.join(projectPath, '**/*');
            const allFiles = await glob(globPattern, { 
                ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
                nodir: true 
            });

            structure.totalFiles = allFiles.length;

            // Analyze each file
            for (const filePath of allFiles) {
                try {
                    const ext = path.extname(filePath).slice(1) || 'no-extension';
                    const stats = await fs.stat(filePath);
                    
                    if (!structure.languages[ext]) {
                        structure.languages[ext] = { files: 0, lines: 0, size: 0 };
                    }
                    
                    structure.languages[ext].files++;
                    structure.languages[ext].size += stats.size;

                    // Count lines for text files
                    if (this.isTextFile(ext)) {
                        const content = await fs.readFile(filePath, 'utf8');
                        const lines = content.split('\n').length;
                        structure.languages[ext].lines += lines;
                        structure.totalLines += lines;

                        // Track large files
                        if (lines > 500) {
                            structure.largeFiles.push({
                                path: filePath,
                                lines,
                                size: stats.size
                            });
                        }
                    }
                } catch (fileError) {
                    // Skip files that can't be read
                    continue;
                }
            }

            // Assess complexity
            structure.complexity = this.assessFileComplexity(structure);
            structure.organization = this.assessOrganization(allFiles, projectPath);

            return structure;
            
        } catch (error) {
            console.error('Error analyzing file structure:', error);
            return structure;
        }
    }

    async analyzeDependencies(projectPath) {
        const dependencies = {
            production: {},
            development: {},
            peerDependencies: {},
            outdated: [],
            security: [],
            analysis: {}
        };

        try {
            const packageJsonPath = path.join(projectPath, 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

            dependencies.production = packageJson.dependencies || {};
            dependencies.development = packageJson.devDependencies || {};
            dependencies.peerDependencies = packageJson.peerDependencies || {};

            // Analyze dependency patterns
            dependencies.analysis = {
                totalCount: Object.keys(dependencies.production).length + 
                           Object.keys(dependencies.development).length,
                categories: this.categorizeDependencies(dependencies),
                riskAssessment: this.assessDependencyRisks(dependencies),
                bundleSize: await this.estimateBundleSize(dependencies.production)
            };

        } catch (error) {
            console.log('No package.json found or error reading dependencies');
        }

        return dependencies;
    }

    async detectPatterns(projectPath, fileStructure) {
        const detectedPatterns = new Map();
        
        // Analyze directory structure
        const directories = await this.getDirectoryStructure(projectPath);
        
        // Check each pattern
        for (const [patternName, pattern] of this.patterns) {
            let score = 0;
            const evidence = [];
            
            // Check file/directory names
            for (const indicator of pattern.indicators) {
                const matches = directories.filter(dir => 
                    dir.toLowerCase().includes(indicator.toLowerCase())
                );
                
                if (matches.length > 0) {
                    score += 0.2;
                    evidence.push(`Found ${matches.length} matches for "${indicator}"`);
                }
            }

            // Check file contents (limited sampling for performance)
            if (score > 0) {
                const contentScore = await this.analyzeContentPatterns(
                    projectPath, 
                    pattern.indicators
                );
                score += contentScore;
            }

            if (score > 0.3) {
                detectedPatterns.set(patternName, {
                    score,
                    confidence: Math.min(score, 1.0),
                    evidence,
                    type: pattern.type
                });
            }
        }

        return Object.fromEntries(detectedPatterns);
    }

    async assessArchitecture(analysis) {
        const architecture = {
            style: 'unknown',
            confidence: 0,
            layers: [],
            coupling: 'medium',
            cohesion: 'medium',
            scalability: 'medium',
            maintainability: 'medium',
            testability: 'medium',
            recommendations: []
        };

        // Determine architectural style
        const patterns = analysis.patterns;
        
        if (patterns.mvc && patterns.mvc.confidence > 0.6) {
            architecture.style = 'MVC';
            architecture.confidence = patterns.mvc.confidence;
        } else if (patterns.microservices && patterns.microservices.confidence > 0.7) {
            architecture.style = 'Microservices';
            architecture.confidence = patterns.microservices.confidence;
        } else if (patterns.layered && patterns.layered.confidence > 0.5) {
            architecture.style = 'Layered';
            architecture.confidence = patterns.layered.confidence;
        }

        // Assess coupling based on import patterns
        architecture.coupling = await this.assessCoupling(analysis);
        
        // Assess other qualities
        architecture.cohesion = this.assessCohesion(analysis);
        architecture.scalability = this.assessScalability(analysis);
        architecture.maintainability = this.assessMaintainability(analysis);
        architecture.testability = this.assessTestability(analysis);

        return architecture;
    }

    async conductAgentAnalysis(analysis) {
        const agentResults = {};

        try {
            // Architect Agent - System design analysis
            console.log('🏗️ Architect agent analyzing...');
            agentResults.architect = await this.getArchitectAnalysis(analysis);
            
            // Security Agent - Security assessment
            console.log('🔒 Security agent analyzing...');
            agentResults.security = await this.getSecurityAnalysis(analysis);
            
            // Performance Agent - Performance analysis
            console.log('⚡ Performance agent analyzing...');
            agentResults.performance = await this.getPerformanceAnalysis(analysis);
            
            // Compliance Agent - Standards compliance
            console.log('📋 Compliance agent analyzing...');
            agentResults.compliance = await this.getComplianceAnalysis(analysis);
            
            // Red Team Agent - Risk assessment
            console.log('🔍 Red team agent analyzing...');
            agentResults.redteam = await this.getRedTeamAnalysis(analysis);
            
        } catch (error) {
            console.error('Agent analysis error:', error);
        }

        return agentResults;
    }

    async generateRecommendations(analysis, agentAnalysis) {
        const recommendations = [];

        // Architecture recommendations
        if (analysis.architecture.style === 'unknown') {
            recommendations.push({
                category: 'Architecture',
                priority: 'high',
                title: 'Establish Clear Architecture',
                description: 'Project lacks identifiable architectural patterns',
                suggestion: 'Consider adopting MVC, layered, or microservices architecture',
                impact: 'High - improves maintainability and team collaboration',
                effort: 'Medium',
                agent: 'architect'
            });
        }

        // Security recommendations
        if (!analysis.patterns.authentication || analysis.patterns.authentication.confidence < 0.5) {
            recommendations.push({
                category: 'Security',
                priority: 'critical',
                title: 'Implement Authentication',
                description: 'No clear authentication mechanism detected',
                suggestion: 'Add JWT, OAuth, or session-based authentication',
                impact: 'Critical - prevents unauthorized access',
                effort: 'High',
                agent: 'security'
            });
        }

        // Performance recommendations
        if (!analysis.patterns.caching || analysis.patterns.caching.confidence < 0.3) {
            recommendations.push({
                category: 'Performance',
                priority: 'medium',
                title: 'Add Caching Layer',
                description: 'No caching mechanisms detected',
                suggestion: 'Implement Redis caching for frequently accessed data',
                impact: 'Medium - improves response times',
                effort: 'Medium',
                agent: 'performance'
            });
        }

        // Testing recommendations
        if (!analysis.patterns.testing || analysis.patterns.testing.confidence < 0.4) {
            recommendations.push({
                category: 'Testing',
                priority: 'high',
                title: 'Improve Test Coverage',
                description: 'Limited testing infrastructure detected',
                suggestion: 'Add unit tests, integration tests, and CI/CD pipeline',
                impact: 'High - reduces bugs and improves reliability',
                effort: 'High',
                agent: 'compliance'
            });
        }

        // Documentation recommendations
        const hasDocumentation = analysis.files.languages.md && 
                                analysis.files.languages.md.files > 2;
        
        if (!hasDocumentation) {
            recommendations.push({
                category: 'Documentation',
                priority: 'medium',
                title: 'Add Project Documentation',
                description: 'Limited documentation found',
                suggestion: 'Create README, API docs, and developer guides',
                impact: 'Medium - improves developer onboarding',
                effort: 'Low',
                agent: 'compliance'
            });
        }

        // Large file recommendations
        if (analysis.files.largeFiles.length > 0) {
            recommendations.push({
                category: 'Code Quality',
                priority: 'medium',
                title: 'Refactor Large Files',
                description: `Found ${analysis.files.largeFiles.length} files with >500 lines`,
                suggestion: 'Break down large files into smaller, focused modules',
                impact: 'Medium - improves maintainability',
                effort: 'Medium',
                agent: 'architect'
            });
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    async assessRisks(analysis) {
        const risks = [];

        // Security risks
        if (!analysis.patterns.encryption || analysis.patterns.encryption.confidence < 0.3) {
            risks.push({
                category: 'Security',
                severity: 'high',
                title: 'Weak Encryption Patterns',
                description: 'Limited use of encryption detected',
                likelihood: 'high',
                impact: 'critical',
                mitigation: 'Implement proper encryption for sensitive data'
            });
        }

        // Performance risks
        if (analysis.files.totalLines > 50000 && 
            (!analysis.patterns.async || analysis.patterns.async.confidence < 0.5)) {
            risks.push({
                category: 'Performance',
                severity: 'medium',
                title: 'Synchronous Bottlenecks',
                description: 'Large codebase with limited async patterns',
                likelihood: 'medium',
                impact: 'high',
                mitigation: 'Adopt async/await patterns for I/O operations'
            });
        }

        // Maintainability risks
        if (analysis.files.largeFiles.length > 5) {
            risks.push({
                category: 'Maintainability',
                severity: 'medium',
                title: 'Code Complexity',
                description: 'Multiple large files detected',
                likelihood: 'high',
                impact: 'medium',
                mitigation: 'Refactor large files into smaller modules'
            });
        }

        // Dependency risks
        if (analysis.dependencies.analysis.totalCount > 100) {
            risks.push({
                category: 'Dependencies',
                severity: 'low',
                title: 'Dependency Bloat',
                description: 'High number of dependencies',
                likelihood: 'low',
                impact: 'medium',
                mitigation: 'Audit and remove unused dependencies'
            });
        }

        return risks;
    }

    async generateInsights(analysis) {
        const insights = [];

        // Code quality insights
        const avgLinesPerFile = analysis.files.totalLines / analysis.files.totalFiles;
        if (avgLinesPerFile > 200) {
            insights.push({
                type: 'observation',
                title: 'High File Complexity',
                description: `Average ${Math.round(avgLinesPerFile)} lines per file`,
                implication: 'May indicate need for better code organization'
            });
        }

        // Technology insights
        const languages = Object.keys(analysis.files.languages);
        if (languages.length > 5) {
            insights.push({
                type: 'observation',
                title: 'Multi-Language Project',
                description: `Uses ${languages.length} different languages/formats`,
                implication: 'Consider consolidating or documenting language choices'
            });
        }

        // Architecture insights
        if (analysis.architecture.confidence < 0.5) {
            insights.push({
                type: 'recommendation',
                title: 'Architectural Clarity',
                description: 'No dominant architectural pattern detected',
                implication: 'Team may benefit from architectural decision records (ADRs)'
            });
        }

        // Pattern insights
        const strongPatterns = Object.entries(analysis.patterns)
            .filter(([_, pattern]) => pattern.confidence > 0.8)
            .map(([name, _]) => name);

        if (strongPatterns.length > 0) {
            insights.push({
                type: 'strength',
                title: 'Strong Patterns Detected',
                description: `Well-implemented: ${strongPatterns.join(', ')}`,
                implication: 'Good foundation for scaling and maintenance'
            });
        }

        return insights;
    }

    calculateMetrics(analysis) {
        const metrics = {};

        // Code Quality Score (0-100)
        metrics.codeQuality = this.calculateCodeQualityScore(analysis);
        
        // Security Score (0-100)
        metrics.security = this.calculateSecurityScore(analysis);
        
        // Performance Score (0-100)
        metrics.performance = this.calculatePerformanceScore(analysis);
        
        // Maintainability Score (0-100)
        metrics.maintainability = this.calculateMaintainabilityScore(analysis);
        
        // Architecture Score (0-100)
        metrics.architecture = this.calculateArchitectureScore(analysis);
        
        // Overall Score
        metrics.overall = Math.round(
            (metrics.codeQuality + metrics.security + metrics.performance + 
             metrics.maintainability + metrics.architecture) / 5
        );

        return metrics;
    }

    // Helper methods
    isTextFile(extension) {
        const textExtensions = [
            'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h',
            'css', 'scss', 'sass', 'html', 'xml', 'json', 'yaml', 'yml',
            'md', 'txt', 'sql', 'sh', 'rb', 'go', 'rs', 'php', 'cs'
        ];
        return textExtensions.includes(extension.toLowerCase());
    }

    assessFileComplexity(structure) {
        const avgLinesPerFile = structure.totalLines / structure.totalFiles;
        
        if (avgLinesPerFile > 300) return 'high';
        if (avgLinesPerFile > 150) return 'medium';
        return 'low';
    }

    assessOrganization(files, projectPath) {
        const directories = new Set();
        files.forEach(file => {
            const dir = path.dirname(path.relative(projectPath, file));
            directories.add(dir);
        });

        const dirCount = directories.size;
        const avgFilesPerDir = files.length / dirCount;

        if (avgFilesPerDir < 5) return 'excellent';
        if (avgFilesPerDir < 10) return 'good';
        if (avgFilesPerDir < 20) return 'fair';
        return 'poor';
    }

    async getDirectoryStructure(projectPath) {
        try {
            const items = await fs.readdir(projectPath, { withFileTypes: true });
            let directories = [];
            
            for (const item of items) {
                if (item.isDirectory() && !item.name.startsWith('.') && 
                    item.name !== 'node_modules') {
                    directories.push(item.name);
                    
                    // Recursively get subdirectories (limited depth)
                    const subDirs = await this.getDirectoryStructure(
                        path.join(projectPath, item.name)
                    );
                    directories = directories.concat(
                        subDirs.map(sub => `${item.name}/${sub}`)
                    );
                }
            }
            
            return directories;
        } catch (error) {
            return [];
        }
    }

    calculateCodeQualityScore(analysis) {
        let score = 50; // Base score
        
        // Penalize large files
        if (analysis.files.largeFiles.length > 0) {
            score -= analysis.files.largeFiles.length * 5;
        }
        
        // Reward good organization
        if (analysis.files.organization === 'excellent') score += 20;
        else if (analysis.files.organization === 'good') score += 10;
        
        // Reward testing patterns
        if (analysis.patterns.testing && analysis.patterns.testing.confidence > 0.5) {
            score += 20;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    calculateSecurityScore(analysis) {
        let score = 30; // Low base for security
        
        if (analysis.patterns.authentication && analysis.patterns.authentication.confidence > 0.5) {
            score += 30;
        }
        
        if (analysis.patterns.encryption && analysis.patterns.encryption.confidence > 0.5) {
            score += 25;
        }
        
        // Add more security checks...
        
        return Math.max(0, Math.min(100, score));
    }

    calculatePerformanceScore(analysis) {
        let score = 50;
        
        if (analysis.patterns.async && analysis.patterns.async.confidence > 0.5) {
            score += 20;
        }
        
        if (analysis.patterns.caching && analysis.patterns.caching.confidence > 0.5) {
            score += 15;
        }
        
        // Penalize if no performance patterns and large codebase
        if (analysis.files.totalLines > 10000 && 
            (!analysis.patterns.async || analysis.patterns.async.confidence < 0.3)) {
            score -= 20;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    calculateMaintainabilityScore(analysis) {
        let score = 60;
        
        if (analysis.architecture.confidence > 0.6) {
            score += 15;
        }
        
        if (analysis.files.organization === 'excellent') score += 10;
        else if (analysis.files.organization === 'poor') score -= 15;
        
        if (analysis.files.largeFiles.length > 3) {
            score -= analysis.files.largeFiles.length * 3;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    calculateArchitectureScore(analysis) {
        let score = 40;
        
        if (analysis.architecture.confidence > 0.8) score += 30;
        else if (analysis.architecture.confidence > 0.6) score += 20;
        else if (analysis.architecture.confidence > 0.4) score += 10;
        
        // Reward clear patterns
        const strongPatterns = Object.values(analysis.patterns)
            .filter(p => p.confidence > 0.7).length;
        score += strongPatterns * 5;
        
        return Math.max(0, Math.min(100, score));
    }

    // Agent-specific analysis methods (simplified for demo)
    async getArchitectAnalysis(analysis) {
        return {
            score: analysis.architecture.confidence * 100,
            recommendations: ['Adopt clear architectural patterns', 'Document design decisions']
        };
    }

    async getSecurityAnalysis(analysis) {
        return {
            score: this.calculateSecurityScore(analysis),
            recommendations: ['Add authentication', 'Implement encryption', 'Security audit']
        };
    }

    async getPerformanceAnalysis(analysis) {
        return {
            score: this.calculatePerformanceScore(analysis),
            recommendations: ['Add caching', 'Optimize async patterns', 'Performance monitoring']
        };
    }

    async getComplianceAnalysis(analysis) {
        return {
            score: analysis.patterns.testing ? analysis.patterns.testing.confidence * 100 : 20,
            recommendations: ['Add comprehensive tests', 'Improve documentation', 'Code standards']
        };
    }

    async getRedTeamAnalysis(analysis) {
        return {
            score: 100 - analysis.risks.length * 10,
            recommendations: ['Address security risks', 'Implement monitoring', 'Regular audits']
        };
    }

    // Placeholder methods for more complex analysis
    async analyzeContentPatterns(projectPath, indicators) {
        return 0.1; // Simplified
    }

    async assessCoupling(analysis) {
        return 'medium'; // Simplified
    }

    assessCohesion(analysis) {
        return 'medium'; // Simplified
    }

    assessScalability(analysis) {
        return 'medium'; // Simplified
    }

    assessMaintainability(analysis) {
        return 'medium'; // Simplified
    }

    assessTestability(analysis) {
        return 'medium'; // Simplified
    }

    categorizeDependencies(dependencies) {
        return {}; // Simplified
    }

    assessDependencyRisks(dependencies) {
        return 'low'; // Simplified
    }

    async estimateBundleSize(dependencies) {
        return 'unknown'; // Simplified
    }
}

module.exports = { ProjectAnalyzer };