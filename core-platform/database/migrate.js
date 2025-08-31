/**
 * Database Migration System for Dev Memory OS
 * Railway-compatible PostgreSQL migrations with pgvector support
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class DatabaseMigrator {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || this.buildConnectionString(),
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    }

    buildConnectionString() {
        const {
            DB_HOST = 'localhost',
            DB_PORT = '5432',
            DB_USER = 'devmemory',
            DB_PASSWORD = 'devmemory_secure_password_2024',
            DB_NAME = 'dev_memory_os'
        } = process.env;

        return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    }

    async createMigrationsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                checksum VARCHAR(64)
            );
        `;

        await this.pool.query(query);
        console.log('✅ Migrations table ready');
    }

    async getExecutedMigrations() {
        try {
            const result = await this.pool.query(
                'SELECT filename FROM migrations ORDER BY id'
            );
            return result.rows.map(row => row.filename);
        } catch (error) {
            if (error.code === '42P01') { // Table doesn't exist
                await this.createMigrationsTable();
                return [];
            }
            throw error;
        }
    }

    async executeMigration(filename, content) {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Execute migration SQL
            await client.query(content);
            
            // Record migration as executed
            await client.query(
                'INSERT INTO migrations (filename) VALUES ($1)',
                [filename]
            );
            
            await client.query('COMMIT');
            console.log(`✅ Migration executed: ${filename}`);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async runMigrations() {
        console.log('🚀 Starting database migrations...');
        
        const migrationsDir = path.join(__dirname, 'migrations');
        
        try {
            // Ensure migrations directory exists
            await fs.access(migrationsDir);
        } catch {
            console.log('📁 Creating migrations directory...');
            await fs.mkdir(migrationsDir, { recursive: true });
        }

        // Get executed migrations
        const executedMigrations = await this.getExecutedMigrations();
        
        // Get all migration files
        const migrationFiles = await fs.readdir(migrationsDir);
        const sqlFiles = migrationFiles
            .filter(file => file.endsWith('.sql'))
            .sort();

        if (sqlFiles.length === 0) {
            console.log('📄 No migration files found. Running initial schema...');
            await this.runInitialSchema();
            return;
        }

        // Execute pending migrations
        const pendingMigrations = sqlFiles.filter(
            file => !executedMigrations.includes(file)
        );

        if (pendingMigrations.length === 0) {
            console.log('✅ All migrations up to date');
            return;
        }

        console.log(`📋 Found ${pendingMigrations.length} pending migrations`);

        for (const filename of pendingMigrations) {
            const filePath = path.join(migrationsDir, filename);
            const content = await fs.readFile(filePath, 'utf8');
            
            console.log(`⚡ Executing migration: ${filename}`);
            await this.executeMigration(filename, content);
        }

        console.log('🎉 All migrations completed successfully');
    }

    async runInitialSchema() {
        console.log('🔧 Running initial schema setup...');
        
        const schemaPath = path.join(__dirname, 'init.sql');
        
        try {
            const schema = await fs.readFile(schemaPath, 'utf8');
            await this.executeMigration('000_initial_schema.sql', schema);
            
            // Run seed data if available
            const seedPath = path.join(__dirname, 'seed.sql');
            try {
                const seedData = await fs.readFile(seedPath, 'utf8');
                await this.executeMigration('001_seed_data.sql', seedData);
                console.log('🌱 Seed data applied');
            } catch (seedError) {
                console.log('ℹ️  No seed data found, continuing...');
            }
            
        } catch (error) {
            console.error('❌ Failed to run initial schema:', error);
            throw error;
        }
    }

    async resetDatabase() {
        console.log('⚠️  RESETTING DATABASE - This will delete all data!');
        
        const client = await this.pool.connect();
        
        try {
            // Drop all tables
            const dropTablesQuery = `
                DROP SCHEMA public CASCADE;
                CREATE SCHEMA public;
                GRANT ALL ON SCHEMA public TO postgres;
                GRANT ALL ON SCHEMA public TO public;
            `;
            
            await client.query(dropTablesQuery);
            console.log('🗑️  All tables dropped');
            
            // Recreate extensions
            await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
            await client.query('CREATE EXTENSION IF NOT EXISTS "vector"');
            console.log('🔧 Extensions recreated');
            
        } catch (error) {
            console.error('❌ Failed to reset database:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async checkDatabaseConnection() {
        try {
            const result = await this.pool.query('SELECT NOW() as current_time');
            console.log('✅ Database connection successful');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    async checkExtensions() {
        try {
            const result = await this.pool.query(`
                SELECT extname 
                FROM pg_extension 
                WHERE extname IN ('uuid-ossp', 'vector')
            `);
            
            const extensions = result.rows.map(row => row.extname);
            
            if (extensions.includes('uuid-ossp')) {
                console.log('✅ uuid-ossp extension available');
            } else {
                console.log('⚠️  uuid-ossp extension missing');
            }
            
            if (extensions.includes('vector')) {
                console.log('✅ vector extension available');
            } else {
                console.log('⚠️  vector extension missing - semantic search will be limited');
            }
            
            return extensions;
        } catch (error) {
            console.error('❌ Failed to check extensions:', error);
            return [];
        }
    }

    async close() {
        await this.pool.end();
    }
}

// CLI interface
async function main() {
    const migrator = new DatabaseMigrator();
    
    try {
        const args = process.argv.slice(2);
        
        // Check database connection
        const isConnected = await migrator.checkDatabaseConnection();
        if (!isConnected) {
            process.exit(1);
        }
        
        // Check extensions
        await migrator.checkExtensions();
        
        if (args.includes('--reset')) {
            await migrator.resetDatabase();
            await migrator.runMigrations();
        } else {
            await migrator.runMigrations();
        }
        
    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    } finally {
        await migrator.close();
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = DatabaseMigrator;