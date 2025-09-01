import * as vscode from 'vscode';
import { io, Socket } from 'socket.io-client';
import { AgentPanelProvider } from './agentPanelProvider';
import { CodeAnalysisProvider } from './codeAnalysisProvider';
import { NordicStatusBar } from './nordicStatusBar';

let socket: Socket | null = null;
let agentPanelProvider: AgentPanelProvider;
let codeAnalysisProvider: CodeAnalysisProvider;
let nordicStatusBar: NordicStatusBar;

export function activate(context: vscode.ExtensionContext) {
    console.log('🤖 Krins Superintelligence extension activating...');

    // Initialize providers
    agentPanelProvider = new AgentPanelProvider(context);
    codeAnalysisProvider = new CodeAnalysisProvider();
    nordicStatusBar = new NordicStatusBar();

    // Register tree data provider
    vscode.window.createTreeView('krinsAgentPanel', {
        treeDataProvider: agentPanelProvider,
        showCollapseAll: true
    });

    // Register commands
    const commands = [
        vscode.commands.registerCommand('krins.openAgentPanel', openAgentPanel),
        vscode.commands.registerCommand('krins.reviewCurrentFile', reviewCurrentFile),
        vscode.commands.registerCommand('krins.explainSelection', explainSelection),
        vscode.commands.registerCommand('krins.optimizeCode', optimizeCode),
        vscode.commands.registerCommand('krins.findIssues', findIssues),
        vscode.commands.registerCommand('krins.generateTests', generateTests),
        vscode.commands.registerCommand('krins.connectToServer', connectToServer),
        vscode.commands.registerCommand('krins.disconnectFromServer', disconnectFromServer)
    ];

    context.subscriptions.push(...commands);

    // Auto-connect on startup
    const config = vscode.workspace.getConfiguration('krins');
    const autoConnect = config.get<boolean>('autoConnect', true);
    
    if (autoConnect) {
        connectToServer();
    }

    // Listen for file changes
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (socket && config.get<boolean>('enableRealTimeUpdates', true)) {
            debouncedFileAnalysis(event.document);
        }
    });

    // Listen for selection changes
    vscode.window.onDidChangeTextEditorSelection((event) => {
        const selection = event.textEditor.selection;
        if (!selection.isEmpty && socket) {
            const selectedText = event.textEditor.document.getText(selection);
            if (selectedText.length > 10 && selectedText.length < 1000) {
                codeAnalysisProvider.analyzeSelection(selectedText, event.textEditor.document);
            }
        }
    });

    console.log('✅ Krins Superintelligence extension activated');
}

async function connectToServer() {
    const config = vscode.workspace.getConfiguration('krins');
    const serverUrl = config.get<string>('serverUrl', 'http://localhost:3002');

    try {
        socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            timeout: 10000
        });

        socket.on('connect', () => {
            console.log('🔌 Connected to Krins server');
            nordicStatusBar.setConnected(true);
            vscode.commands.executeCommand('setContext', 'krins:connected', true);
            
            vscode.window.showInformationMessage(
                '🇳🇴 Connected to Krins Superintelligence',
                'Open Agent Panel'
            ).then(selection => {
                if (selection) {
                    vscode.commands.executeCommand('krins.openAgentPanel');
                }
            });

            // Register with server
            socket?.emit('vscode-client-register', {
                workspace: vscode.workspace.name,
                workspaceFolders: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath),
                version: vscode.version
            });
        });

        socket.on('disconnect', () => {
            console.log('🔌 Disconnected from Krins server');
            nordicStatusBar.setConnected(false);
            vscode.commands.executeCommand('setContext', 'krins:connected', false);
            vscode.window.showWarningMessage('Disconnected from Krins Superintelligence');
        });

        socket.on('agent-response', handleAgentResponse);
        socket.on('analysis-complete', handleAnalysisComplete);
        socket.on('suggestion', handleSuggestion);
        socket.on('error', handleServerError);

    } catch (error) {
        console.error('❌ Connection error:', error);
        vscode.window.showErrorMessage(`Failed to connect to Krins server: ${error}`);
    }
}

function disconnectFromServer() {
    if (socket) {
        socket.disconnect();
        socket = null;
        nordicStatusBar.setConnected(false);
        vscode.commands.executeCommand('setContext', 'krins:connected', false);
        vscode.window.showInformationMessage('Disconnected from Krins Superintelligence');
    }
}

async function openAgentPanel() {
    await vscode.commands.executeCommand('workbench.view.extension.krins-superintelligence');
    await vscode.commands.executeCommand('krinsAgentPanel.focus');
}

