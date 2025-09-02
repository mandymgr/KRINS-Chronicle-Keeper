#!/usr/bin/env bun
/**
 * Explain-this-Change AI Tool
 * Analyzes PR diffs and provides intelligent explanations using AI
 * 
 * Usage:
 * - node explain-pr.js --pr=123 --repo=owner/repo
 * - node explain-pr.js --diff-file=changes.diff
 * - GitHub webhook: POST /webhook/pr-explained
 */

const { Octokit } = require('@octokit/rest');
const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config();

class PRExplainer {
  constructor() {
    this.github = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.patternsDir = path.join(__dirname, '..', 'docs', 'patterns');
    this.adrsDir = path.join(__dirname, '..', 'docs', 'adr');
  }

  async loadPatterns() {
    try {
      const patternFiles = await fs.readdir(this.patternsDir);
      const patterns = [];

      for (const file of patternFiles.filter(f => f.endsWith('.md'))) {
        const content = await fs.readFile(path.join(this.patternsDir, file), 'utf8');
        patterns.push({
          name: file.replace('.md', ''),
          content: content.substring(0, 2000) // Limit for context
        });
      }

      return patterns;
    } catch (error) {
      console.error('Error loading patterns:', error);
      return [];
    }
  }

  async loadRecentADRs(limit = 5) {
    try {
      const adrFiles = await fs.readdir(this.adrsDir);
      const adrs = [];

      const adrFilesSorted = adrFiles
        .filter(f => f.startsWith('ADR-') && f.endsWith('.md'))
        .sort()
        .slice(-limit);

      for (const file of adrFilesSorted) {
        const content = await fs.readFile(path.join(this.adrsDir, file), 'utf8');
        adrs.push({
          name: file.replace('.md', ''),
          content: content.substring(0, 1500) // Limit for context
        });
      }

      return adrs;
    } catch (error) {
      console.error('Error loading ADRs:', error);
      return [];
    }
  }

  async getPRInfo(owner, repo, prNumber) {
    try {
      // Get PR details
      const { data: pr } = await this.github.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

      // Get PR files and changes
      const { data: files } = await this.github.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
      });

      // Get commits for additional context
      const { data: commits } = await this.github.pulls.listCommits({
        owner,
        repo,
        pull_number: prNumber,
      });

