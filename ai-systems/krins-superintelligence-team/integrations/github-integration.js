const { Octokit } = require('@octokit/rest');
const crypto = require('crypto');
const express = require('express');

class GitHubIntegration {
    constructor(config = {}) {
        this.config = {
            webhookSecret: config.webhookSecret || process.env.GITHUB_WEBHOOK_SECRET,
            appId: config.appId || process.env.GITHUB_APP_ID,
            privateKey: config.privateKey || process.env.GITHUB_PRIVATE_KEY,
            installationId: config.installationId || process.env.GITHUB_INSTALLATION_ID,
            ...config
        };
        
        this.octokit = new Octokit({
            auth: this.config.token || process.env.GITHUB_TOKEN
        });
        
        this.agentReviewers = {
            architect: {
                focus: ['architecture', 'design-patterns', 'system-structure'],
                threshold: 0.7
            },
            security: {
                focus: ['security', 'vulnerabilities', 'auth', 'data-protection'],
                threshold: 0.9
            },
            performance: {
                focus: ['optimization', 'performance', 'scalability', 'memory'],
                threshold: 0.8
            },
            redteam: {
                focus: ['edge-cases', 'error-handling', 'boundary-testing'],
                threshold: 0.8
            },
            compliance: {
                focus: ['compliance', 'standards', 'documentation', 'best-practices'],
                threshold: 0.6
            }
        };
    }

    setupWebhooks(app) {
        app.post('/webhooks/github', express.raw({ type: 'application/json' }), 
            this.handleWebhook.bind(this));
        
        console.log('🔗 GitHub webhook endpoint configured at /webhooks/github');
    }

