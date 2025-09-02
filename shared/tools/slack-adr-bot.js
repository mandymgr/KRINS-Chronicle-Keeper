#!/usr/bin/env bun
/**
 * Slack ADR Bot - Genererer ADR-utkast fra Slack-tråder
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

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// ADR Template Generator
class ADRGenerator {
  constructor() {
    this.adrDir = path.join(__dirname, '..', 'docs', 'adr');
    this.template = path.join(this.adrDir, 'templates', 'ADR-template.md');
  }

  async generateFromSlackThread(title, component, threadMessages, channelName, teamMember) {
    // Analyser thread context for å generere intelligent ADR-utkast
    const problem = this.extractProblem(threadMessages);
    const alternatives = this.extractAlternatives(threadMessages);
    const context = this.extractContext(threadMessages, channelName);

    // Generer ADR-fil
    const adrNumber = this.getNextADRNumber();
    const slug = this.slugify(title);
    const filename = `ADR-${adrNumber}-${slug}.md`;
    const filepath = path.join(this.adrDir, filename);

    const content = this.generateADRContent({
      number: adrNumber,
      title,
      component,
      problem,
      alternatives,
      context,
      teamMember,
      slackThread: threadMessages.slice(0, 3) // First 3 messages for context
    });

    fs.writeFileSync(filepath, content);
    return { filename, filepath, content };
  }

  extractProblem(messages) {
    // Finn problem-beskrivelser fra thread
    const problemKeywords = ['problem', 'issue', 'bug', 'challenge', 'need to', 'how do we'];
    const problemMessages = messages.filter(msg => 
      problemKeywords.some(keyword => msg.text.toLowerCase().includes(keyword))
    );

    if (problemMessages.length > 0) {
      return problemMessages[0].text.substring(0, 200) + '...';
    }
    return 'Problem beskrevet i Slack-tråd (se lenker under)';
  }

  extractAlternatives(messages) {
    // Identifiser alternativer fra diskusjon
    const alternativeMarkers = ['option', 'alternative', 'could', 'what if', 'maybe', 'or we could'];
    const alternatives = [];

    messages.forEach(msg => {
      alternativeMarkers.forEach(marker => {
        if (msg.text.toLowerCase().includes(marker)) {
          alternatives.push(msg.text.substring(0, 100) + '...');
        }
      });
    });

    if (alternatives.length === 0) {
      alternatives.push('Alternative A - (fra Slack diskusjon)');
      alternatives.push('Alternative B - (fra Slack diskusjon)');
      alternatives.push('Do nothing - fortsett med current approach');
    }

    return alternatives.slice(0, 3); // Max 3 alternativer
  }

  extractContext(messages, channelName) {
    const contextClues = {
      'frontend': ['react', 'vue', 'angular', 'ui', 'component'],
      'backend': ['api', 'server', 'database', 'endpoint'],
      'devops': ['deploy', 'ci', 'cd', 'infrastructure', 'docker'],
      'security': ['auth', 'security', 'permission', 'access'],
      'performance': ['slow', 'performance', 'optimization', 'speed']
    };

    const allText = messages.map(m => m.text.toLowerCase()).join(' ');
    
    for (const [context, keywords] of Object.entries(contextClues)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        return `${channelName}/${context}`;
      }
    }

    return channelName || 'general';
  }

  generateADRContent({ number, title, component, problem, alternatives, context, teamMember, slackThread }) {
    const date = new Date().toISOString().split('T')[0];
    const slackContext = slackThread.map((msg, i) => 
      `${i + 1}. ${msg.user}: ${msg.text.substring(0, 150)}...`
    ).join('\\n');

    return `# ADR-${number}: ${title}
**Dato:** ${date}  •  **Komponent:** ${component}  •  **Eier:** @${teamMember}

## Problem
${problem}

**Slack diskusjon kontekst:**
${slackContext}

## Alternativer
${alternatives.map((alt, i) => `${i + 1}) ${alt}`).join('\\n')}

## Beslutning
Valgt: <velg alternativ>. Begrunnelse (utfyll basert på Slack-diskusjon). Rollback-plan: <defineres>.

## Evidens (før/etter)
Før: <baseline metrics>  •  Etter (forventet): <target metrics>

## Lenker
PR: #TBD  •  Runbook: /docs/runbooks/TBD.md  •  Slack Thread: <thread-link>  •  Issue: #TBD
`;
  }

  getNextADRNumber() {
    try {
      const files = fs.readdirSync(this.adrDir).filter(f => f.startsWith('ADR-') && f.endsWith('.md'));
      if (files.length === 0) return '0001';
      
      const numbers = files.map(f => {
        const match = f.match(/ADR-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
      
      return String(Math.max(...numbers) + 1).padStart(4, '0');
    } catch (error) {
      return '0001';
    }
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// Slack Bot Commands
const generator = new ADRGenerator();

// /adr command
app.command('/adr', async ({ command, ack, respond, client }) => {
  await ack();

  try {
    const args = command.text.trim().split(' ');
    if (args.length < 1 || !args[0]) {
      await respond({
        text: "Usage: `/adr \"Decision Title\"` - Genererer ADR-utkast fra denne trådens kontekst"
      });
      return;
    }

    const title = args.join(' ').replace(/['"]/g, ''); // Remove quotes
    const channelInfo = await client.conversations.info({ channel: command.channel_id });
    const channelName = channelInfo.channel.name || 'unknown';
    
    // Hent thread-messages hvis vi er i en tråd
    let threadMessages = [];
    try {
      const history = await client.conversations.history({
        channel: command.channel_id,
        limit: 20
      });
      threadMessages = history.messages.slice(0, 10); // Last 10 messages
    } catch (error) {
      threadMessages = [{ user: command.user_name, text: command.text }];
    }

    // Generer ADR
    const component = channelName.includes('frontend') ? 'frontend' :
                     channelName.includes('backend') ? 'backend' :
                     channelName.includes('devops') ? 'infrastructure' :
                     `${channelName}/general`;

    const result = await generator.generateFromSlackThread(
      title,
      component,
      threadMessages,
      channelName,
      command.user_name
    );

    await respond({
      text: `✅ ADR-utkast opprettet: \`${result.filename}\``,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*ADR-utkast opprettet!*\\n\\n` +
                  `📄 **Fil:** \`${result.filename}\`\\n` +
                  `🏗️ **Komponent:** ${component}\\n` +
                  `👤 **Eier:** @${command.user_name}\\n\\n` +
                  `Neste steg:\\n` +
                  `1. Fullfør ADR-en i \`docs/adr/${result.filename}\`\\n` +
                  `2. Commit med: \`git add . && git commit -m "docs(adr): ${title}"\`\\n` +
                  `3. Referér til ADR i PR-beskrivelsen`
          }
        }
      ]
    });

  } catch (error) {
    console.error('ADR generation error:', error);
    await respond({
      text: `❌ Feil ved generering av ADR: ${error.message}`
    });
  }
});

// /adr-help command
app.command('/adr-help', async ({ ack, respond }) => {
  await ack();
  
  await respond({
    text: "📚 *ADR Slack Bot Hjelp*",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Kommandoer:*\\n\\n" +
                "`/adr \"Decision Title\"` - Generer ADR-utkast fra tråd-kontekst\\n" +
                "`/adr-help` - Vis denne hjelpeteksten\\n\\n" +
                "*Slik fungerer det:*\\n" +
                "1. Bot analyserer Slack-tråden for problem/alternativer\\n" +
                "2. Generer intelligent ADR-utkast\\n" +
                "3. Du fullfører ADR-en og committer\\n\\n" +
                "*Tips:*\\n" +
                "• Bruk i kanaler hvor tekniske beslutninger diskuteres\\n" +
                "• Bot plukker opp nøkkelord som 'problem', 'alternativ', 'option'\\n" +
                "• Generer ADR tidlig i diskusjonen for best kontekst"
        }
      }
    ]
  });
});

// Error handling
app.error((error) => {
  console.error('Slack bot error:', error);
});

// Start bot
(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`🤖 Slack ADR Bot is running on port ${port}`);
  console.log('Available commands:');
  console.log('- /adr "Decision Title" - Generate ADR draft from thread context');
  console.log('- /adr-help - Show help');
})();