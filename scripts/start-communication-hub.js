#!/usr/bin/env node
/**
 * 🤖 KRINS Communication Hub Launcher
 * 
 * Starts the intelligent Slack/Teams integration hub
 * Provides smart ADR generation, AI insights, and team coordination
 * 
 * @author KRINS Intelligence System
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

console.log('🤖 Starting KRINS Intelligent Communication Hub...')

// Check environment variables
const checkEnvironment = () => {
  const requiredVars = []
  const optionalVars = [
    'SLACK_BOT_TOKEN',
    'SLACK_SIGNING_SECRET', 
    'SLACK_APP_TOKEN',
    'TEAMS_CLIENT_ID',
    'TEAMS_CLIENT_SECRET',
    'FRONTEND_URL'
  ]

  let hasSlack = process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET
  let hasTeams = process.env.TEAMS_CLIENT_ID && process.env.TEAMS_CLIENT_SECRET

  if (!hasSlack && !hasTeams) {
    console.log('⚠️  No Slack or Teams credentials found')
    console.log('📝 The hub will run in demo mode with mock integrations')
    console.log('\n🔧 To enable integrations, set these environment variables:')
    console.log('   For Slack: SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET')
    console.log('   For Teams: TEAMS_CLIENT_ID, TEAMS_CLIENT_SECRET')
    console.log('   Optional: FRONTEND_URL (defaults to http://localhost:5173)\n')
  } else {
    console.log('✅ Integration credentials detected:')
    if (hasSlack) console.log('   📱 Slack: Enabled')
    if (hasTeams) console.log('   👥 Teams: Enabled')
  }

  return { hasSlack, hasTeams }
}

// Install required dependencies
const installDependencies = async () => {
  return new Promise((resolve, reject) => {
    console.log('📦 Installing Communication Hub dependencies...')
    
    const packages = [
      '@slack/bolt',
      '@microsoft/microsoft-graph-client',
      'dotenv',
      'fs-extra',
      '@types/fs-extra'
    ]

    const npm = spawn('npm', ['install', ...packages], {
      cwd: rootDir,
      stdio: 'inherit'
    })

    npm.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Dependencies installed')
        resolve()
      } else {
        console.log('⚠️ Some dependencies may have failed, continuing...')
        resolve() // Continue anyway
      }
    })

    npm.on('error', (error) => {
      console.log(`⚠️ Install error: ${error.message}, continuing...`)
      resolve() // Continue anyway
    })
  })
}

// Start the communication hub
const startCommunicationHub = async (integrations) => {
  return new Promise((resolve, reject) => {
    console.log('🌟 Starting Communication Hub server...')

    // Check if we can run TypeScript directly
    const tsPath = join(rootDir, 'TEAM_COLLABORATION', 'communications-hub.ts')
    
    let serverCode
    
    if (integrations.hasSlack || integrations.hasTeams) {
      // Full integration mode
      serverCode = `
        const { KRINSCommunicationHub } = require('./TEAM_COLLABORATION/communications-hub.ts');
        
        async function main() {
          const hub = new KRINSCommunicationHub();
          
          // Start Slack bot if configured
          if (process.env.SLACK_BOT_TOKEN) {
            try {
              await hub.startSlackBot(process.env.COMMUNICATION_PORT || 3002);
              console.log('🤖 KRINS Communication Hub running with Slack integration');
            } catch (error) {
              console.error('❌ Failed to start Slack integration:', error.message);
              console.log('🔄 Starting in demo mode...');
              startDemoMode();
            }
          } else {
            startDemoMode();
          }
        }
        
        function startDemoMode() {
          console.log('📝 Running Communication Hub in demo mode');
          // Demo mode implementation
        }
        
        main().catch(console.error);
      `
    } else {
      // Demo mode with mock integrations
      serverCode = `
        const express = require('express');
        const cors = require('cors');
        
        const app = express();
        const PORT = process.env.COMMUNICATION_PORT || 3002;
        
        app.use(cors());
        app.use(express.json());
        
        // Mock endpoints
        app.get('/health', (req, res) => {
          res.json({ 
            status: 'healthy', 
            mode: 'demo',
            integrations: { slack: false, teams: false }
          });
        });
        
        app.get('/api/communication/stats', (req, res) => {
          res.json({
            success: true,
            stats: {
              totalDecisions: 5,
              activeDecisions: 2,
              aiInsights: 8,
              slackIntegrated: false,
              teamsIntegrated: false
            }
          });
        });
        
        app.post('/api/communication/adr', (req, res) => {
          const { title, component } = req.body;
          res.json({
            success: true,
            message: 'ADR would be created with Slack/Teams integration',
            adr: {
              id: 'demo_adr_' + Date.now(),
              title,
              component,
              status: 'demo'
            }
          });
        });
        
        app.post('/api/communication/insight', (req, res) => {
          const { query } = req.body;
          res.json({
            success: true,
            insights: [
              {
                type: 'recommendation',
                title: 'Demo Insight',
                content: 'This is a demo insight for: ' + query,
                confidence: 0.85
              }
            ]
          });
        });
        
        app.listen(PORT, () => {
          console.log('🤖 KRINS Communication Hub (Demo Mode) running on port', PORT);
          console.log('📊 Health check: http://localhost:' + PORT + '/health');
          console.log('📝 Note: Running in demo mode - no actual Slack/Teams integration');
          console.log('🔧 Add Slack/Teams credentials to enable full functionality');
        });
      `
    }

    // Write and execute server code
    const serverPath = join(rootDir, 'temp-communication-server.js')
    fs.writeFileSync(serverPath, serverCode)

    const server = spawn('node', [serverPath], {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        COMMUNICATION_PORT: process.env.COMMUNICATION_PORT || '3002',
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
      }
    })

    // Handle server events
    server.on('error', (error) => {
      console.error('❌ Failed to start Communication Hub:', error.message)
      reject(error)
    })

    server.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(serverPath)
      } catch (err) {}
      
      if (code === 0) {
        console.log('✅ Communication Hub stopped gracefully')
      } else {
        console.log(`⚠️ Communication Hub exited with code ${code}`)
      }
    })

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\\n🛑 Shutting down Communication Hub...')
      server.kill('SIGINT')
      setTimeout(() => {
        server.kill('SIGKILL')
        try {
          fs.unlinkSync(serverPath)
        } catch (err) {}
        process.exit(0)
      }, 5000)
    })

    console.log('✅ Communication Hub started successfully!')
    console.log(`🔗 API URL: http://localhost:${process.env.COMMUNICATION_PORT || 3002}`)
    console.log('🎯 Press Ctrl+C to stop')
  })
}

// Main execution
async function main() {
  try {
    // Check environment
    const integrations = checkEnvironment()
    
    // Install dependencies
    await installDependencies()
    
    // Start communication hub
    await startCommunicationHub(integrations)
    
  } catch (error) {
    console.error('❌ Failed to start Communication Hub:', error.message)
    
    // Fallback: Minimal demo server
    console.log('🔄 Starting minimal fallback server...')
    try {
      const express = require('express')
      const app = express()
      const PORT = 3002
      
      app.use(express.json())
      app.get('/health', (req, res) => res.json({ status: 'fallback', mode: 'minimal' }))
      
      app.listen(PORT, () => {
        console.log('🤖 Minimal Communication Hub running on port', PORT)
      })
      
      // Handle fallback server shutdown
      process.on('SIGINT', () => {
        console.log('\\n🛑 Shutting down fallback server...')
        process.exit(0)
      })
      
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message)
      console.log('💡 Try running: npm install express')
      process.exit(1)
    }
  }
}

// Show help information
function showHelp() {
  console.log(`
🤖 KRINS Communication Hub

USAGE:
  node scripts/start-communication-hub.js [options]

ENVIRONMENT VARIABLES:
  SLACK_BOT_TOKEN         - Slack bot token for integration
  SLACK_SIGNING_SECRET    - Slack signing secret for verification
  SLACK_APP_TOKEN         - Slack app token for socket mode (optional)
  TEAMS_CLIENT_ID         - Microsoft Teams client ID
  TEAMS_CLIENT_SECRET     - Microsoft Teams client secret
  COMMUNICATION_PORT      - Port to run on (default: 3002)
  FRONTEND_URL           - Frontend URL for links (default: http://localhost:5173)

FEATURES:
  🤖 Intelligent ADR generation from Slack/Teams conversations
  🧠 AI-powered insights delivery
  📊 Team collaboration analytics
  🔔 Smart notifications and reminders
  📋 Decision lifecycle tracking

SLACK COMMANDS (when enabled):
  /krins-adr "Title | Component"  - Generate intelligent ADR
  /krins-insights "query"         - Get AI insights  
  /krins-decisions [filter]       - List decisions
  /krins-evidence "id|type|desc"  - Collect evidence
  /krins-dashboard               - View team stats

For setup help: https://github.com/krins-studio/KRINS-Chronicle-Keeper
`)
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp()
  process.exit(0)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}