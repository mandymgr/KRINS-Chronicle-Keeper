/**
 * 🤖 KRINS Intelligent Communication Hub
 * 
 * Advanced Slack/Teams integration for organizational intelligence:
 * - Smart ADR generation from conversations
 * - Decision tracking and notifications
 * - AI-powered insights delivery
 * - Team collaboration orchestration
 * - Evidence collection automation
 * 
 * @author KRINS Intelligence System
 */

import { App as SlackApp } from '@slack/bolt'
import { Client as TeamsClient } from '@microsoft/microsoft-graph-client'
import { EventEmitter } from 'events'
import fs from 'fs-extra'
import path from 'path'
import { config } from 'dotenv'

// Load environment variables
config()

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  skills: string[]
  timezone: string
}

interface Decision {
  id: string
  title: string
  component: string
  status: 'draft' | 'proposed' | 'accepted' | 'rejected' | 'superseded'
  context: string
  problem: string
  alternatives: string[]
  rationale?: string
  author: string
  stakeholders: string[]
  created_at: Date
  updated_at: Date
  slack_thread?: string
  teams_thread?: string
  evidence: Evidence[]
}

interface Evidence {
  id: string
  type: 'metric' | 'feedback' | 'analysis' | 'outcome'
  title: string
  description: string
  data?: any
  source: string
  timestamp: Date
  author: string
}

interface AIInsight {
  id: string
  type: 'recommendation' | 'warning' | 'opportunity' | 'analysis'
  title: string
  content: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  target_audience: string[]
  decision_id?: string
  expires_at?: Date
  created_at: Date
}

interface NotificationPreferences {
  userId: string
  channels: ('slack' | 'teams' | 'email')[]
  decision_updates: boolean
  ai_insights: boolean
  evidence_reminders: boolean
  team_mentions: boolean
  priority_filter: ('low' | 'medium' | 'high' | 'critical')[]
}

/**
 * KRINS Intelligent Communication Hub
 */
export class KRINSCommunicationHub extends EventEmitter {
  private slackApp?: SlackApp
  private teamsClient?: TeamsClient
  private teamMembers = new Map<string, TeamMember>()
  private decisions = new Map<string, Decision>()
  private insights = new Map<string, AIInsight>()
  private notifications = new Map<string, NotificationPreferences>()
  private isSlackEnabled = false
  private isTeamsEnabled = false
  private adrDirectory: string

  constructor() {
    super()
    this.adrDirectory = path.join(process.cwd(), 'docs', 'adr')
    this.initialize()
  }

  private async initialize() {
    console.log('🤖 Initializing KRINS Communication Hub...')

    // Initialize Slack if configured
    if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET) {
      this.setupSlackIntegration()
    }

    // Initialize Teams if configured
    if (process.env.TEAMS_CLIENT_ID && process.env.TEAMS_CLIENT_SECRET) {
      this.setupTeamsIntegration()
    }

    // Load team data
    await this.loadTeamData()