async function reviewCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !socket) {
        vscode.window.showWarningMessage('No active file or not connected to Krins');
        return;
    }

    const document = editor.document;
    const code = document.getText();
    const fileName = document.fileName;
    const language = document.languageId;

    const progress = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: '🤖 Krins agents reviewing file...',
        cancellable: true
    }, async (progress, token) => {
        
        progress.report({ increment: 0, message: 'Starting multi-agent analysis' });

        socket?.emit('analyze-file', {
            fileName,
            language,
            code,
            analysis: ['architecture', 'security', 'performance', 'compliance']
        });

        return new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(null), 30000);
            
            socket?.once('analysis-complete', (result) => {
                clearTimeout(timeout);
                resolve(result);
            });
            
            token.onCancellationRequested(() => {
                clearTimeout(timeout);
                resolve(null);
            });
        });
    });

    if (progress) {
        displayAnalysisResults(progress, document);
    }
}

async function explainSelection() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !socket) {
        return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
        vscode.window.showInformationMessage('Please select code to explain');
        return;
    }

    const selectedText = editor.document.getText(selection);
    const language = editor.document.languageId;

    socket.emit('explain-code', {
        code: selectedText,
        language,
        context: getContextAroundSelection(editor, selection)
    });

    vscode.window.showInformationMessage('🤖 Krins agents analyzing selection...');
}

async function optimizeCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !socket) {
        return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const code = selection.isEmpty ? document.getText() : document.getText(selection);

    socket.emit('optimize-code', {
        code,
        language: document.languageId,
        scope: selection.isEmpty ? 'file' : 'selection',
        fileName: document.fileName
    });

    vscode.window.showInformationMessage('⚡ Performance agent optimizing code...');
}

async function findIssues() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !socket) {
        return;
    }

    const document = editor.document;
    const code = document.getText();

    socket.emit('find-issues', {
        code,
        language: document.languageId,
        fileName: document.fileName,
        agents: ['security', 'redteam', 'compliance']
    });

    vscode.window.showInformationMessage('🔍 Red team agent scanning for issues...');
}

async function generateTests() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !socket) {
        return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const code = selection.isEmpty ? document.getText() : document.getText(selection);

    socket.emit('generate-tests', {
        code,
        language: document.languageId,
        fileName: document.fileName,
        testType: 'unit' // Could be configurable
    });

    vscode.window.showInformationMessage('🧪 Generating comprehensive tests...');
}

function handleAgentResponse(data: any) {
    const { agent, response, type } = data;
    
    switch (type) {
        case 'explanation':
            showExplanationPanel(agent, response);
            break;
        case 'optimization':
            showOptimizationSuggestions(agent, response);
            break;
        case 'issues':
            showIssuesPanel(agent, response);
            break;
        case 'tests':
            showGeneratedTests(agent, response);
            break;
        default:
            console.log(`Unknown response type: ${type}`);
    }
}

function handleAnalysisComplete(result: any) {
    agentPanelProvider.updateAnalysisResults(result);
    nordicStatusBar.setAnalysisComplete(result);
}

function handleSuggestion(suggestion: any) {
    // Show inline suggestions as CodeLens or decorations
    codeAnalysisProvider.showSuggestion(suggestion);
}

function handleServerError(error: any) {
    console.error('Server error:', error);
    vscode.window.showErrorMessage(`Krins server error: ${error.message}`);
}

function showExplanationPanel(agent: string, response: any) {
    const panel = vscode.window.createWebviewPanel(
        'krinsExplanation',
        `🤖 ${agent.toUpperCase()} Explanation`,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            localResourceRoots: []
        }
    );

    panel.webview.html = createNordicWebviewContent(
        `${agent.toUpperCase()} Code Explanation`,
        response.explanation || response.message,
        response.suggestions || []
    );
}

function showOptimizationSuggestions(agent: string, response: any) {
    const panel = vscode.window.createWebviewPanel(
        'krinsOptimization',
        `⚡ Performance Optimization`,
        vscode.ViewColumn.Beside,
        { enableScripts: true }
    );

    panel.webview.html = createNordicWebviewContent(
        'Performance Optimization Suggestions',
        response.analysis,
        response.suggestions,
        response.optimizedCode
    );
}

