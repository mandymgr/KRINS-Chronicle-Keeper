/**
 * 🧠 AI Memory Service - Revolutionary Persistent Memory System
 * Enables continuous learning and memory across AI specialist sessions
 */

import { v4 as uuidv4 } from 'uuid';
import { query } from '../database/db.js';

export class AIMemoryService {
  constructor() {
    this.sessionId = uuidv4();
    this.activeSpecialists = new Map();
    console.log(`🧠 AI Memory Service initialized - Session: ${this.sessionId}`);
  }

  /**
   * Store specialist memory - Persistent across sessions
   */
  async storeSpecialistMemory(specialistId, role, name, memoryType, key, data, contextTags = []) {
    try {
      const result = await query(`
        INSERT INTO ai_specialist_memories (
          specialist_id, specialist_role, specialist_name, memory_type, 
          memory_key, memory_data, context_tags, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (specialist_id, memory_key) 
        DO UPDATE SET 
          memory_data = $6, 
          context_tags = $7, 
          access_count = ai_specialist_memories.access_count + 1,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [specialistId, role, name, memoryType, key, JSON.stringify(data), contextTags]);

      console.log(`🧠 Memory stored: ${name} (${role}) - ${memoryType}:${key}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Failed to store memory for ${name}:`, error.message);
      throw error;
    }
  }

  /**
   * Retrieve specialist memories - Load from persistent storage
   */
  async getSpecialistMemories(specialistId, memoryType = null, limit = 100) {
    try {
      let sql = `
        SELECT specialist_role, specialist_name, memory_type, memory_key, 
               memory_data, context_tags, access_count, last_accessed_at, 
               created_at, updated_at
        FROM ai_specialist_memories 
        WHERE specialist_id = $1
      `;
      const params = [specialistId];

      if (memoryType) {
        sql += ` AND memory_type = $2`;
        params.push(memoryType);
        sql += ` ORDER BY updated_at DESC LIMIT $3`;
        params.push(limit);
      } else {
        sql += ` ORDER BY updated_at DESC LIMIT $2`;
        params.push(limit);
      }

      const result = await query(sql, params);
      
      // Update access count for retrieved memories
      await query(`
        UPDATE ai_specialist_memories 
        SET access_count = access_count + 1, last_accessed_at = CURRENT_TIMESTAMP
        WHERE specialist_id = $1
      `, [specialistId]);

      console.log(`🧠 Retrieved ${result.rows.length} memories for specialist ${specialistId}`);
      return result.rows.map(row => ({
        ...row,
        memory_data: row.memory_data
      }));
    } catch (error) {
      console.error(`❌ Failed to retrieve memories for ${specialistId}:`, error.message);
      return [];
    }
  }

  /**
   * Store performance history - Track improvement over time
   */
  async storePerformanceHistory(specialistId, role, metrics) {
    try {
      await query(`
        INSERT INTO ai_performance_history (
          specialist_id, specialist_role, tasks_completed, success_rate,
          average_response_time, specialty_score, session_id, recorded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      `, [
        specialistId, role, metrics.tasksCompleted, metrics.successRate,
        metrics.averageResponseTime, metrics.specialtyScore, this.sessionId
      ]);

      console.log(`📊 Performance history stored for ${role} specialist`);
    } catch (error) {
      console.error(`❌ Failed to store performance history:`, error.message);
    }
  }

  /**
   * Get performance trends - Analyze improvement over time
   */
  async getPerformanceTrends(specialistId, days = 30) {
    try {
      const result = await query(`
        SELECT specialist_role, tasks_completed, success_rate, 
               average_response_time, specialty_score, recorded_at,
               ROW_NUMBER() OVER (PARTITION BY DATE(recorded_at) ORDER BY recorded_at DESC) as rn
        FROM ai_performance_history 
        WHERE specialist_id = $1 
          AND recorded_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
        ORDER BY recorded_at DESC
      `, [specialistId]);

      // Get only the latest record per day to show trends
      const trends = result.rows.filter(row => row.rn === 1);
      console.log(`📈 Retrieved ${trends.length} days of performance trends`);
      return trends;
    } catch (error) {
      console.error(`❌ Failed to get performance trends:`, error.message);
      return [];
    }
  }

  /**
   * Store task learning - What specialist learned from task
   */
  async storeTaskLearning(specialistId, role, task, result, learnings) {
    try {
      await query(`
        INSERT INTO ai_task_learnings (
          specialist_id, specialist_role, task_id, task_type, task_description,
          patterns_applied, success, lessons_learned, knowledge_gained, 
          applied_optimizations, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      `, [
        specialistId, role, task.id, task.type, task.description,
        result.patterns_applied || [], result.success !== false, 
        learnings.lessons || [], learnings.knowledge || '', 
        learnings.optimizations || []
      ]);

      console.log(`🎓 Task learning stored: ${role} - ${task.type}`);
    } catch (error) {
      console.error(`❌ Failed to store task learning:`, error.message);
    }
  }

  /**
   * Get accumulated learnings - All knowledge gained over time
   */
  async getAccumulatedLearnings(specialistId, taskType = null, limit = 50) {
    try {
      let sql = `
        SELECT task_type, task_description, patterns_applied, success,
               lessons_learned, knowledge_gained, applied_optimizations, created_at
        FROM ai_task_learnings 
        WHERE specialist_id = $1
      `;
      const params = [specialistId];

      if (taskType) {
        sql += ` AND task_type = $2`;
        params.push(taskType);
        sql += ` ORDER BY created_at DESC LIMIT $3`;
        params.push(limit);
      } else {
        sql += ` ORDER BY created_at DESC LIMIT $2`;
        params.push(limit);
      }

      const result = await query(sql, params);
      console.log(`🎓 Retrieved ${result.rows.length} learning records`);
      return result.rows;
    } catch (error) {
      console.error(`❌ Failed to get accumulated learnings:`, error.message);
      return [];
    }
  }

  /**
   * Store collaboration history - Inter-specialist communication
   */
  async storeCollaboration(fromSpecialistId, toSpecialistId, fromRole, toRole, messageType, content, context = {}) {
    try {
      const result = await query(`
        INSERT INTO ai_collaboration_history (
          from_specialist_id, to_specialist_id, from_specialist_role, to_specialist_role,
          message_type, message_content, context_data, session_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        RETURNING id
      `, [fromSpecialistId, toSpecialistId, fromRole, toRole, messageType, content, JSON.stringify(context), this.sessionId]);

      console.log(`💬 Collaboration stored: ${fromRole} → ${toRole || 'broadcast'}`);
      return result.rows[0].id;
    } catch (error) {
      console.error(`❌ Failed to store collaboration:`, error.message);
    }
  }

  /**
   * Get collaboration history - Past communications for context
   */
  async getCollaborationHistory(specialistId, limit = 100) {
    try {
      const result = await query(`
        SELECT from_specialist_role, to_specialist_role, message_type, 
               message_content, context_data, created_at
        FROM ai_collaboration_history 
        WHERE from_specialist_id = $1 OR to_specialist_id = $1
        ORDER BY created_at DESC 
        LIMIT $2
      `, [specialistId, limit]);

      console.log(`💬 Retrieved ${result.rows.length} collaboration records`);
      return result.rows.map(row => ({
        ...row,
        context_data: row.context_data
      }));
    } catch (error) {
      console.error(`❌ Failed to get collaboration history:`, error.message);
      return [];
    }
  }

  /**
   * Register specialist session - Track when specialist comes online
   */
  async registerSpecialistSession(specialistId, role, name, capabilities) {
    try {
      await query(`
        INSERT INTO ai_specialist_sessions (
          session_id, specialist_id, specialist_role, specialist_name,
          status, capabilities, startup_time, last_activity_at
        ) VALUES ($1, $2, $3, $4, 'active', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (session_id, specialist_id) 
        DO UPDATE SET 
          status = 'active',
          last_activity_at = CURRENT_TIMESTAMP
      `, [this.sessionId, specialistId, role, name, capabilities]);

      this.activeSpecialists.set(specialistId, { role, name, lastActivity: new Date() });
      console.log(`✅ Specialist session registered: ${name} (${role})`);
    } catch (error) {
      console.error(`❌ Failed to register specialist session:`, error.message);
    }
  }

  /**
   * Update specialist activity - Keep track of when specialist was last active
   */
  async updateSpecialistActivity(specialistId, status = 'active') {
    try {
      await query(`
        UPDATE ai_specialist_sessions 
        SET status = $1, last_activity_at = CURRENT_TIMESTAMP
        WHERE session_id = $2 AND specialist_id = $3
      `, [status, this.sessionId, specialistId]);

      if (this.activeSpecialists.has(specialistId)) {
        this.activeSpecialists.get(specialistId).lastActivity = new Date();
      }
    } catch (error) {
      console.error(`❌ Failed to update specialist activity:`, error.message);
    }
  }

  /**
   * Load specialist context - Restore memories and context on startup
   */
  async loadSpecialistContext(specialistId) {
    try {
      console.log(`🔄 Loading context for specialist: ${specialistId}`);

      // Load all types of memories
      const [memories, performanceHistory, learnings, collaborations] = await Promise.all([
        this.getSpecialistMemories(specialistId),
        this.getPerformanceTrends(specialistId, 7), // Last 7 days
        this.getAccumulatedLearnings(specialistId, null, 20), // Last 20 learnings
        this.getCollaborationHistory(specialistId, 50) // Last 50 collaborations
      ]);

      const context = {
        memories: this.organizeMemoriesByType(memories),
        recentPerformance: performanceHistory[0] || null,
        performanceTrends: performanceHistory,
        recentLearnings: learnings.slice(0, 10),
        allLearnings: learnings,
        recentCollaborations: collaborations.slice(0, 20),
        collaborationHistory: collaborations,
        lastSession: await this.getLastSession(specialistId)
      };

      console.log(`✅ Context loaded: ${memories.length} memories, ${learnings.length} learnings, ${collaborations.length} collaborations`);
      return context;
    } catch (error) {
      console.error(`❌ Failed to load specialist context:`, error.message);
      return { memories: {}, recentPerformance: null, recentLearnings: [], allLearnings: [], recentCollaborations: [], collaborationHistory: [] };
    }
  }

  /**
   * Organize memories by type for easier access
   */
  organizeMemoriesByType(memories) {
    const organized = {
      projects: new Map(),
      patterns: new Map(), 
      decisions: new Map(),
      learnings: new Map(),
      collaborations: new Map(),
      metrics: new Map()
    };

    memories.forEach(memory => {
      if (organized[memory.memory_type]) {
        organized[memory.memory_type].set(memory.memory_key, memory.memory_data);
      }
    });

    return organized;
  }

  /**
   * Get last session info for specialist
   */
  async getLastSession(specialistId) {
    try {
      const result = await query(`
        SELECT specialist_role, specialist_name, status, startup_time, 
               shutdown_time, total_tasks_completed, session_performance
        FROM ai_specialist_sessions 
        WHERE specialist_id = $1 
        ORDER BY startup_time DESC 
        LIMIT 1
      `, [specialistId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error(`❌ Failed to get last session:`, error.message);
      return null;
    }
  }

  /**
   * Shutdown specialist session - Clean shutdown with memory persistence
   */
  async shutdownSpecialistSession(specialistId, finalMetrics) {
    try {
      await query(`
        UPDATE ai_specialist_sessions 
        SET status = 'offline', shutdown_time = CURRENT_TIMESTAMP,
            total_tasks_completed = $1, session_performance = $2
        WHERE session_id = $3 AND specialist_id = $4
      `, [finalMetrics.tasksCompleted, JSON.stringify(finalMetrics), this.sessionId, specialistId]);

      this.activeSpecialists.delete(specialistId);
      console.log(`👋 Specialist session closed: ${specialistId}`);
    } catch (error) {
      console.error(`❌ Failed to shutdown specialist session:`, error.message);
    }
  }

  /**
   * Get team memory summary - Overview of all specialists' accumulated knowledge
   */
  async getTeamMemorySummary() {
    try {
      const summary = await query(`
        SELECT 
          COUNT(DISTINCT specialist_id) as total_specialists,
          COUNT(*) as total_memories,
          COUNT(DISTINCT memory_type) as memory_types,
          AVG(access_count) as avg_access_count,
          MAX(updated_at) as last_memory_update
        FROM ai_specialist_memories
      `);

      const collaborationStats = await query(`
        SELECT 
          COUNT(*) as total_collaborations,
          COUNT(DISTINCT message_type) as message_types,
          MAX(created_at) as last_collaboration
        FROM ai_collaboration_history
      `);

      const learningStats = await query(`
        SELECT 
          COUNT(*) as total_learnings,
          COUNT(DISTINCT task_type) as task_types_learned,
          AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as overall_success_rate
        FROM ai_task_learnings
      `);

      return {
        memory: summary.rows[0],
        collaboration: collaborationStats.rows[0], 
        learning: learningStats.rows[0],
        sessionId: this.sessionId,
        activeSpecialists: this.activeSpecialists.size
      };
    } catch (error) {
      console.error(`❌ Failed to get team memory summary:`, error.message);
      return null;
    }
  }
}

// Singleton instance for the application
export const aiMemoryService = new AIMemoryService();