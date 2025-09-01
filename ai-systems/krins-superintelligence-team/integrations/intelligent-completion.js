const fs = require('fs').promises;
const path = require('path');

class IntelligentCompletionEngine {
    constructor(agentOrchestrator) {
        this.agents = agentOrchestrator;
        this.completionCache = new Map();
        this.contextWindow = 1000; // tokens
        this.confidenceThreshold = 0.7;
        
        // Code pattern recognition
        this.patterns = {
            functionDeclaration: /^(async\s+)?function\s+(\w+)\s*\(/,
            classDeclaration: /^class\s+(\w+)/,
            variableDeclaration: /^(let|const|var)\s+(\w+)/,
            importStatement: /^import\s+/,
            commentBlock: /^\/\*/,
            methodCall: /(\w+)\.(\w+)\(/,
            conditionals: /^(if|while|for|switch)\s*\(/,
            arrowFunction: /^(const|let)\s+\w+\s*=\s*\(/,
            asyncAwait: /^(async|await)\s/
        };

        // Programming contexts
        this.contextTypes = {
            security: ['auth', 'password', 'token', 'crypto', 'hash', 'encrypt'],
            performance: ['cache', 'optimize', 'async', 'await', 'promise', 'memory'],
            architecture: ['class', 'interface', 'abstract', 'extends', 'implements'],
            database: ['query', 'select', 'insert', 'update', 'delete', 'join'],
            api: ['endpoint', 'route', 'middleware', 'request', 'response', 'http'],
            testing: ['test', 'describe', 'it', 'expect', 'mock', 'spy']
        };
    }

    async provideCompletion(document, position, context) {
        const startTime = Date.now();
        
        try {
            // Extract context around cursor
            const codeContext = this.extractCodeContext(document, position);
            const documentContext = this.extractDocumentContext(document);
            
            // Analyze what the user is trying to do
            const intent = this.analyzeIntent(codeContext);
            
            // Get agent-specific completions
            const agentCompletions = await this.getAgentCompletions(
                intent, 
                codeContext, 
                documentContext
            );

            // Rank and filter suggestions
            const rankedSuggestions = this.rankSuggestions(agentCompletions, context);
            
            // Apply Nordic design principles to suggestions
            const nordicSuggestions = this.applyNordicStyling(rankedSuggestions);

            console.log(`🧠 Intelligent completion: ${rankedSuggestions.length} suggestions (${Date.now() - startTime}ms)`);
            
            return nordicSuggestions;
            
        } catch (error) {
            console.error('❌ Completion error:', error);
            return [];
        }
    }

    extractCodeContext(document, position) {
        const text = document.getText();
        const lines = text.split('\n');
        const currentLine = position.line;
        const currentChar = position.character;
        
        // Get surrounding context
        const startLine = Math.max(0, currentLine - 10);
        const endLine = Math.min(lines.length - 1, currentLine + 5);
        
        const beforeCursor = lines.slice(startLine, currentLine).join('\n') + 
                           lines[currentLine].substring(0, currentChar);
        const afterCursor = lines[currentLine].substring(currentChar) + 
                          lines.slice(currentLine + 1, endLine + 1).join('\n');
        
        return {
            before: beforeCursor,
            after: afterCursor,
            currentLine: lines[currentLine],
            lineNumber: currentLine,
            character: currentChar,
            language: document.languageId,
            fileName: document.fileName
        };
    }

    extractDocumentContext(document) {
        const text = document.getText();
        
        return {
            imports: this.extractImports(text),
            functions: this.extractFunctions(text),
            classes: this.extractClasses(text),
            variables: this.extractVariables(text),
            complexity: this.assessComplexity(text),
            patterns: this.detectPatterns(text),
            fileType: this.classifyFileType(document.fileName, text)
        };
    }

    analyzeIntent(codeContext) {
        const { before, currentLine, language } = codeContext;
        
        // Detect what the user is trying to do
        const intents = [];
        
        // Pattern matching for common intents
        for (const [pattern, regex] of Object.entries(this.patterns)) {
            if (regex.test(currentLine.trim())) {
                intents.push({
                    type: pattern,
                    confidence: 0.9,
                    context: currentLine.trim()
                });
            }
        }

        // Context analysis
        const contextAnalysis = this.analyzeContextualIntent(before, language);
        intents.push(...contextAnalysis);

        // Security intent detection
        if (this.detectSecurityContext(before + currentLine)) {
            intents.push({
                type: 'security',
                confidence: 0.8,
                context: 'Security-related code detected'
            });
        }

        return {
            primary: intents[0] || { type: 'general', confidence: 0.5 },
            all: intents,
            language,
            complexity: this.assessComplexity(before)
        };
    }

    analyzeContextualIntent(beforeCursor, language) {
        const intents = [];
        const recentCode = beforeCursor.slice(-200); // Last 200 chars

        // API/HTTP context
        if (/(fetch|axios|http|request|response)/i.test(recentCode)) {
            intents.push({
                type: 'api',
                confidence: 0.8,
                context: 'HTTP/API operations'
            });
        }

        // Database context
        if (/(query|select|insert|database|sql|mongo)/i.test(recentCode)) {
            intents.push({
                type: 'database',
                confidence: 0.8,
                context: 'Database operations'
            });
        }

        // Error handling context
        if (/(try|catch|error|throw|exception)/i.test(recentCode)) {
            intents.push({
                type: 'errorHandling',
                confidence: 0.7,
                context: 'Error handling'
            });
        }

        // Testing context
        if (/(test|describe|it|expect|mock)/i.test(recentCode)) {
            intents.push({
                type: 'testing',
                confidence: 0.9,
                context: 'Unit testing'
            });
        }

        return intents;
    }

    async getAgentCompletions(intent, codeContext, documentContext) {
        const completions = {
            architect: [],
            security: [],
            performance: [],
            compliance: []
        };

        // Architect Agent - Design patterns and structure
        if (['functionDeclaration', 'classDeclaration', 'architecture'].includes(intent.primary.type)) {
            completions.architect = await this.getArchitectCompletions(intent, codeContext);
        }

        // Security Agent - Security best practices
        if (intent.primary.type === 'security' || this.detectSecurityContext(codeContext.before)) {
            completions.security = await this.getSecurityCompletions(intent, codeContext);
        }

        // Performance Agent - Optimization suggestions
        if (['asyncAwait', 'performance', 'api'].includes(intent.primary.type)) {
            completions.performance = await this.getPerformanceCompletions(intent, codeContext);
        }

        // Compliance Agent - Standards and documentation
        completions.compliance = await this.getComplianceCompletions(intent, documentContext);

        return completions;
    }

    async getArchitectCompletions(intent, context) {
        const suggestions = [];

        if (intent.primary.type === 'functionDeclaration') {
            suggestions.push({
                agent: 'architect',
                label: 'Add type annotations',
                kind: 'suggestion',
                detail: '🏗️ Architecture best practice',
                insertText: this.generateTypeAnnotations(context),
                confidence: 0.8,
                reasoning: 'Type safety improves code maintainability'
            });

            suggestions.push({
                agent: 'architect',
                label: 'Add JSDoc documentation',
                kind: 'suggestion',
                detail: '📚 Architecture documentation',
                insertText: this.generateJSDoc(context),
                confidence: 0.7,
                reasoning: 'Documentation improves code understanding'
            });
        }

        if (intent.primary.type === 'classDeclaration') {
            suggestions.push({
                agent: 'architect',
                label: 'Add constructor with validation',
                kind: 'method',
                detail: '🏗️ Robust constructor pattern',
                insertText: this.generateConstructorWithValidation(context),
                confidence: 0.9,
                reasoning: 'Input validation prevents runtime errors'
            });
        }

        return suggestions;
    }

    async getSecurityCompletions(intent, context) {
        const suggestions = [];

        // Input validation suggestions
        if (context.before.includes('input') || context.before.includes('req.')) {
            suggestions.push({
                agent: 'security',
                label: 'Add input validation',
                kind: 'security',
                detail: '🔒 Security validation required',
                insertText: 'if (!input || typeof input !== "string") throw new Error("Invalid input");',
                confidence: 0.95,
                reasoning: 'Always validate user input to prevent injection attacks',
                severity: 'high'
            });
        }

        // Password/crypto context
        if (/(password|secret|token|crypto)/i.test(context.before)) {
            suggestions.push({
                agent: 'security',
                label: 'Use secure hashing',
                kind: 'security',
                detail: '🔐 Crypto best practices',
                insertText: 'const bcrypt = require("bcrypt");\nconst hashedPassword = await bcrypt.hash(password, 12);',
                confidence: 0.9,
                reasoning: 'Never store passwords in plain text',
                severity: 'critical'
            });
        }

        return suggestions;
    }

    async getPerformanceCompletions(intent, context) {
        const suggestions = [];

        // Async/await optimization
        if (context.before.includes('await') || intent.primary.type === 'asyncAwait') {
            suggestions.push({
                agent: 'performance',
                label: 'Parallel async execution',
                kind: 'performance',
                detail: '⚡ Performance optimization',
                insertText: 'const results = await Promise.all([...]);',
                confidence: 0.8,
                reasoning: 'Parallel execution reduces total wait time'
            });
        }

        // Loop optimization
        if (/(for|while|forEach)/i.test(context.before)) {
            suggestions.push({
                agent: 'performance',
                label: 'Optimize loop performance',
                kind: 'performance',
                detail: '🚀 Loop optimization',
                insertText: 'for (let i = 0, len = array.length; i < len; i++) {',
                confidence: 0.7,
                reasoning: 'Cache array length for better performance'
            });
        }

        return suggestions;
    }

    async getComplianceCompletions(intent, documentContext) {
        const suggestions = [];

        // Missing documentation
        if (documentContext.functions.length > 0 && !documentContext.patterns.hasDocumentation) {
            suggestions.push({
                agent: 'compliance',
                label: 'Add function documentation',
                kind: 'documentation',
                detail: '📋 Compliance requirement',
                insertText: '/**\n * Description of function\n * @param {type} param - Parameter description\n * @returns {type} Return description\n */',
                confidence: 0.6,
                reasoning: 'Documentation is required for maintainability'
            });
        }

        // Error handling compliance
        if (!documentContext.patterns.hasErrorHandling) {
            suggestions.push({
                agent: 'compliance',
                label: 'Add error handling',
                kind: 'errorHandling',
                detail: '⚠️ Error handling required',
                insertText: 'try {\n    // Your code here\n} catch (error) {\n    console.error("Error:", error.message);\n    throw error;\n}',
                confidence: 0.8,
                reasoning: 'Proper error handling is essential for production code'
            });
        }

        return suggestions;
    }

    rankSuggestions(agentCompletions, context) {
        const allSuggestions = [];
        
        // Flatten all agent suggestions
        Object.entries(agentCompletions).forEach(([agent, suggestions]) => {
            suggestions.forEach(suggestion => {
                suggestion.agentSource = agent;
                allSuggestions.push(suggestion);
            });
        });

        // Apply ranking algorithm
        return allSuggestions
            .sort((a, b) => {
                // Security suggestions get highest priority
                if (a.agent === 'security' && b.agent !== 'security') return -1;
                if (b.agent === 'security' && a.agent !== 'security') return 1;
                
                // Then by confidence
                if (a.confidence !== b.confidence) return b.confidence - a.confidence;
                
                // Then by agent priority
                const agentPriority = { security: 4, architect: 3, performance: 2, compliance: 1 };
                return (agentPriority[b.agent] || 0) - (agentPriority[a.agent] || 0);
            })
            .filter(suggestion => suggestion.confidence >= this.confidenceThreshold);
    }

    applyNordicStyling(suggestions) {
        return suggestions.map(suggestion => ({
            ...suggestion,
            label: `🇳🇴 ${suggestion.label}`,
            documentation: {
                kind: 'markdown',
                value: `**${suggestion.agent.toUpperCase()} Agent**\n\n${suggestion.reasoning}\n\n---\n*Krins Superintelligence • Nordic AI Excellence*`
            },
            sortText: `${suggestion.agent}_${suggestion.confidence.toFixed(2)}_${suggestion.label}`,
            filterText: suggestion.label,
            commitCharacters: ['.', ',', '('],
            preselect: suggestion.agent === 'security' && suggestion.severity === 'critical'
        }));
    }

    // Helper methods for code analysis
    extractImports(text) {
        const imports = [];
        const importRegex = /^import\s+.*?from\s+['"`](.*?)['"`]/gm;
        let match;
        while ((match = importRegex.exec(text)) !== null) {
            imports.push(match[1]);
        }
        return imports;
    }

    extractFunctions(text) {
        const functions = [];
        const functionRegex = /^(async\s+)?function\s+(\w+)\s*\(/gm;
        let match;
        while ((match = functionRegex.exec(text)) !== null) {
            functions.push({
                name: match[2],
                isAsync: !!match[1],
                line: text.substring(0, match.index).split('\n').length
            });
        }
        return functions;
    }

    extractClasses(text) {
        const classes = [];
        const classRegex = /^class\s+(\w+)/gm;
        let match;
        while ((match = classRegex.exec(text)) !== null) {
            classes.push(match[1]);
        }
        return classes;
    }

    extractVariables(text) {
        const variables = [];
        const varRegex = /^(let|const|var)\s+(\w+)/gm;
        let match;
        while ((match = varRegex.exec(text)) !== null) {
            variables.push({
                name: match[2],
                type: match[1]
            });
        }
        return variables;
    }

    assessComplexity(text) {
        const lines = text.split('\n').length;
        const cyclomatic = (text.match(/\b(if|while|for|switch|case|catch)\b/g) || []).length;
        
        return {
            lines,
            cyclomatic,
            level: cyclomatic > 10 ? 'high' : cyclomatic > 5 ? 'medium' : 'low'
        };
    }

    detectPatterns(text) {
        return {
            hasDocumentation: /\/\*\*/.test(text),
            hasErrorHandling: /try\s*\{|catch\s*\(/.test(text),
            hasAsyncCode: /\b(async|await)\b/.test(text),
            hasTests: /\b(test|describe|it|expect)\b/.test(text),
            hasSecurityCode: /(auth|password|token|crypto|hash)/i.test(text)
        };
    }

    classifyFileType(fileName, text) {
        if (fileName.includes('.test.') || fileName.includes('.spec.')) return 'test';
        if (fileName.includes('config') || fileName.includes('.env')) return 'config';
        if (/(controller|route|api)/i.test(fileName)) return 'api';
        if (/(model|schema)/i.test(fileName)) return 'model';
        if (/(component|view)/i.test(fileName)) return 'ui';
        if (/(util|helper)/i.test(fileName)) return 'utility';
        return 'general';
    }

    detectSecurityContext(code) {
        const securityKeywords = [
            'password', 'secret', 'token', 'auth', 'crypto', 'hash',
            'encrypt', 'decrypt', 'security', 'vulnerability', 'injection',
            'cors', 'csrf', 'xss', 'sanitize', 'validate'
        ];
        
        return securityKeywords.some(keyword => 
            new RegExp(`\\b${keyword}\\b`, 'i').test(code)
        );
    }

    // Code generation helpers
    generateTypeAnnotations(context) {
        // Generate TypeScript-style annotations based on context
        return ': string'; // Simplified for demo
    }

    generateJSDoc(context) {
        return `/**\n * Function description\n * @param {type} param - Parameter description\n * @returns {type} Return description\n */`;
    }

    generateConstructorWithValidation(context) {
        return `constructor(options = {}) {\n    if (!options || typeof options !== 'object') {\n        throw new Error('Invalid constructor options');\n    }\n    // Initialize properties\n}`;
    }
}

module.exports = { IntelligentCompletionEngine };