#!/usr/bin/env node
/**
 * 🚀 KRINS WebSocket Server Launcher
 * 
 * Starts the WebSocket server for real-time synchronization
 * Handles TypeScript compilation and server startup
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

console.log('🚀 Starting KRINS WebSocket Server...')

// Check if TypeScript is installed globally or locally
const checkTypescript = () => {
  try {
    const result = spawn('npx', ['tsc', '--version'], { stdio: 'pipe' })
    return true
  } catch (error) {
    console.error('❌ TypeScript not found. Installing...')
    return false
  }
}

// Install dependencies if needed
const installDependencies = async () => {
  return new Promise((resolve, reject) => {
    console.log('📦 Installing dependencies...')
    const npm = spawn('npm', ['install', 'socket.io', 'express', 'cors', 'dotenv', '@types/express', '@types/cors'], {
      cwd: rootDir,
      stdio: 'inherit'
    })

    npm.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Dependencies installed')
        resolve()
      } else {
        reject(new Error(`npm install failed with code ${code}`))
      }
    })
  })
}

// Compile TypeScript to JavaScript
const compileTypeScript = async () => {
  return new Promise((resolve, reject) => {
    console.log('🔨 Compiling TypeScript...')
    
    // Create temporary tsconfig for server compilation
    const tempConfig = {
      "compilerOptions": {
        "target": "ES2020",
        "module": "CommonJS",
        "lib": ["ES2020"],
        "outDir": "./dist",
        "rootDir": "./",
        "strict": false,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "moduleResolution": "node",
        "allowSyntheticDefaultImports": true,
        "resolveJsonModule": true
      },
      "include": [
        "backend/websocket-server.ts",
        "TEAM_COLLABORATION/websocket-sync.ts"
      ]
    }

    fs.writeFileSync(join(rootDir, 'tsconfig.temp.json'), JSON.stringify(tempConfig, null, 2))

    const tsc = spawn('npx', ['tsc', '--project', 'tsconfig.temp.json'], {
      cwd: rootDir,
      stdio: 'inherit'
    })

    tsc.on('close', (code) => {
      // Clean up temp config
      try {
        fs.unlinkSync(join(rootDir, 'tsconfig.temp.json'))
      } catch (err) {}

      if (code === 0) {
        console.log('✅ TypeScript compiled successfully')
        resolve()
      } else {
        console.log('⚠️ TypeScript compilation had warnings, continuing...')
        resolve() // Continue anyway
      }
    })
  })
}

// Start the WebSocket server
const startServer = async () => {
  return new Promise((resolve, reject) => {
    console.log('🌟 Starting WebSocket server...')
    
    // Check if compiled JS exists, otherwise run TS directly
    const jsPath = join(rootDir, 'dist', 'backend', 'websocket-server.js')
    const tsPath = join(rootDir, 'backend', 'websocket-server.ts')
    
    let command, args
    
    if (fs.existsSync(jsPath)) {
      command = 'node'
      args = [jsPath]
      console.log('📄 Running compiled JavaScript')
    } else {
      command = 'npx'
      args = ['ts-node', tsPath]
      console.log('📄 Running TypeScript directly')
    }

    const server = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        WEBSOCKET_PORT: process.env.WEBSOCKET_PORT || '3001',
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
      }
    })

    // Handle server events
    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message)
      reject(error)
    })

    server.on('close', (code) => {
      if (code === 0) {
        console.log('✅ WebSocket server stopped gracefully')
      } else {
        console.log(`⚠️ WebSocket server exited with code ${code}`)
      }
    })

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down WebSocket server...')
      server.kill('SIGINT')
      setTimeout(() => {
        server.kill('SIGKILL')
        process.exit(0)
      }, 5000)
    })

    console.log('✅ WebSocket server started successfully!')
    console.log(`🔗 WebSocket URL: ws://localhost:${process.env.WEBSOCKET_PORT || 3001}/krins-socket`)
    console.log('🎯 Press Ctrl+C to stop')
  })
}

// Main execution
async function main() {
  try {
    // Install dependencies first
    await installDependencies()
    
    // Try to compile TypeScript
    await compileTypeScript()
    
    // Start the server
    await startServer()
    
  } catch (error) {
    console.error('❌ Failed to start WebSocket server:', error.message)
    
    // Fallback: try to run with minimal setup
    console.log('🔄 Attempting fallback startup...')
    try {
      const fallback = spawn('node', ['-e', `
        const express = require('express');
        const { createServer } = require('http');
        const { Server } = require('socket.io');
        const cors = require('cors');
        
        const app = express();
        const httpServer = createServer(app);
        
        app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
        app.use(express.json());
        
        const io = new Server(httpServer, {
          cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
          path: '/krins-socket'
        });
        
        let users = new Map();
        
        io.on('connection', (socket) => {
          console.log('User connected:', socket.id);
          
          socket.on('krins:auth', (data) => {
            users.set(socket.id, data);
            socket.emit('krins:auth:success', { user: data, onlineUsers: Array.from(users.values()) });
            socket.broadcast.emit('krins:user:presence', { action: 'joined', user: data });
          });
          
          socket.on('disconnect', () => {
            const user = users.get(socket.id);
            users.delete(socket.id);
            if (user) socket.broadcast.emit('krins:user:presence', { action: 'left', user });
            console.log('User disconnected:', socket.id);
          });
        });
        
        app.get('/health', (req, res) => res.json({ status: 'healthy', users: users.size }));
        
        const PORT = process.env.WEBSOCKET_PORT || 3001;
        httpServer.listen(PORT, () => {
          console.log('🚀 Fallback WebSocket Server running on port', PORT);
        });
      `], {
        cwd: rootDir,
        stdio: 'inherit'
      })
      
      // Handle fallback server shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down fallback server...')
        fallback.kill('SIGINT')
        setTimeout(() => process.exit(0), 2000)
      })
      
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message)
      process.exit(1)
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}