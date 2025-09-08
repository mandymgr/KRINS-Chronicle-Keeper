#!/usr/bin/env bun
/**
 * Slack ADR Bot - Genererer ADR-utkast fra Slack-tråder for KRINS-Chronicle-Keeper
 * 
 * Usage:
 * - Installer: npm install @slack/bolt dotenv
 * - Sett env vars: SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET
 * - Start: node tools/slack-adr-bot.js
 * 
 * Slash commands:
 * - /adr "Decision title" - Generer ADR-utkast fra tråd-kontekst
 * - /adr-help - Vis hjelp
 */

const { App } = require('@slack/bolt');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

class SlackADRBot {
  constructor() {
    this.app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
    });

    this.setupCommands();
    this.setupEventListeners();
  }

  setupCommands() {
    // Main ADR creation command
    this.app.command('/adr', async ({ command, ack, respond }) => {
      await ack();

      try {
        const title = command.text.trim();
        if (!title) {
          await respond({
            text: "❌ Mangler tittel. Bruk: `/adr \"Decision title\"`",
            response_type: 'ephemeral'
          });
          return;
        }

        // Get thread context
        const threadContext = await this.getThreadContext(command.channel_id, command.user_id);
        
        // Generate ADR draft
        const adrContent = this.generateADRFromContext(title, threadContext, command.user_name);
        
        // Save ADR draft
        const adrFileName = await this.saveADRDraft(title, adrContent);
        
        await respond({
          text: `✅ ADR-utkast opprettet: \`${adrFileName}\`\n\n*Preview:*\n\`\`\`\n${adrContent.substring(0, 500)}...\n\`\`\``,
          response_type: 'in_channel'
        });

      } catch (error) {
        console.error('ADR creation error:', error);
        await respond({
          text: `❌ Feil ved ADR-opprettelse: ${error.message}`,
          response_type: 'ephemeral'
        });
      }
    });

    // Help command
    this.app.command('/adr-help', async ({ ack, respond }) => {
      await ack();

      const helpText = `
📋 *KRINS-Chronicle-Keeper Slack ADR Bot*

*Kommandoer:*
• \`/adr "Decision title"\` - Generer ADR fra tråd-diskusjon
• \`/adr-help\` - Vis denne hjelpeteksten

*Hvordan det fungerer:*
1. Diskuter arkitektur-beslutning i Slack-tråd
2. Bruk \`/adr "Tittel på beslutning"\` i tråden
3. Bot analyserer tråd-innhold og genererer ADR-utkast
4. ADR lagres i \`docs/adr/\` med auto-generert nummer

*Eksempel:*
\`/adr "Bruke PostgreSQL for hoveddatabase"\`

*Miljøvariabler som kreves:*
• \`SLACK_BOT_TOKEN\` - Bot token fra Slack app
• \`SLACK_SIGNING_SECRET\` - Signing secret fra Slack app
`;

      await respond({
        text: helpText,
        response_type: 'ephemeral'
      });
    });
  }

  setupEventListeners() {
    // Listen for mentions in threads where ADR discussions might happen
    this.app.event('app_mention', async ({ event, say }) => {
      const text = event.text.toLowerCase();
      
      if (text.includes('adr') || text.includes('decision') || text.includes('architecture')) {
        await say({
          text: `👋 Ser ut som dere diskuterer arkitektur! Bruk \`/adr "Decision title"\` for å generere ADR fra denne tråden.`,
          thread_ts: event.ts
        });
      }
    });
  }

  async getThreadContext(channelId, userId) {
    try {
      // Get recent messages from channel
      const result = await this.app.client.conversations.history({
        channel: channelId,
        limit: 20
      });

      if (!result.messages) return { messages: [], participants: [] };

      // Extract relevant context
      const messages = result.messages
        .filter(msg => !msg.bot_id) // Exclude bot messages
        .map(msg => ({
          user: msg.user,
          text: msg.text,
          timestamp: msg.ts
        }));

      const participants = [...new Set(messages.map(msg => msg.user))];

      return {
        messages,
        participants,
        channelId
      };

    } catch (error) {
      console.error('Error getting thread context:', error);
      return { messages: [], participants: [] };
    }
  }

  generateADRFromContext(title, context, createdBy) {
    const now = new Date().toISOString().split('T')[0];
    const component = this.inferComponent(title, context);
    const decision = this.extractDecisionFromContext(context);
    const alternatives = this.extractAlternativesFromContext(context);
    const participants = context.participants.length > 0 
      ? context.participants.map(p => `@${p}`).join(', ')
      : createdBy;

    return `# ADR-XXXX: ${title}
**Dato:** ${now}  "  **Komponent:** ${component}  "  **Eier:** @${createdBy}

## Problem
${this.extractProblemFromContext(context)}

## Kontekst
Diskusjon oppstått i Slack med deltakere: ${participants}

Hovedpunkter fra diskusjonen:
${this.formatContextMessages(context.messages)}

## Alternativer som ble vurdert
${alternatives}

## Beslutning
${decision}

## Konsekvenser
### Positive
- [Automatisk generert - vennligst utfyll basert på diskusjon]

### Negative/Risikoer
- [Automatisk generert - vennligst utfyll basert på diskusjon]

## Implementering
- [ ] [Legg til implementeringssteg basert på beslutning]
- [ ] Oppdater dokumentasjon
- [ ] Informer team om endring

## Målbare utfall (før/etter)
- **Før:** [Beskriv nåværende tilstand]
- **Etter:** [Beskriv forventet tilstand etter implementering]

## Oppfølging
- Evaluer resultat etter [tidsperiode]
- Mål success med [konkrete målinger]

---
*Generert automatisk fra Slack-diskusjon av KRINS-Chronicle-Keeper ADR Bot*
*Vennligst gjennomgå og juster innhold før finalisering*
`;
  }

  extractProblemFromContext(context) {
    if (context.messages.length === 0) {
      return "Problem-beskrivelse basert på Slack-diskusjon - vennligst utfyll detaljer.";
    }

    // Look for problem indicators in messages
    const problemMessages = context.messages.filter(msg => 
      msg.text && (
        msg.text.includes('problem') ||
        msg.text.includes('issue') || 
        msg.text.includes('challenge') ||
        msg.text.includes('we need to')
      )
    );

    if (problemMessages.length > 0) {
      return problemMessages[0].text.substring(0, 200) + "...";
    }

    return "Problem identifisert gjennom Slack-diskusjon - vennligst utdyp basert på samtalen.";
  }

  extractDecisionFromContext(context) {
    const decisionMessages = context.messages.filter(msg =>
      msg.text && (
        msg.text.includes('we should') ||
        msg.text.includes('let\\'s use') ||
        msg.text.includes('I think we') ||
        msg.text.includes('decision')
      )
    );

    if (decisionMessages.length > 0) {
      return decisionMessages[0].text.substring(0, 300) + "...";
    }

    return "Beslutning diskutert i Slack - vennligst utfyll konkret beslutning.";
  }

  extractAlternativesFromContext(context) {
    const alternatives = [];
    
    context.messages.forEach(msg => {
      if (msg.text && (msg.text.includes('alternatively') || msg.text.includes('or we could'))) {
        alternatives.push(`- ${msg.text.substring(0, 150)}...`);
      }
    });

    if (alternatives.length > 0) {
      return alternatives.join('\n');
    }

    return "- Alternativ 1: [Utfyll basert på diskusjon]\n- Alternativ 2: [Utfyll basert på diskusjon]";
  }

  formatContextMessages(messages) {
    if (messages.length === 0) return "- Ingen meldinger funnet i kontekst";

    return messages.slice(0, 5).map((msg, index) => 
      `${index + 1}. ${msg.text.substring(0, 100)}...`
    ).join('\n');
  }

  inferComponent(title, context) {
    const text = (title + ' ' + context.messages.map(m => m.text).join(' ')).toLowerCase();
    
    if (text.includes('database') || text.includes('postgres') || text.includes('sql')) return 'platform/database';
    if (text.includes('api') || text.includes('rest') || text.includes('endpoint')) return 'platform/api';
    if (text.includes('frontend') || text.includes('ui') || text.includes('react')) return 'frontend/ui';
    if (text.includes('auth') || text.includes('login') || text.includes('security')) return 'platform/auth';
    if (text.includes('deploy') || text.includes('ci') || text.includes('cd')) return 'platform/deployment';
    
    return 'platform/general';
  }

  async saveADRDraft(title, content) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    try {
      // Get next ADR number
      const adrDir = path.join(process.cwd(), 'docs', 'adr');
      const nextNumber = await this.getNextADRNumber(adrDir);
      
      const fileName = `ADR-${nextNumber}-${slug}.md`;
      const filePath = path.join(adrDir, fileName);
      
      // Replace XXXX with actual number
      const finalContent = content.replace('ADR-XXXX', `ADR-${nextNumber}`);
      
      fs.writeFileSync(filePath, finalContent);
      
      return fileName;
    } catch (error) {
      throw new Error(`Could not save ADR draft: ${error.message}`);
    }
  }

  async getNextADRNumber(adrDir) {
    try {
      const files = fs.readdirSync(adrDir);
      const adrFiles = files.filter(file => file.startsWith('ADR-') && file.endsWith('.md'));
      
      if (adrFiles.length === 0) return '0001';
      
      const numbers = adrFiles.map(file => {
        const match = file.match(/ADR-(\d{4})/);
        return match ? parseInt(match[1], 10) : 0;
      });
      
      const maxNumber = Math.max(...numbers);
      return String(maxNumber + 1).padStart(4, '0');
    } catch (error) {
      return '0001';
    }
  }

  async start() {
    try {
      await this.app.start(process.env.PORT || 3000);
      console.log('⚡️ Slack ADR Bot is running!');
      console.log('📋 Ready to generate ADRs from Slack discussions');
    } catch (error) {
      console.error('❌ Failed to start Slack bot:', error);
      process.exit(1);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
📋 KRINS-Chronicle-Keeper Slack ADR Bot

Environment Variables Required:
  SLACK_BOT_TOKEN      - Bot token from Slack app settings
  SLACK_SIGNING_SECRET - Signing secret from Slack app settings
  PORT                 - Port to run on (default: 3000)

Usage:
  node slack-adr-bot.js                    # Start the bot server
  node slack-adr-bot.js --help            # Show this help
  
Slack Commands:
  /adr "Decision title"                   # Generate ADR from thread context
  /adr-help                               # Show help in Slack

Setup Instructions:
1. Create Slack app at https://api.slack.com/apps
2. Add Bot Token Scopes: app_mentions:read, channels:history, chat:write, commands
3. Add Slash Commands: /adr, /adr-help
4. Install app to workspace
5. Set environment variables
6. Start bot server

Examples:
  SLACK_BOT_TOKEN=xoxb-... SLACK_SIGNING_SECRET=... node slack-adr-bot.js
`);
    return;
  }

  // Validate environment variables
  if (!process.env.SLACK_BOT_TOKEN) {
    console.error('❌ Missing SLACK_BOT_TOKEN environment variable');
    process.exit(1);
  }

  if (!process.env.SLACK_SIGNING_SECRET) {
    console.error('❌ Missing SLACK_SIGNING_SECRET environment variable');
    process.exit(1);
  }

  // Start the bot
  const bot = new SlackADRBot();
  await bot.start();
}

if (require.main === module) {
  main();
}

module.exports = SlackADRBot;