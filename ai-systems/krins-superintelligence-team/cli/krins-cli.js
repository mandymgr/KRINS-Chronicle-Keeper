#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');
const { io } = require('socket.io-client');
const package = require('../package.json');

class KrinsCLI {
    constructor() {
        this.program = new Command();
        this.socket = null;
        this.config = null;
        this.spinner = null;
        
        this.setupCommands();
        this.loadConfig();
        
        // Nordic-inspired styling
        this.colors = {
            primary: '#2f2e2e',
            accent: '#2d348b',
            success: '#4a5c3a',
            warning: '#b5860e',
            error: '#8b4513',
            muted: '#959595'
        };
    }

    async loadConfig() {
        try {
            const configPath = path.join(process.cwd(), '.krins.json');
            const configExists = await fs.access(configPath).then(() => true).catch(() => false);
            
            if (configExists) {
                const configData = await fs.readFile(configPath, 'utf8');
                this.config = JSON.parse(configData);
            } else {
                this.config = {
                    serverUrl: 'http://localhost:3002',
                    agents: {
                        architect: true,
                        security: true,
                        performance: true,
                        redteam: false,
                        compliance: true,
                        research: false
                    },
                    preferences: {
                        verboseOutput: false,
                        nordicTheme: true,
                        autoConnect: true
                    }
                };
                await this.saveConfig();
            }
        } catch (error) {
            console.error(chalk.red('❌ Failed to load configuration:', error.message));
        }
    }