      return {
        pr: {
          title: pr.title,
          body: pr.body || '',
          author: pr.user.login,
          created_at: pr.created_at,
          additions: pr.additions,
          deletions: pr.deletions,
          changed_files: pr.changed_files,
        },
        files: files.map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch || '',
        })),
        commits: commits.map(commit => ({
          message: commit.commit.message,
          author: commit.commit.author.name,
          sha: commit.sha.substring(0, 7),
        })),
      };
    } catch (error) {
      throw new Error(`Failed to fetch PR info: ${error.message}`);
    }
  }

  analyzeFileChanges(files) {
    const analysis = {
      fileTypes: {},
      directories: {},
      changeTypes: {
        added: 0,
        modified: 0,
        deleted: 0,
        renamed: 0,
      },
      suspiciousPatterns: [],
      complexity: 'low',
    };

    let totalChanges = 0;

    files.forEach(file => {
      // Count change types
      analysis.changeTypes[file.status] = (analysis.changeTypes[file.status] || 0) + 1;
      totalChanges += file.changes;

      // Analyze file types
      const ext = path.extname(file.filename) || 'no-extension';
      analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1;

      // Analyze directories
      const dir = path.dirname(file.filename);
      analysis.directories[dir] = (analysis.directories[dir] || 0) + 1;

      // Check for suspicious patterns
      if (file.filename.includes('config') || file.filename.includes('env')) {
        analysis.suspiciousPatterns.push(`Configuration file modified: ${file.filename}`);
      }

      if (file.filename.includes('security') || file.filename.includes('auth')) {
        analysis.suspiciousPatterns.push(`Security-related file modified: ${file.filename}`);
      }

      if (file.patch && file.patch.includes('password') || file.patch.includes('secret')) {
        analysis.suspiciousPatterns.push(`Potential secret in: ${file.filename}`);
      }
    });

    // Determine complexity
    if (totalChanges > 500 || files.length > 15) {
      analysis.complexity = 'high';
    } else if (totalChanges > 100 || files.length > 5) {
      analysis.complexity = 'medium';
    }

    return analysis;
  }

  async generateExplanation(prData, patterns, adrs) {
    const fileAnalysis = this.analyzeFileChanges(prData.files);
    
    // Create patches summary (limited for token efficiency)
    const patchesSummary = prData.files
      .slice(0, 10) // Limit to 10 files
      .map(file => `${file.filename}: ${file.additions}+/${file.deletions}- (${file.status})`)
      .join('\n');

    // Prepare context for AI
    const prompt = `
As an expert software engineer, explain this GitHub Pull Request in detail. Provide a comprehensive analysis including:

1. **What Changed** (concise summary)
2. **Why** (inferred purpose and reasoning)
3. **Risk Assessment** (security, performance, breaking changes)
4. **Architecture Impact** (how this affects the system)
5. **Pattern Usage** (which patterns from our library are used/should be used)
6. **Recommendations** (improvements, concerns, next steps)

## PR Information:
**Title:** ${prData.pr.title}
**Author:** ${prData.pr.author}
**Description:** ${prData.pr.body}
**Changes:** ${prData.pr.additions} additions, ${prData.pr.deletions} deletions, ${prData.pr.changed_files} files

## Files Changed:
${patchesSummary}

## Commit Messages:
${prData.commits.map(c => `${c.sha}: ${c.message}`).join('\n')}

## Code Changes Analysis:
- **Complexity:** ${fileAnalysis.complexity}
- **File Types:** ${Object.entries(fileAnalysis.fileTypes).map(([ext, count]) => `${ext}(${count})`).join(', ')}
- **Directories:** ${Object.keys(fileAnalysis.directories).join(', ')}
${fileAnalysis.suspiciousPatterns.length > 0 ? `- **Security Flags:** ${fileAnalysis.suspiciousPatterns.join(', ')}` : ''}

## Available Patterns (for reference):
${patterns.map(p => `- **${p.name}**: ${p.content.substring(0, 200)}...`).join('\n')}

## Recent ADRs (for context):
${adrs.map(a => `- **${a.name}**: ${a.content.substring(0, 200)}...`).join('\n')}

Provide your analysis in a clear, structured format that would be helpful for code reviewers and team members to understand the impact and implications of these changes.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software architect and code reviewer. Provide detailed, actionable analysis of code changes with focus on architecture, security, and best practices.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error(`AI explanation failed: ${error.message}`);
    }
  }

  async explainPR(owner, repo, prNumber) {
    try {
      console.log(`🔍 Analyzing PR #${prNumber} in ${owner}/${repo}...`);

      // Load context
      const [prData, patterns, adrs] = await Promise.all([
        this.getPRInfo(owner, repo, prNumber),
        this.loadPatterns(),
        this.loadRecentADRs(),
      ]);

      console.log(`📊 Found ${prData.files.length} files changed, ${patterns.length} patterns, ${adrs.length} ADRs`);

      // Generate AI explanation
      const explanation = await this.generateExplanation(prData, patterns, adrs);

      return {
        pr: prData.pr,
        analysis: {
          files_changed: prData.files.length,
          total_additions: prData.pr.additions,
          total_deletions: prData.pr.deletions,
          complexity: this.analyzeFileChanges(prData.files).complexity,
          patterns_available: patterns.length,
          recent_adrs: adrs.length,
        },
        explanation,
        metadata: {
          analyzed_at: new Date().toISOString(),
          ai_model: 'gpt-4',
          patterns_used: patterns.map(p => p.name),
        },
      };
    } catch (error) {
      console.error('❌ Error explaining PR:', error);
      throw error;
    }
  }

  async commentOnPR(owner, repo, prNumber, explanation) {
    try {
      const comment = `## 🤖 AI Code Analysis

${explanation}

---
*Generated by Dev Memory OS Explain-this-Change AI*
*Patterns considered: ${explanation.includes('Pattern') ? 'Yes' : 'No'} | ADRs referenced: ${explanation.includes('ADR') ? 'Yes' : 'No'}*`;

      await this.github.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: comment,
      });

      console.log(`✅ Posted AI explanation comment on PR #${prNumber}`);
    } catch (error) {
      console.error('❌ Failed to post comment:', error);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach(arg => {
    const [key, value] = arg.split('=');
    options[key.replace('--', '')] = value;
  });

  if (!options.pr || !options.repo) {
    console.error('Usage: node explain-pr.js --pr=123 --repo=owner/repo [--comment]');
    process.exit(1);
  }

  const [owner, repo] = options.repo.split('/');
  const prNumber = parseInt(options.pr);

  const explainer = new PRExplainer();

  try {
    const result = await explainer.explainPR(owner, repo, prNumber);
    
    console.log('\n📋 PR Analysis Complete!\n');
    console.log('=' * 80);
    console.log(result.explanation);
    console.log('=' * 80);
    console.log('\n📈 Analysis Summary:');
    console.log(`- Files changed: ${result.analysis.files_changed}`);
    console.log(`- Complexity: ${result.analysis.complexity}`);
    console.log(`- Patterns considered: ${result.analysis.patterns_available}`);
    console.log(`- Recent ADRs: ${result.analysis.recent_adrs}`);

    // Optionally post as PR comment
    if (options.comment === 'true') {
      await explainer.commentOnPR(owner, repo, prNumber, result.explanation);
    }

    // Save results
    if (options.output) {
      await fs.writeFile(options.output, JSON.stringify(result, null, 2));
      console.log(`💾 Results saved to ${options.output}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = PRExplainer;

// Run CLI if called directly
if (require.main === module) {
  main();
}