function showIssuesPanel(agent: string, response: any) {
    // Create diagnostic collection for issues
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('krins');
    
    const editor = vscode.window.activeTextEditor;
    if (editor && response.issues) {
        const diagnostics: vscode.Diagnostic[] = response.issues.map((issue: any) => {
            const range = new vscode.Range(
                issue.line || 0, 
                issue.column || 0,
                issue.line || 0, 
                issue.column + issue.length || 100
            );
            
            return new vscode.Diagnostic(
                range,
                issue.message,
                issue.severity === 'error' ? vscode.DiagnosticSeverity.Error :
                issue.severity === 'warning' ? vscode.DiagnosticSeverity.Warning :
                vscode.DiagnosticSeverity.Information
            );
        });
        
        diagnosticCollection.set(editor.document.uri, diagnostics);
    }
}

function showGeneratedTests(agent: string, response: any) {
    // Create new document with generated tests
    vscode.workspace.openTextDocument({
        content: response.tests,
        language: response.language || 'javascript'
    }).then(doc => {
        vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    });
}

function displayAnalysisResults(results: any, document: vscode.TextDocument) {
    const panel = vscode.window.createWebviewPanel(
        'krinsAnalysis',
        '🇳🇴 Krins Multi-Agent Analysis',
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            localResourceRoots: []
        }
    );

    panel.webview.html = createNordicAnalysisView(results, document.fileName);
}

function createNordicWebviewContent(title: string, content: string, suggestions: any[] = [], code?: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            :root {
                --nordic-primary: #2f2e2e;
                --nordic-secondary: #ffffff;
                --nordic-accent: #ddd;
                --nordic-text: #2f2e2e;
                --nordic-text-light: #959595;
                --nordic-blue: #2d348b;
                --nordic-border: #ddd;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: var(--nordic-text);
                background: var(--nordic-secondary);
                padding: 24px;
                max-width: 880px;
                margin: 0 auto;
            }
            
            h1 {
                font-family: 'Playfair Display', serif;
                font-size: 2.5rem;
                font-weight: 400;
                margin-bottom: 32px;
                color: var(--nordic-primary);
                border-bottom: 1px solid var(--nordic-border);
                padding-bottom: 16px;
            }
            
            h2 {
                font-size: 1.5rem;
                margin: 32px 0 16px 0;
                color: var(--nordic-primary);
                font-weight: 300;
            }
            
            .content {
                margin-bottom: 32px;
                padding: 24px;
                border: 1px solid var(--nordic-border);
            }
            
            .suggestions {
                list-style: none;
            }
            
            .suggestions li {
                padding: 12px 0;
                border-bottom: 1px solid var(--nordic-accent);
            }
            
            .suggestions li:last-child {
                border-bottom: none;
            }
            
            pre {
                background: #f8f8f8;
                padding: 16px;
                border-left: 4px solid var(--nordic-blue);
                margin: 16px 0;
                overflow-x: auto;
                font-family: 'Monaco', 'Consolas', monospace;
            }
            
            .nordic-flag {
                display: inline-block;
                margin-right: 8px;
                font-size: 1.2em;
            }
        </style>
    </head>
    <body>
        <h1><span class="nordic-flag">🇳🇴</span>${title}</h1>
        
        <div class="content">
            ${content}
        </div>
        
        ${suggestions.length > 0 ? `
        <h2>Suggestions</h2>
        <ul class="suggestions">
            ${suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
        ` : ''}
        
        ${code ? `
        <h2>Optimized Code</h2>
        <pre><code>${code}</code></pre>
        ` : ''}
    </body>
    </html>`;
}

function createNordicAnalysisView(results: any, fileName: string): string {
    // Implementation would create comprehensive Nordic-styled analysis view
    return createNordicWebviewContent(
        'Multi-Agent Analysis',
        `Analysis complete for ${fileName}`,
        ['View detailed results in the Agent Panel']
    );
}

function getContextAroundSelection(editor: vscode.TextEditor, selection: vscode.Selection): string {
    const document = editor.document;
    const startLine = Math.max(0, selection.start.line - 5);
    const endLine = Math.min(document.lineCount - 1, selection.end.line + 5);
    
    const range = new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length);
    return document.getText(range);
}

// Debounced file analysis to prevent excessive API calls
let analysisTimeout: NodeJS.Timeout;
function debouncedFileAnalysis(document: vscode.TextDocument) {
    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(() => {
        if (socket && document.languageId !== 'plaintext') {
            socket.emit('file-changed', {
                fileName: document.fileName,
                language: document.languageId,
                content: document.getText()
            });
        }
    }, 2000);
}

export function deactivate() {
    if (socket) {
        socket.disconnect();
    }
}