    async saveConfig() {
        try {
            const configPath = path.join(process.cwd(), '.krins.json');
            await fs.writeFile(configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error(chalk.red('❌ Failed to save configuration:', error.message));
        }
    }

    setupCommands() {
        this.program
            .name('krins')
            .description('🇳🇴 Krins Superintelligence CLI - Nordic AI Excellence')
            .version(package.version || '2.0.0');

        // Connection commands
        this.program
            .command('connect')
            .description('Connect to Krins superintelligence server')
            .option('-u, --url <url>', 'Server URL', 'http://localhost:3002')
            .action(this.connectCommand.bind(this));

        this.program
            .command('disconnect')
            .description('Disconnect from server')
            .action(this.disconnectCommand.bind(this));

        this.program
            .command('status')
            .description('Show connection and agent status')
            .action(this.statusCommand.bind(this));

        // Analysis commands
        this.program
            .command('review <file>')
            .description('Multi-agent code review')
            .option('-a, --agents <agents>', 'Comma-separated list of agents', 'architect,security,performance')
            .option('-f, --format <format>', 'Output format (json|text|markdown)', 'text')
            .action(this.reviewCommand.bind(this));

        this.program
            .command('analyze')
            .description('Analyze current project')
            .option('-d, --depth <depth>', 'Analysis depth (shallow|deep|comprehensive)', 'deep')
            .option('-t, --type <type>', 'Analysis type (security|performance|architecture|all)', 'all')
            .action(this.analyzeCommand.bind(this));

        this.program
            .command('optimize <file>')
            .description('Get optimization suggestions')
            .option('-t, --type <type>', 'Optimization type (performance|security|architecture)', 'performance')
            .action(this.optimizeCommand.bind(this));

        this.program
            .command('test')
            .description('Generate tests for code')
            .option('-f, --file <file>', 'Specific file to test')
            .option('-t, --type <type>', 'Test type (unit|integration|e2e)', 'unit')
            .action(this.testCommand.bind(this));

        // Interactive commands
        this.program
            .command('chat')
            .description('Interactive chat with agent team')
            .action(this.chatCommand.bind(this));

        this.program
            .command('explain <file>')
            .description('Explain code functionality')
            .option('-l, --lines <lines>', 'Specific lines (e.g., 10-20)')
            .action(this.explainCommand.bind(this));

        // Configuration commands
        this.program
            .command('config')
            .description('Configure Krins CLI')
            .option('-s, --show', 'Show current configuration')
            .option('-e, --edit', 'Edit configuration interactively')
            .action(this.configCommand.bind(this));

        this.program
            .command('agents')
            .description('Manage agent preferences')
            .option('-l, --list', 'List available agents')
            .option('-e, --enable <agent>', 'Enable specific agent')
            .option('-d, --disable <agent>', 'Disable specific agent')
            .action(this.agentsCommand.bind(this));

        // Project commands
        this.program
            .command('init')
            .description('Initialize Krins in current project')
            .option('-t, --template <template>', 'Project template (web|api|cli|library)', 'web')
            .action(this.initCommand.bind(this));

        this.program
            .command('scan')
            .description('Security scan of project')
            .option('-f, --fix', 'Attempt to auto-fix issues')
            .action(this.scanCommand.bind(this));

        // Utility commands
        this.program
            .command('doctor')
            .description('Diagnose system and suggest improvements')
            .action(this.doctorCommand.bind(this));

        this.program
            .command('benchmark')
            .description('Benchmark project performance')
            .option('-c, --compare', 'Compare with previous benchmarks')
            .action(this.benchmarkCommand.bind(this));
    }

    async connectCommand(options) {
        const spinner = ora('🔌 Connecting to Krins server...').start();
        
        try {
            this.socket = io(options.url, {
                timeout: 10000,
                transports: ['websocket', 'polling']
            });

            await new Promise((resolve, reject) => {
                this.socket.on('connect', () => {
                    this.config.serverUrl = options.url;
                    this.saveConfig();
                    spinner.succeed(`🇳🇴 Connected to Krins Superintelligence at ${options.url}`);
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    spinner.fail(`❌ Connection failed: ${error.message}`);
                    reject(error);
                });

                setTimeout(() => {
                    spinner.fail('❌ Connection timeout');
                    reject(new Error('Connection timeout'));
                }, 10000);
            });

            // Register CLI client
            this.socket.emit('cli-client-register', {
                version: package.version,
                cwd: process.cwd(),
                preferences: this.config.preferences
            });

        } catch (error) {
            console.error(chalk.red('Connection failed:', error.message));
        }
    }

    async disconnectCommand() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log(chalk.blue('🔌 Disconnected from Krins server'));
        } else {
            console.log(chalk.yellow('⚠️ Not connected to server'));
        }
    }

    async statusCommand() {
        console.log(chalk.bold('\n🇳🇴 Krins Superintelligence Status\n'));
        
        // Connection status
        const connected = this.socket && this.socket.connected;
        console.log(`Connection: ${connected ? chalk.green('✅ Connected') : chalk.red('❌ Disconnected')}`);
        
        if (connected) {
            console.log(`Server: ${chalk.blue(this.config.serverUrl)}`);
        }

        // Agent status
        console.log('\nAgent Configuration:');
        Object.entries(this.config.agents).forEach(([agent, enabled]) => {
            const status = enabled ? chalk.green('✅ Enabled') : chalk.gray('⚪ Disabled');
            console.log(`  ${agent.padEnd(12)} ${status}`);
        });

        // Project info
        const packagePath = path.join(process.cwd(), 'package.json');
        try {
            const pkg = JSON.parse(await fs.readFile(packagePath, 'utf8'));
            console.log('\nProject:');
            console.log(`  Name: ${chalk.cyan(pkg.name || 'Unknown')}`);
            console.log(`  Version: ${chalk.cyan(pkg.version || 'Unknown')}`);
        } catch (error) {
            console.log('\nProject: No package.json found');
        }
    }

    async reviewCommand(file, options) {
        if (!this.socket?.connected) {
            console.error(chalk.red('❌ Not connected to server. Run: krins connect'));
            return;
        }

        const spinner = ora(`🔍 ${this.nordicText('Analyzing')} ${file}...`).start();
        
        try {
            const filePath = path.resolve(file);
            const code = await fs.readFile(filePath, 'utf8');
            const agents = options.agents.split(',').map(a => a.trim());
            
            spinner.text = `🤖 Deploying ${agents.length} agents...`;

            const result = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Review timeout'));
                }, 60000);

                this.socket.emit('cli-review-request', {
                    file: filePath,
                    code,
                    agents,
                    format: options.format
                });

                this.socket.once('cli-review-response', (response) => {
                    clearTimeout(timeout);
                    resolve(response);
                });
            });

            spinner.succeed('✅ Multi-agent review completed');
            
            this.displayReviewResults(result, options.format);
            
        } catch (error) {
            spinner.fail(`❌ Review failed: ${error.message}`);
        }
    }

    async analyzeCommand(options) {
        if (!this.socket?.connected) {
            console.error(chalk.red('❌ Not connected to server. Run: krins connect'));
            return;
        }

        const spinner = ora('🔍 Analyzing project architecture...').start();
        
        try {
            // Scan project files
            const projectFiles = await this.scanProjectFiles();
            
            spinner.text = '🧠 Deep analysis in progress...';
            
            const result = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Analysis timeout'));
                }, 120000); // 2 minutes for comprehensive analysis

                this.socket.emit('cli-analyze-project', {
                    files: projectFiles,
                    depth: options.depth,
                    type: options.type,
                    cwd: process.cwd()
                });

                this.socket.once('cli-analyze-response', (response) => {
                    clearTimeout(timeout);
                    resolve(response);
                });
            });

            spinner.succeed('✅ Project analysis completed');
            this.displayAnalysisResults(result);
            
        } catch (error) {
            spinner.fail(`❌ Analysis failed: ${error.message}`);
        }
    }

    async chatCommand() {
        if (!this.socket?.connected) {
            console.error(chalk.red('❌ Not connected to server. Run: krins connect'));
            return;
        }

        console.log(chalk.bold('\n🇳🇴 Krins Agent Team Chat'));
        console.log(chalk.gray('Type "exit" to quit, "agents" to see available agents\n'));

        while (true) {
            const { message } = await inquirer.prompt([{
                type: 'input',
                name: 'message',
                message: chalk.blue('You:'),
                prefix: ''
            }]);

            if (message.toLowerCase() === 'exit') {
                console.log(chalk.gray('👋 Goodbye!'));
                break;
            }

            if (message.toLowerCase() === 'agents') {
                this.showAvailableAgents();
                continue;
            }

            const spinner = ora('🤖 Agent team responding...').start();
            
            try {
                const response = await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Response timeout'));
                    }, 30000);

                    this.socket.emit('cli-chat-message', { message });
                    
                    this.socket.once('cli-chat-response', (response) => {
                        clearTimeout(timeout);
                        resolve(response);
                    });
                });

                spinner.stop();
                this.displayChatResponse(response);
                
            } catch (error) {
                spinner.fail(`❌ Chat error: ${error.message}`);
            }
        }
    }

    async configCommand(options) {
        if (options.show) {
            console.log(chalk.bold('\n🇳🇴 Krins Configuration:\n'));
            console.log(JSON.stringify(this.config, null, 2));
            return;
        }

        if (options.edit) {
            await this.interactiveConfig();
            return;
        }

        // Show configuration menu
        const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'Configuration options:',
            choices: [
                'Show current configuration',
                'Edit server URL',
                'Configure agents',
                'Set preferences',
                'Reset to defaults'
            ]
        }]);

        switch (action) {
            case 'Show current configuration':
                console.log(JSON.stringify(this.config, null, 2));
                break;
            case 'Edit server URL':
                await this.editServerUrl();
                break;
            case 'Configure agents':
                await this.configureAgents();
                break;
            case 'Set preferences':
                await this.setPreferences();
                break;
            case 'Reset to defaults':
                await this.resetDefaults();
                break;
        }
    }

    async initCommand(options) {
        const spinner = ora('🚀 Initializing Krins in project...').start();
        
        try {
            // Create .krins.json config
            await this.saveConfig();
            
            // Create .krinsignore
            const krinsignore = `
# Krins ignore patterns
node_modules/
.git/
dist/
build/
coverage/
.nyc_output/
*.log
.DS_Store
.env*
`;
            await fs.writeFile('.krinsignore', krinsignore.trim());

            // Create Nordic-inspired README section
            const readmePath = path.join(process.cwd(), 'README.md');
            try {
                let readme = await fs.readFile(readmePath, 'utf8');
                if (!readme.includes('Krins Superintelligence')) {
                    readme += `\n\n## 🇳🇴 Krins Superintelligence\n\nThis project is enhanced with Krins Superintelligence for AI-powered development assistance.\n\n### Available Commands\n- \`krins review <file>\` - Multi-agent code review\n- \`krins analyze\` - Project analysis\n- \`krins chat\` - Interactive agent consultation\n\n*Nordic AI Excellence*\n`;
                    await fs.writeFile(readmePath, readme);
                }
            } catch (error) {
                // README doesn't exist, create basic one
                const basicReadme = `# ${path.basename(process.cwd())}\n\n## 🇳🇴 Krins Superintelligence\n\nThis project is powered by Krins Superintelligence - Nordic AI Excellence.\n\n### Quick Start\n\`\`\`bash\n# Connect to Krins\nkrins connect\n\n# Review code\nkrins review src/index.js\n\n# Analyze project\nkrins analyze\n\n# Interactive chat\nkrins chat\n\`\`\`\n`;
                await fs.writeFile(readmePath, basicReadme);
            }

            spinner.succeed('✅ Krins initialized successfully');
            
            console.log(chalk.green('\n🇳🇴 Welcome to Krins Superintelligence!'));
            console.log(chalk.blue('\nNext steps:'));
            console.log(chalk.gray('  1. krins connect    # Connect to server'));
            console.log(chalk.gray('  2. krins status     # Check configuration'));
            console.log(chalk.gray('  3. krins analyze    # Analyze your project'));
            
        } catch (error) {
            spinner.fail(`❌ Initialization failed: ${error.message}`);
        }
    }

    // Helper methods for display and formatting
    nordicText(text) {
        return this.config.preferences.nordicTheme ? `🇳🇴 ${text}` : text;
    }

    displayReviewResults(result, format) {
        if (format === 'json') {
            console.log(JSON.stringify(result, null, 2));
            return;
        }

        console.log(chalk.bold('\n🇳🇴 Multi-Agent Review Results\n'));
        
        if (result.agents) {
            Object.entries(result.agents).forEach(([agent, review]) => {
                const status = review.approved ? '✅' : '❌';
                console.log(`${status} ${chalk.bold(agent.toUpperCase())} Agent`);
                
                if (review.comments && review.comments.length > 0) {
                    review.comments.forEach(comment => {
                        console.log(chalk.gray(`  • ${comment}`));
                    });
                }
                
                if (review.suggestions && review.suggestions.length > 0) {
                    review.suggestions.forEach(suggestion => {
                        console.log(chalk.blue(`  → ${suggestion}`));
                    });
                }
                
                console.log();
            });
        }
    }

    displayAnalysisResults(result) {
        console.log(chalk.bold('\n🇳🇴 Project Analysis Results\n'));
        
        if (result.overview) {
            console.log(chalk.bold('Overview:'));
            console.log(chalk.gray(`  Files analyzed: ${result.overview.fileCount}`));
            console.log(chalk.gray(`  Lines of code: ${result.overview.lineCount}`));
            console.log(chalk.gray(`  Languages: ${result.overview.languages.join(', ')}`));
            console.log();
        }

        if (result.recommendations) {
            console.log(chalk.bold('Recommendations:'));
            result.recommendations.forEach(rec => {
                const priority = rec.priority === 'high' ? '🔴' : 
                               rec.priority === 'medium' ? '🟡' : '🟢';
                console.log(`  ${priority} ${rec.title}`);
                console.log(chalk.gray(`     ${rec.description}`));
            });
        }
    }

    displayChatResponse(response) {
        if (response.agent) {
            console.log(chalk.bold(`\n🤖 ${response.agent.toUpperCase()} Agent:`));
        }
        
        if (response.message) {
            console.log(chalk.white(response.message));
        }
        
        if (response.suggestions) {
            console.log(chalk.blue('\nSuggestions:'));
            response.suggestions.forEach(suggestion => {
                console.log(chalk.gray(`  • ${suggestion}`));
            });
        }
        
        console.log();
    }

    showAvailableAgents() {
        console.log(chalk.bold('\n🤖 Available Agents:\n'));
        const agents = {
            architect: '🏗️  System architecture and design patterns',
            security: '🔒  Security analysis and vulnerability detection', 
            performance: '⚡  Performance optimization and profiling',
            redteam: '🔍  Adversarial testing and edge case analysis',
            compliance: '📋  Code standards and documentation compliance',
            research: '🔬  Technology research and innovation insights'
        };
        
        Object.entries(agents).forEach(([name, description]) => {
            const enabled = this.config.agents[name] ? chalk.green('✅') : chalk.gray('⚪');
            console.log(`  ${enabled} ${chalk.bold(name.padEnd(12))} ${description}`);
        });
        
        console.log();
    }

    async scanProjectFiles() {
        // Implementation to scan project files
        const files = [];
        // Scan implementation here
        return files;
    }

    run() {
        this.program.parse(process.argv);
    }
}

// Create and run CLI instance
if (require.main === module) {
    const cli = new KrinsCLI();
    cli.run();
}

module.exports = { KrinsCLI };