    console.log(`✅ Communication Hub initialized with Slack: ${this.isSlackEnabled}, Teams: ${this.isTeamsEnabled}`)
  }

  /**
   * Setup Slack Integration
   */
  private setupSlackIntegration() {
    try {
      this.slackApp = new SlackApp({
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        socketMode: false,
        appToken: process.env.SLACK_APP_TOKEN
      })

      this.setupSlackCommands()
      this.setupSlackEvents()
      
      this.isSlackEnabled = true
      console.log('✅ Slack integration enabled')
    } catch (error) {
      console.error('❌ Failed to initialize Slack:', error)
    }
  }

  /**
   * Setup Slack Commands
   */
  private setupSlackCommands() {
    if (!this.slackApp) return

    // Smart ADR generation from thread context
    this.slackApp.command('/krins-adr', async ({ command, ack, respond, client }) => {
      await ack()

      try {
        const args = command.text.trim()
        if (!args) {
          await respond(this.getADRHelpMessage())
          return
        }

        const [title, component = 'general'] = args.split('|').map(s => s.trim())

        // Get thread context
        const threadMessages = await this.getSlackThreadContext(client, command.channel_id, command.ts)
        
        // Analyze context with AI
        const analysis = await this.analyzeConversationContext(threadMessages)
        
        // Generate intelligent ADR
        const decision = await this.generateSmartADR({
          title,
          component,
          context: analysis.context,
          problem: analysis.problem,
          alternatives: analysis.alternatives,
          author: command.user_name,
          slackThread: `https://slack.com/archives/${command.channel_id}/p${command.ts}`,
          threadMessages
        })

        // Create ADR file
        const adrFile = await this.createADRFile(decision)

        await respond({
          text: `✅ Intelligent ADR created: \`${adrFile.filename}\``,
          blocks: this.createADRSuccessMessage(decision, adrFile)
        })

        // Send notifications to stakeholders
        await this.notifyStakeholders(decision, 'created')

      } catch (error) {
        console.error('ADR generation error:', error)
        await respond({
          text: `❌ Failed to generate ADR: ${error.message}`
        })
      }
    })

    // AI insights request
    this.slackApp.command('/krins-insights', async ({ command, ack, respond }) => {
      await ack()

      try {
        const query = command.text.trim()
        const insights = await this.generateAIInsights({
          query,
          context: 'slack',
          user: command.user_name,
          channel: command.channel_id
        })

        const blocks = insights.map(insight => this.createInsightBlock(insight))

        await respond({
          text: `🧠 AI Insights for: "${query}"`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*🧠 KRINS AI Insights*\n\n_Query: "${query}"_`
              }
            },
            ...blocks
          ]
        })

      } catch (error) {
        console.error('Insights generation error:', error)
        await respond({
          text: `❌ Failed to generate insights: ${error.message}`
        })
      }
    })

    // Decision status tracking
    this.slackApp.command('/krins-decisions', async ({ command, ack, respond }) => {
      await ack()

      try {
        const filter = command.text.trim().toLowerCase()
        const decisions = Array.from(this.decisions.values())
          .filter(d => !filter || d.status === filter || d.component.includes(filter))
          .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
          .slice(0, 10)

        if (decisions.length === 0) {
          await respond({
            text: `📋 No decisions found${filter ? ` matching "${filter}"` : ''}`
          })
          return
        }

        const blocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*📋 Recent Decisions${filter ? ` (${filter})` : ''}*`
            }
          },
          ...decisions.map(d => this.createDecisionBlock(d))
        ]

        await respond({
          text: `📋 Found ${decisions.length} decisions`,
          blocks
        })

      } catch (error) {
        console.error('Decision listing error:', error)
        await respond({
          text: `❌ Failed to list decisions: ${error.message}`
        })
      }
    })

    // Evidence collection
    this.slackApp.command('/krins-evidence', async ({ command, ack, respond }) => {
      await ack()

      try {
        const args = command.text.split('|').map(s => s.trim())
        if (args.length < 3) {
          await respond({
            text: 'Usage: `/krins-evidence decision-id | evidence-type | description`\nTypes: metric, feedback, analysis, outcome'
          })
          return
        }

        const [decisionId, evidenceType, description] = args
        const decision = this.decisions.get(decisionId)

        if (!decision) {
          await respond({
            text: `❌ Decision "${decisionId}" not found`
          })
          return
        }

        const evidence: Evidence = {
          id: `evidence_${Date.now()}`,
          type: evidenceType as any,
          title: `Evidence from ${command.user_name}`,
          description,
          source: 'slack',
          timestamp: new Date(),
          author: command.user_name
        }

        decision.evidence.push(evidence)
        decision.updated_at = new Date()

        await respond({
          text: `✅ Evidence added to "${decision.title}"`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Evidence Added*\n\n` +
                      `**Decision:** ${decision.title}\n` +
                      `**Type:** ${evidenceType}\n` +
                      `**Description:** ${description}\n` +
                      `**Total Evidence:** ${decision.evidence.length} items`
              }
            }
          ]
        })

        // Notify team about evidence collection
        await this.notifyStakeholders(decision, 'evidence_added')

      } catch (error) {
        console.error('Evidence collection error:', error)
        await respond({
          text: `❌ Failed to collect evidence: ${error.message}`
        })
      }
    })

    // Team intelligence dashboard
    this.slackApp.command('/krins-dashboard', async ({ command, ack, respond }) => {
      await ack()

      try {
        const stats = this.getTeamStats()
        
        await respond({
          text: '📊 KRINS Organizational Intelligence Dashboard',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🧠 KRINS Organizational Intelligence'
              }
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*📋 Total Decisions*\n${stats.totalDecisions}`
                },
                {
                  type: 'mrkdwn',
                  text: `*✅ Accepted*\n${stats.acceptedDecisions}`
                },
                {
                  type: 'mrkdwn',
                  text: `*🔄 Active*\n${stats.activeDecisions}`
                },
                {
                  type: 'mrkdwn',
                  text: `*🧠 AI Insights*\n${stats.totalInsights}`
                }
              ]
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*📈 Recent Activity*\n${stats.recentActivity.join('\n')}`
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '📋 View All Decisions'
                  },
                  action_id: 'view_decisions',
                  url: `${process.env.FRONTEND_URL}/decisions`
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '🧠 AI Insights'
                  },
                  action_id: 'view_insights',
                  url: `${process.env.FRONTEND_URL}/intelligence`
                }
              ]
            }
          ]
        })

      } catch (error) {
        console.error('Dashboard error:', error)
        await respond({
          text: `❌ Failed to load dashboard: ${error.message}`
        })
      }
    })
  }

  /**
   * Setup Slack Events
   */
  private setupSlackEvents() {
    if (!this.slackApp) return

    // Monitor decision-related conversations
    this.slackApp.event('message', async ({ event, client }) => {
      if (event.subtype || event.bot_id) return

      const text = event.text?.toLowerCase() || ''
      
      // Detect decision-related discussions
      const decisionKeywords = ['decide', 'decision', 'should we', 'what if we', 'proposal', 'adr']
      const hasDecisionContext = decisionKeywords.some(keyword => text.includes(keyword))

      if (hasDecisionContext && text.length > 50) {
        try {
          // Get channel info
          const channelInfo = await client.conversations.info({ channel: event.channel })
          const channelName = channelInfo.channel?.name || 'unknown'

          // Send proactive suggestion
          await client.chat.postMessage({
            channel: event.channel,
            thread_ts: event.ts,
            text: '🤖 I detected a decision discussion! Consider creating an ADR with `/krins-adr "Decision Title | Component"`',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: '*🧠 KRINS Intelligence Suggestion*\n\nI detected a decision-related discussion. Consider documenting this as an Architecture Decision Record (ADR) to capture the context and rationale.'
                }
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: '📋 Create ADR'
                    },
                    action_id: 'create_adr',
                    style: 'primary'
                  },
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: 'ℹ️ ADR Help'
                    },
                    action_id: 'adr_help'
                  }
                ]
              }
            ]
          })

          // Emit event for analytics
          this.emit('decision_discussion_detected', {
            channel: channelName,
            user: event.user,
            text: event.text,
            timestamp: new Date()
          })

        } catch (error) {
          console.error('Decision detection error:', error)
        }
      }
    })

    // Handle button interactions
    this.slackApp.action('create_adr', async ({ ack, respond }) => {
      await ack()
      await respond(this.getADRHelpMessage())
    })

    this.slackApp.action('adr_help', async ({ ack, respond }) => {
      await ack()
      await respond(this.getADRHelpMessage())
    })
  }

  /**
   * Setup Teams Integration (placeholder for now)
   */
  private setupTeamsIntegration() {
    try {
      // This would initialize Microsoft Graph client
      // For now, we'll mark as enabled but not implement full Teams integration
      this.isTeamsEnabled = true
      console.log('✅ Teams integration prepared (placeholder)')
    } catch (error) {
      console.error('❌ Failed to initialize Teams:', error)
    }
  }

  /**
   * Get Slack thread context
   */
  private async getSlackThreadContext(client: any, channelId: string, ts?: string): Promise<any[]> {
    try {
      const history = await client.conversations.history({
        channel: channelId,
        limit: 20
      })
      return history.messages.slice(0, 10)
    } catch (error) {
      console.error('Failed to get thread context:', error)
      return []
    }
  }

  /**
   * Analyze conversation context with AI
   */
  private async analyzeConversationContext(messages: any[]): Promise<{
    context: string
    problem: string
    alternatives: string[]
  }> {
    // Mock AI analysis - in real implementation, this would use OpenAI or similar
    const allText = messages.map(m => m.text || '').join(' ').toLowerCase()
    
    // Extract problem
    const problemKeywords = ['problem', 'issue', 'challenge', 'need to', 'how do we']
    const problemMessage = messages.find(m => 
      problemKeywords.some(keyword => (m.text || '').toLowerCase().includes(keyword))
    )
    
    const problem = problemMessage?.text?.substring(0, 200) + '...' || 
                   'Problem context extracted from Slack discussion'

    // Extract alternatives
    const alternativeKeywords = ['option', 'alternative', 'could', 'what if', 'maybe', 'or we could']
    const alternatives = messages
      .filter(m => alternativeKeywords.some(keyword => 
        (m.text || '').toLowerCase().includes(keyword)
      ))
      .map(m => m.text?.substring(0, 100) + '...')
      .slice(0, 3)

    if (alternatives.length === 0) {
      alternatives.push('Option A - (extracted from discussion)')
      alternatives.push('Option B - (extracted from discussion)')
    }

    // Determine context
    const contextClues = {
      'frontend': ['react', 'vue', 'ui', 'component', 'css'],
      'backend': ['api', 'server', 'database', 'endpoint'],
      'infrastructure': ['deploy', 'ci', 'cd', 'docker', 'kubernetes'],
      'security': ['auth', 'security', 'permission', 'access'],
      'performance': ['slow', 'performance', 'optimization', 'speed']
    }

    let context = 'general'
    for (const [ctx, keywords] of Object.entries(contextClues)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        context = ctx
        break
      }
    }

    return { context, problem, alternatives }
  }

  /**
   * Generate smart ADR from context
   */
  private async generateSmartADR(params: {
    title: string
    component: string
    context: string
    problem: string
    alternatives: string[]
    author: string
    slackThread?: string
    threadMessages: any[]
  }): Promise<Decision> {
    const decision: Decision = {
      id: `adr_${Date.now()}`,
      title: params.title,
      component: params.component,
      status: 'draft',
      context: params.context,
      problem: params.problem,
      alternatives: params.alternatives,
      author: params.author,
      stakeholders: this.extractStakeholders(params.threadMessages),
      created_at: new Date(),
      updated_at: new Date(),
      slack_thread: params.slackThread,
      evidence: []
    }

    // Store decision
    this.decisions.set(decision.id, decision)

    // Emit event
    this.emit('decision_created', decision)

    return decision
  }

  /**
   * Extract stakeholders from messages
   */
  private extractStakeholders(messages: any[]): string[] {
    const users = new Set<string>()
    messages.forEach(msg => {
      if (msg.user && !msg.bot_id) {
        users.add(msg.user)
      }
    })
    return Array.from(users)
  }

  /**
   * Create ADR file
   */
  private async createADRFile(decision: Decision): Promise<{ filename: string; filepath: string; content: string }> {
    await fs.ensureDir(this.adrDirectory)
    
    const adrNumber = await this.getNextADRNumber()
    const slug = this.slugify(decision.title)
    const filename = `ADR-${adrNumber}-${slug}.md`
    const filepath = path.join(this.adrDirectory, filename)

    const content = this.generateADRContent(decision, adrNumber)
    
    await fs.writeFile(filepath, content)
    
    return { filename, filepath, content }
  }

  /**
   * Generate ADR content
   */
  private generateADRContent(decision: Decision, adrNumber: string): string {
    const date = new Date().toISOString().split('T')[0]
    
    return `# ADR-${adrNumber}: ${decision.title}

**Date:** ${date}  •  **Component:** ${decision.component}  •  **Owner:** @${decision.author}  •  **Status:** ${decision.status}

## Problem
${decision.problem}

## Context
${decision.context === 'general' ? 'General architectural decision' : `${decision.context} component decision`}

${decision.slack_thread ? `**Slack Discussion:** ${decision.slack_thread}` : ''}

## Alternatives
${decision.alternatives.map((alt, i) => `${i + 1}. ${alt}`).join('\n')}

## Decision
**Selected:** [To be decided]

**Rationale:** [Complete based on discussion context]

**Rollback Plan:** [Define rollback strategy]

## Evidence Collection
**Before Implementation:**
- [ ] Baseline metrics collected
- [ ] Performance benchmarks established
- [ ] User feedback baseline

**After Implementation:**
- [ ] Success metrics validated
- [ ] Performance impact measured
- [ ] User feedback collected

## Stakeholders
${decision.stakeholders.map(s => `- @${s}`).join('\n')}

## Links
- **PR:** #TBD
- **Runbook:** \`docs/runbooks/TBD.md\`
- **Issue:** #TBD
${decision.slack_thread ? `- **Slack Thread:** ${decision.slack_thread}` : ''}

---
*Generated by KRINS Intelligent Communication Hub*
`
  }

  /**
   * Get next ADR number
   */
  private async getNextADRNumber(): Promise<string> {
    try {
      const files = await fs.readdir(this.adrDirectory)
      const adrFiles = files.filter(f => f.startsWith('ADR-') && f.endsWith('.md'))
      
      if (adrFiles.length === 0) return '0001'
      
      const numbers = adrFiles.map(f => {
        const match = f.match(/ADR-(\d+)/)
        return match ? parseInt(match[1]) : 0
      })
      
      return String(Math.max(...numbers) + 1).padStart(4, '0')
    } catch (error) {
      return '0001'
    }
  }

  /**
   * Slugify text
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Generate AI insights
   */
  private async generateAIInsights(params: {
    query: string
    context: string
    user: string
    channel: string
  }): Promise<AIInsight[]> {
    // Mock AI insights - in real implementation, this would use AI services
    const insights: AIInsight[] = [
      {
        id: `insight_${Date.now()}`,
        type: 'analysis',
        title: 'Decision Pattern Analysis',
        content: `Based on recent decisions, I notice a trend towards microservices architecture. Consider standardizing service communication patterns.`,
        confidence: 0.85,
        impact: 'medium',
        target_audience: ['architects', 'developers'],
        created_at: new Date()
      },
      {
        id: `insight_${Date.now() + 1}`,
        type: 'recommendation',
        title: 'Evidence Collection Suggestion',
        content: `${params.query} would benefit from performance metrics collection. Consider setting up monitoring before implementation.`,
        confidence: 0.78,
        impact: 'high',
        target_audience: ['devops', 'platform'],
        created_at: new Date()
      }
    ]

    // Store insights
    insights.forEach(insight => this.insights.set(insight.id, insight))

    return insights
  }

  /**
   * Helper methods for UI messages
   */
  private getADRHelpMessage() {
    return {
      text: '📚 KRINS ADR Bot Help',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🤖 KRINS Intelligent Communication Hub'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Available Commands:*\n\n' +
                  '`/krins-adr "Title | Component"` - Generate intelligent ADR from thread context\n' +
                  '`/krins-insights "query"` - Get AI-powered insights\n' +
                  '`/krins-decisions [filter]` - List recent decisions\n' +
                  '`/krins-evidence "id | type | description"` - Collect evidence\n' +
                  '`/krins-dashboard` - View team intelligence dashboard\n\n' +
                  '*How it works:*\n' +
                  '• AI analyzes conversation context\n' +
                  '• Extracts problems and alternatives automatically\n' +
                  '• Generates intelligent ADR drafts\n' +
                  '• Tracks decisions across their lifecycle\n' +
                  '• Provides proactive insights and recommendations'
          }
        }
      ]
    }
  }

  private createADRSuccessMessage(decision: Decision, adrFile: any) {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*✅ Intelligent ADR Created!*\n\n` +
                `📄 **File:** \`${adrFile.filename}\`\n` +
                `🏗️ **Component:** ${decision.component}\n` +
                `👤 **Owner:** @${decision.author}\n` +
                `🎯 **Status:** ${decision.status}\n` +
                `👥 **Stakeholders:** ${decision.stakeholders.length} identified`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🤖 AI Analysis Results:*\n` +
                `• Problem context extracted from ${decision.stakeholders.length} participants\n` +
                `• ${decision.alternatives.length} alternatives identified\n` +
                `• Context classified as: ${decision.context}\n` +
                `• Evidence collection plan generated`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '📝 Edit ADR'
            },
            url: `${process.env.FRONTEND_URL}/decisions/${decision.id}`,
            style: 'primary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '📊 Add Evidence'
            },
            action_id: 'add_evidence'
          }
        ]
      }
    ]
  }

  private createInsightBlock(insight: AIInsight) {
    const impactEmoji = {
      low: '📘',
      medium: '📙', 
      high: '📕',
      critical: '🚨'
    }

    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${impactEmoji[insight.impact]} **${insight.title}**\n` +
              `${insight.content}\n\n` +
              `*Confidence:* ${(insight.confidence * 100).toFixed(0)}% • ` +
              `*Impact:* ${insight.impact} • ` +
              `*Type:* ${insight.type}`
      }
    }
  }

  private createDecisionBlock(decision: Decision) {
    const statusEmoji = {
      draft: '📝',
      proposed: '🤔',
      accepted: '✅',
      rejected: '❌',
      superseded: '🔄'
    }

    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${statusEmoji[decision.status]} **${decision.title}**\n` +
              `*Component:* ${decision.component} • ` +
              `*Owner:* @${decision.author} • ` +
              `*Evidence:* ${decision.evidence.length} items`
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'View'
        },
        url: `${process.env.FRONTEND_URL}/decisions/${decision.id}`
      }
    }
  }

  /**
   * Load team data from various sources
   */
  private async loadTeamData() {
    // Mock team data - in real implementation, this would load from HR systems, AD, etc.
    const mockTeamMembers: TeamMember[] = [
      {
        id: 'dev1',
        name: 'Alice Developer',
        email: 'alice@company.com',
        role: 'Senior Frontend Developer',
        skills: ['react', 'typescript', 'design-systems'],
        timezone: 'Europe/Oslo'
      },
      {
        id: 'arch1',
        name: 'Bob Architect',
        email: 'bob@company.com',
        role: 'Solution Architect',
        skills: ['architecture', 'microservices', 'kubernetes'],
        timezone: 'Europe/Oslo'
      }
    ]

    mockTeamMembers.forEach(member => {
      this.teamMembers.set(member.id, member)
    })

    console.log(`📊 Loaded ${this.teamMembers.size} team members`)
  }

  /**
   * Get team statistics
   */
  private getTeamStats() {
    const decisions = Array.from(this.decisions.values())
    
    return {
      totalDecisions: decisions.length,
      acceptedDecisions: decisions.filter(d => d.status === 'accepted').length,
      activeDecisions: decisions.filter(d => ['draft', 'proposed'].includes(d.status)).length,
      totalInsights: this.insights.size,
      recentActivity: decisions
        .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
        .slice(0, 5)
        .map(d => `• ${d.title} (${d.status})`)
    }
  }

  /**
   * Notify stakeholders about decision changes
   */
  private async notifyStakeholders(decision: Decision, eventType: 'created' | 'updated' | 'evidence_added') {
    // Implementation for stakeholder notifications
    console.log(`🔔 Notifying stakeholders about ${eventType} for decision: ${decision.title}`)
    
    // Emit event for external systems
    this.emit('stakeholder_notification', {
      decision,
      eventType,
      stakeholders: decision.stakeholders,
      timestamp: new Date()
    })
  }

  /**
   * Public API methods
   */
  
  public async startSlackBot(port = 3000) {
    if (this.slackApp) {
      await this.slackApp.start(port)
      console.log(`🤖 KRINS Communication Hub (Slack) running on port ${port}`)
    }
  }

  public getDecisions(): Decision[] {
    return Array.from(this.decisions.values())
  }

  public getInsights(): AIInsight[] {
    return Array.from(this.insights.values())
  }

  public getTeamMembers(): TeamMember[] {
    return Array.from(this.teamMembers.values())
  }

  public isEnabled(): { slack: boolean; teams: boolean } {
    return {
      slack: this.isSlackEnabled,
      teams: this.isTeamsEnabled
    }
  }

  public async broadcastInsight(insight: AIInsight) {
    // Implementation for broadcasting insights
    this.insights.set(insight.id, insight)
    this.emit('insight_broadcast', insight)
  }
}

export default KRINSCommunicationHub