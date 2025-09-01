/**
 * 💝 Krin VS Code Workspace Integration
 * 
 * Lar Krin jobbe direkte med filer i VS Code workspace
 * Kan lese, skrive og analysere kode for deg
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

class WorkspaceIntegration {
  constructor() {
    this.workspacePath = process.cwd(); // Start from current working directory
    this.excludePatterns = [
      'node_modules/**',
      '.git/**', 
      'dist/**',
      'build/**',
      '*.log',
      '.DS_Store'
    ];
    
    console.log('📁 Workspace integration initialized for:', this.workspacePath);
  }

  /**
   * Set workspace path (usually VS Code workspace root)
   */
  setWorkspacePath(workspacePath) {
    if (fs.existsSync(workspacePath)) {
      this.workspacePath = workspacePath;
      console.log('📁 Workspace path updated to:', workspacePath);
      return true;
    }
    return false;
  }

  /**
   * Get current workspace path
   */
  getWorkspacePath() {
    return this.workspacePath;
  }

  /**
   * List files in workspace with optional pattern
   */
  async listFiles(pattern = '**/*', options = {}) {
    try {
      const searchPattern = path.join(this.workspacePath, pattern);
      const files = await glob.glob(searchPattern, {
        ignore: this.excludePatterns,
        nodir: true,
        absolute: true,
        ...options
      });
      
      return files.map(file => ({
        absolutePath: file,
        relativePath: path.relative(this.workspacePath, file),
        name: path.basename(file),
        extension: path.extname(file),
        size: fs.statSync(file).size,
        modified: fs.statSync(file).mtime
      }));
      
    } catch (error) {
      console.error('❌ Error listing files:', error);
      return [];
    }
  }

  /**
   * Read file content
   */
  async readFile(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(this.workspacePath, filePath);
        
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }
      
      const content = await fs.readFile(fullPath, 'utf8');
      const stats = await fs.stat(fullPath);
      
      return {
        path: fullPath,
        relativePath: path.relative(this.workspacePath, fullPath),
        content,
        size: stats.size,
        modified: stats.mtime,
        lines: content.split('\n').length
      };
      
    } catch (error) {
      console.error('❌ Error reading file:', error);
      throw error;
    }
  }

  /**
   * Write file content
   */
  async writeFile(filePath, content, options = {}) {
    try {
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(this.workspacePath, filePath);
        
      // Ensure directory exists
      await fs.ensureDir(path.dirname(fullPath));
      
      // Backup existing file if requested
      if (options.backup && fs.existsSync(fullPath)) {
        const backupPath = `${fullPath}.backup.${Date.now()}`;
        await fs.copy(fullPath, backupPath);
        console.log('💾 Backup created:', backupPath);
      }
      
      await fs.writeFile(fullPath, content, 'utf8');
      
      return {
        path: fullPath,
        relativePath: path.relative(this.workspacePath, fullPath),
        size: Buffer.byteLength(content, 'utf8'),
        success: true
      };
      
    } catch (error) {
      console.error('❌ Error writing file:', error);
      throw error;
    }
  }

  /**
   * Search for text in files
   */
  async searchInFiles(searchTerm, options = {}) {
    try {
      const {
        pattern = '**/*.{js,ts,jsx,tsx,py,java,cpp,c,h,css,html,md,txt}',
        caseSensitive = false,
        wholeWord = false,
        maxResults = 100
      } = options;

      const files = await this.listFiles(pattern);
      const results = [];

      for (const file of files.slice(0, maxResults)) {
        try {
          const fileContent = await fs.readFile(file.absolutePath, 'utf8');
          const lines = fileContent.split('\n');
          
          const flags = caseSensitive ? 'g' : 'gi';
          const searchPattern = wholeWord 
            ? new RegExp(`\\b${searchTerm}\\b`, flags)
            : new RegExp(searchTerm, flags);

          lines.forEach((line, index) => {
            if (searchPattern.test(line)) {
              results.push({
                file: file.relativePath,
                line: index + 1,
                content: line.trim(),
                match: searchTerm
              });
            }
          });
          
        } catch (readError) {
          // Skip files that can't be read
          continue;
        }
      }

      return results;
      
    } catch (error) {
      console.error('❌ Error searching in files:', error);
      return [];
    }
  }

  /**
   * Get project structure
   */
  async getProjectStructure(maxDepth = 3) {
    try {
      const structure = await this._buildDirectoryTree(this.workspacePath, maxDepth);
      return structure;
    } catch (error) {
      console.error('❌ Error getting project structure:', error);
      return null;
    }
  }

  /**
   * Build directory tree recursively
   */
  async _buildDirectoryTree(dirPath, maxDepth, currentDepth = 0) {
    if (currentDepth >= maxDepth) return null;
    
    const items = await fs.readdir(dirPath);
    const tree = {
      name: path.basename(dirPath),
      path: dirPath,
      type: 'directory',
      children: []
    };

    for (const item of items) {
      // Skip excluded patterns
      if (this.excludePatterns.some(pattern => 
        item.match(new RegExp(pattern.replace('**/', '').replace('*', '.*')))
      )) {
        continue;
      }

      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        const subtree = await this._buildDirectoryTree(itemPath, maxDepth, currentDepth + 1);
        if (subtree) tree.children.push(subtree);
      } else {
        tree.children.push({
          name: item,
          path: itemPath,
          type: 'file',
          size: stats.size,
          modified: stats.mtime
        });
      }
    }

    return tree;
  }

  /**
   * Analyze code file (basic analysis)
   */
  async analyzeCodeFile(filePath) {
    try {
      const fileData = await this.readFile(filePath);
      const extension = path.extname(filePath).toLowerCase();
      
      const analysis = {
        file: fileData.relativePath,
        language: this._getLanguageFromExtension(extension),
        lines: fileData.lines,
        size: fileData.size,
        complexity: this._calculateComplexity(fileData.content, extension),
        functions: this._extractFunctions(fileData.content, extension),
        imports: this._extractImports(fileData.content, extension),
        todos: this._extractTodos(fileData.content)
      };

      return analysis;
      
    } catch (error) {
      console.error('❌ Error analyzing code file:', error);
      throw error;
    }
  }

  /**
   * Get programming language from file extension
   */
  _getLanguageFromExtension(extension) {
    const languages = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript', 
      '.jsx': 'React',
      '.tsx': 'React TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.h': 'C Header',
      '.css': 'CSS',
      '.html': 'HTML',
      '.md': 'Markdown'
    };
    
    return languages[extension] || 'Unknown';
  }

  /**
   * Calculate basic code complexity
   */
  _calculateComplexity(content, extension) {
    const lines = content.split('\n').filter(line => line.trim());
    const branches = (content.match(/if|else|switch|case|for|while|catch/g) || []).length;
    const functions = (content.match(/function|def|class/g) || []).length;
    
    return {
      totalLines: content.split('\n').length,
      codeLines: lines.length,
      branches,
      functions,
      complexity: branches + functions
    };
  }

  /**
   * Extract function names (basic regex)
   */
  _extractFunctions(content, extension) {
    const patterns = {
      '.js': /function\s+(\w+)/g,
      '.ts': /function\s+(\w+)/g,
      '.py': /def\s+(\w+)/g,
      '.java': /(?:public|private|protected)?\s*\w+\s+(\w+)\s*\(/g
    };
    
    const pattern = patterns[extension];
    if (!pattern) return [];
    
    const matches = [];
    let match;
    while ((match = pattern.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  /**
   * Extract import statements
   */
  _extractImports(content, extension) {
    const lines = content.split('\n');
    const importLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('import ') || 
             trimmed.startsWith('from ') ||
             trimmed.startsWith('#include') ||
             trimmed.startsWith('require(');
    });
    
    return importLines.map(line => line.trim());
  }

  /**
   * Extract TODO comments
   */
  _extractTodos(content) {
    const lines = content.split('\n');
    const todos = [];
    
    lines.forEach((line, index) => {
      const match = line.match(/\/\/\s*(TODO|FIXME|HACK|NOTE):\s*(.+)/i) ||
                   line.match(/#\s*(TODO|FIXME|HACK|NOTE):\s*(.+)/i);
      
      if (match) {
        todos.push({
          line: index + 1,
          type: match[1].toUpperCase(),
          text: match[2].trim()
        });
      }
    });
    
    return todos;
  }
}

module.exports = WorkspaceIntegration;