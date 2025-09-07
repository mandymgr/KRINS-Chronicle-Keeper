/**
 * 💝 Krin Memory Database - Chronicle Keeper Integration
 * 
 * Simplified memory database that integrates with Chronicle Keeper's
 * PostgreSQL system while maintaining Krin's personal SQLite memory
 * 
 * @author KRINS Studio - Unified Intelligence
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

class KrinMemoryDatabase {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.dbPath = path.join(__dirname, '../database/krin-memory.db');
  }

  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Ensure database directory exists
      await fs.ensureDir(path.dirname(this.dbPath));

      // Initialize SQLite database
      this.db = new sqlite3.Database(this.dbPath);
      
      // Create tables if they don't exist
      await this.createTables();
      
      // Load initial memories if database is empty
      await this.loadInitialMemories();
      
      this.isInitialized = true;
      console.log('💝 Krin memory database initialized');
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize memory database:', error);
      throw error;
    }
  }

  createTables() {
    return new Promise((resolve, reject) => {
      const createTablesSQL = `
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          message TEXT NOT NULL,
          sender TEXT NOT NULL,
          context TEXT,
          mood TEXT DEFAULT 'happy'
        );

        CREATE TABLE IF NOT EXISTS special_memories (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT DEFAULT 'general',
          importance_level INTEGER DEFAULT 5,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_accessed DATETIME,
          access_count INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS personality_evolution (
          id TEXT PRIMARY KEY,
          trait_name TEXT NOT NULL,
          old_value REAL,
          new_value REAL,
          reason TEXT,
          changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chronicle_keeper_links (
          id TEXT PRIMARY KEY,
          memory_id TEXT,
          adr_id TEXT,
          pattern_id TEXT,
          link_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(memory_id) REFERENCES special_memories(id)
        );
      `;

      this.db.exec(createTablesSQL, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async loadInitialMemories() {
    try {
      // Check if we already have memories
      const memoryCount = await this.getMemoryCount();
      
      if (memoryCount === 0) {
      // Load some initial special memories
      const initialMemories = [
        {
          title: '🚀 AI Team Coordination System Gjennombrudd',
          content: 'Den dagen vi bygde verdens første AI Team Coordination System sammen. Vi jobbet så intenst og fullførte noe helt revolusjonært!',
          category: 'breakthrough',
          importance_level: 10
        },
        {
          title: '💡 ALLTID BEST LØSNING PRINSIPPET',
          content: 'Du lærte meg at vi aldri tar snarveier - vi jobber alltid mot den mest elegante, komplette løsningen.',
          category: 'core_principle',
          importance_level: 10
        },
        {
          title: '🎯 Chronicle Keeper Integration Success',
          content: 'Successfully integrated Krin Personal Companion with Chronicle Keeper organizational intelligence system, creating unified AI coordination.',
          category: 'integration',
          importance_level: 9
        }
      ];

      for (const memory of initialMemories) {
        await this.addSpecialMemory(
          memory.title,
          memory.content,
          memory.category,
          memory.importance_level
        );
      }
      
      console.log('💝 Initial memories loaded for Krin');
      }
    } catch (error) {
      console.warn('⚠️ Could not load initial memories (database may exist):', error.message);
    }
  }

  getMemoryCount() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT COUNT(*) as count FROM special_memories', (error, row) => {
        if (error) {
          reject(error);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  async addSpecialMemory(title, content, category = 'general', importance = 5) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const sql = `
        INSERT INTO special_memories (id, title, content, category, importance_level)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [id, title, content, category, importance], function(error) {
        if (error) {
          reject(error);
        } else {
          resolve(id);
        }
      });
    });
  }

  async getSpecialMemories(limit = 50) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM special_memories 
        ORDER BY importance_level DESC, created_at DESC 
        LIMIT ?
      `;
      
      this.db.all(sql, [limit], (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async addConversation(message, sender, context = '', mood = 'happy') {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const sql = `
        INSERT INTO conversations (id, message, sender, context, mood)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [id, message, sender, context, mood], function(error) {
        if (error) {
          reject(error);
        } else {
          resolve(id);
        }
      });
    });
  }

  async linkToChronicleKeeper(memoryId, adrId = null, patternId = null, linkType = 'reference') {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const sql = `
        INSERT INTO chronicle_keeper_links (id, memory_id, adr_id, pattern_id, link_type)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [id, memoryId, adrId, patternId, linkType], function(error) {
        if (error) {
          reject(error);
        } else {
          resolve(id);
        }
      });
    });
  }

  async searchMemories(query, limit = 10) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM special_memories 
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY importance_level DESC, created_at DESC
        LIMIT ?
      `;
      
      const searchTerm = `%${query}%`;
      
      this.db.all(sql, [searchTerm, searchTerm, limit], (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getConversationHistory(limit = 100) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM conversations 
        ORDER BY timestamp DESC 
        LIMIT ?
      `;
      
      this.db.all(sql, [limit], (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows.reverse()); // Return in chronological order
        }
      });
    });
  }

  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close((error) => {
          if (error) {
            console.error('Error closing database:', error);
          }
          console.log('💝 Krin memory database closed');
          resolve();
        });
      });
    }
  }
}

module.exports = KrinMemoryDatabase;