    async handleWebhook(req, res) {
        const signature = req.headers['x-hub-signature-256'];
        const payload = req.body;
        
        if (!this.verifyWebhookSignature(signature, payload)) {
            console.warn('⚠️ Invalid webhook signature');
            return res.status(401).send('Unauthorized');
        }

        const event = JSON.parse(payload.toString());
        const eventType = req.headers['x-github-event'];

        console.log(`📋 GitHub ${eventType} event received`);

        try {
            switch (eventType) {
                case 'pull_request':
                    await this.handlePullRequest(event);
                    break;
                case 'push':
                    await this.handlePush(event);
                    break;
                case 'issues':
                    await this.handleIssue(event);
                    break;
                case 'create':
                    if (event.ref_type === 'branch') {
                        await this.handleNewBranch(event);
                    }
                    break;
                default:
                    console.log(`📝 Unhandled event type: ${eventType}`);
            }
            
            res.status(200).send('OK');
        } catch (error) {
            console.error('❌ Webhook handling error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    verifyWebhookSignature(signature, payload) {
        if (!this.config.webhookSecret) return true; // Skip verification in dev
        
        const expectedSignature = 'sha256=' + crypto
            .createHmac('sha256', this.config.webhookSecret)
            .update(payload)
            .digest('hex');
            
        return crypto.timingSafeEqual(
            Buffer.from(signature || '', 'utf8'),
            Buffer.from(expectedSignature, 'utf8')
        );
    }

    async handlePullRequest(event) {
        if (event.action !== 'opened' && event.action !== 'synchronize') {
            return;
        }

        const { pull_request: pr, repository: repo } = event;
        
        console.log(`🔍 Analyzing PR #${pr.number}: ${pr.title}`);

        // Get PR files and diff
        const files = await this.getPRFiles(repo.owner.login, repo.name, pr.number);
        const diff = await this.getPRDiff(repo.owner.login, repo.name, pr.number);

        // Analyze with multiple agents
        const reviews = await this.conductMultiAgentReview({
            pr,
            repo,
            files,
            diff
        });

        // Post consolidated review
        await this.postConsolidatedReview(repo.owner.login, repo.name, pr.number, reviews);
    }

    async getPRFiles(owner, repo, prNumber) {
        const { data: files } = await this.octokit.pulls.listFiles({
            owner,
            repo,
            pull_number: prNumber
        });
        
        return files.map(file => ({
            filename: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            patch: file.patch
        }));
    }

    async getPRDiff(owner, repo, prNumber) {
        const { data: diff } = await this.octokit.pulls.get({
            owner,
            repo,
            pull_number: prNumber,
            mediaType: {
                format: 'diff'
            }
        });
        
        return diff;
    }

    async conductMultiAgentReview({ pr, repo, files, diff }) {
        const reviewContext = {
            title: pr.title,
            description: pr.body,
            files,
            diff,
            author: pr.user.login,
            baseBranch: pr.base.ref,
            headBranch: pr.head.ref
        };

        const reviews = {};
        const relevantAgents = this.selectRelevantAgents(files, diff);

        console.log(`🤖 Deploying ${relevantAgents.length} agents for review`);

        for (const agentType of relevantAgents) {
            try {
                reviews[agentType] = await this.getAgentReview(agentType, reviewContext);
                console.log(`✅ ${agentType} agent completed review`);
            } catch (error) {
                console.error(`❌ ${agentType} agent review failed:`, error);
                reviews[agentType] = {
                    approved: false,
                    comments: [`Review failed: ${error.message}`],
                    suggestions: []
                };
            }
        }

        return reviews;
    }

    selectRelevantAgents(files, diff) {
        const selectedAgents = new Set(['architect']); // Always include architect
        
        // Security checks
        if (this.containsSecurityRelevantChanges(files, diff)) {
            selectedAgents.add('security');
        }

        // Performance checks
        if (this.containsPerformanceRelevantChanges(files, diff)) {
            selectedAgents.add('performance');
        }

        // Compliance checks
        if (this.requiresComplianceReview(files, diff)) {
            selectedAgents.add('compliance');
        }

        // Red team for critical paths
        if (this.affectsCriticalPaths(files)) {
            selectedAgents.add('redteam');
        }

        return Array.from(selectedAgents);
    }

    containsSecurityRelevantChanges(files, diff) {
        const securityKeywords = [
            'auth', 'password', 'token', 'secret', 'key', 'crypto',
            'hash', 'encrypt', 'decrypt', 'security', 'vulnerability',
            'cors', 'csrf', 'xss', 'sql', 'injection'
        ];

        const diffLower = diff.toLowerCase();
        return securityKeywords.some(keyword => 
            diffLower.includes(keyword) || 
            files.some(file => file.filename.toLowerCase().includes(keyword))
        );
    }

    containsPerformanceRelevantChanges(files, diff) {
        const performancePatterns = [
            /\bloop\b/gi, /\bquery\b/gi, /\bdatabase\b/gi, /\bcache\b/gi,
            /\basync\b/gi, /\bpromise\b/gi, /\bsetTimeout\b/gi,
            /\bmemory\b/gi, /\boptimiz/gi, /\bperformance\b/gi
        ];

        return performancePatterns.some(pattern => 
            pattern.test(diff) || 
            files.some(file => pattern.test(file.filename))
        );
    }

    requiresComplianceReview(files, diff) {
        const complianceFiles = [
            /package\.json$/i, /dockerfile$/i, /\.env/i, /config/i,
            /\.md$/i, /license/i, /readme/i, /changelog/i
        ];

        return complianceFiles.some(pattern =>
            files.some(file => pattern.test(file.filename))
        );
    }

    affectsCriticalPaths(files) {
        const criticalPaths = [
            /\/auth/i, /\/security/i, /\/payment/i, /\/billing/i,
            /\/admin/i, /\/api/i, /\/server/i, /\/database/i
        ];

        return criticalPaths.some(pattern =>
            files.some(file => pattern.test(file.filename))
        );
    }

    async getAgentReview(agentType, context) {
        // This would integrate with your agent system
        // For now, return a simulated review
        const agent = this.agentReviewers[agentType];
        
        return {
            agent: agentType,
            approved: Math.random() > (1 - agent.threshold),
            confidence: Math.random(),
            comments: [
                `${agentType} agent analysis completed`,
                `Focused on: ${agent.focus.join(', ')}`
            ],
            suggestions: [
                `Consider ${agent.focus[0]} implications`,
                `Review ${agent.focus[1]} patterns`
            ],
            blockers: Math.random() > 0.8 ? [`Critical ${agentType} issue detected`] : []
        };
    }

    async postConsolidatedReview(owner, repo, prNumber, reviews) {
        const allApproved = Object.values(reviews).every(review => review.approved);
        const hasBlockers = Object.values(reviews).some(review => 
            review.blockers && review.blockers.length > 0
        );

        const reviewBody = this.formatConsolidatedReview(reviews, allApproved, hasBlockers);

        await this.octokit.pulls.createReview({
            owner,
            repo,
            pull_number: prNumber,
            event: hasBlockers ? 'REQUEST_CHANGES' : 
                   allApproved ? 'APPROVE' : 'COMMENT',
            body: reviewBody
        });

        console.log(`📝 Posted ${hasBlockers ? 'blocking' : allApproved ? 'approving' : 'commenting'} review`);
    }

    formatConsolidatedReview(reviews, allApproved, hasBlockers) {
        const agentCount = Object.keys(reviews).length;
        const approvedCount = Object.values(reviews).filter(r => r.approved).length;

        let body = `## 🤖 Krins Superintelligence Multi-Agent Review\n\n`;
        body += `**Agent Analysis**: ${approvedCount}/${agentCount} agents approve\n\n`;

        if (hasBlockers) {
            body += `### ⛔ Blocking Issues\n`;
            Object.entries(reviews).forEach(([agent, review]) => {
                if (review.blockers && review.blockers.length > 0) {
                    body += `- **${agent.toUpperCase()}**: ${review.blockers.join(', ')}\n`;
                }
            });
            body += `\n`;
        }

        body += `### 📋 Agent Reports\n\n`;
        Object.entries(reviews).forEach(([agent, review]) => {
            const status = review.approved ? '✅' : '❌';
            const confidence = Math.round(review.confidence * 100);
            
            body += `#### ${status} ${agent.toUpperCase()} Agent (${confidence}% confidence)\n`;
            if (review.comments.length > 0) {
                body += `**Comments:**\n`;
                review.comments.forEach(comment => body += `- ${comment}\n`);
            }
            if (review.suggestions.length > 0) {
                body += `**Suggestions:**\n`;
                review.suggestions.forEach(suggestion => body += `- ${suggestion}\n`);
            }
            body += `\n`;
        });

        body += `---\n*Generated by Krins Superintelligence v2.0 • 🇳🇴 Nordic AI Excellence*`;

        return body;
    }

    async handlePush(event) {
        if (event.ref === 'refs/heads/main' || event.ref === 'refs/heads/master') {
            console.log('📦 Main branch push detected - triggering deployment analysis');
            // Could trigger deployment readiness checks
        }
    }

    async handleIssue(event) {
        if (event.action === 'opened') {
            console.log(`📋 New issue #${event.issue.number}: ${event.issue.title}`);
            // Could auto-assign based on content analysis
        }
    }

    async handleNewBranch(event) {
        console.log(`🌿 New branch created: ${event.ref}`);
        // Could set up branch-specific configurations
    }

    async createDeploymentStatus(owner, repo, sha, state, description) {
        await this.octokit.repos.createDeploymentStatus({
            owner,
            repo,
            deployment_id: sha,
            state,
            description,
            environment: 'production'
        });
    }

    async getRepositoryMetrics(owner, repo) {
        const [repoData, languages, contributors] = await Promise.all([
            this.octokit.repos.get({ owner, repo }),
            this.octokit.repos.listLanguages({ owner, repo }),
            this.octokit.repos.listContributors({ owner, repo })
        ]);

        return {
            stars: repoData.data.stargazers_count,
            forks: repoData.data.forks_count,
            languages: languages.data,
            contributors: contributors.data.length,
            lastPush: repoData.data.pushed_at,
            defaultBranch: repoData.data.default_branch
        };
    }
}

module.exports = { GitHubIntegration };