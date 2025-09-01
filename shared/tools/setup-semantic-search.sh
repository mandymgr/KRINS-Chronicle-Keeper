#!/bin/bash

# Dev Memory OS - Semantic Search Setup Script
# Sets up PostgreSQL with pgvector and initializes the semantic search system

set -e

echo "🌟 === DEV MEMORY OS SEMANTIC SEARCH SETUP ==="
echo "Setting up PostgreSQL with pgvector for semantic search..."
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="dev_memory_os"
DB_USER="devmemory"
DB_PASSWORD="devmemory_secure_password_2024"
DB_HOST="localhost"
DB_PORT="5432"

# Check if PostgreSQL is running
echo -e "${BLUE}🔍 Checking PostgreSQL installation...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL not found. Please install PostgreSQL first.${NC}"
    echo "On macOS: brew install postgresql"
    echo "On Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL found${NC}"

# Check if PostgreSQL service is running
echo -e "${BLUE}🔍 Checking if PostgreSQL is running...${NC}"
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
        brew services start postgresql
        sleep 3
    else
        echo -e "${RED}❌ Please start PostgreSQL manually${NC}"
        echo "On macOS: brew services start postgresql"
        echo "On Ubuntu: sudo service postgresql start"
        exit 1
    fi
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Create database user if not exists
echo -e "${BLUE}🔧 Setting up database user...${NC}"
psql postgres -tc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1 || {
    echo "Creating user $DB_USER..."
    psql postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    psql postgres -c "ALTER USER $DB_USER CREATEDB;"
}

echo -e "${GREEN}✅ Database user ready${NC}"

# Create database if not exists
echo -e "${BLUE}🔧 Setting up database...${NC}"
psql postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || {
    echo "Creating database $DB_NAME..."
    createdb -O $DB_USER $DB_NAME
}

echo -e "${GREEN}✅ Database ready${NC}"

# Check for pgvector extension
echo -e "${BLUE}🔍 Checking for pgvector extension...${NC}"
if ! psql -d $DB_NAME -c "SELECT 1 FROM pg_available_extensions WHERE name = 'vector'" | grep -q 1; then
    echo -e "${YELLOW}⚠️  pgvector extension not found.${NC}"
    echo -e "${BLUE}📦 Installing pgvector...${NC}"
    
    if command -v brew &> /dev/null; then
        echo "Installing pgvector via Homebrew..."
        brew install pgvector
    else
        echo -e "${RED}❌ Please install pgvector extension manually${NC}"
        echo "Visit: https://github.com/pgvector/pgvector for installation instructions"
        exit 1
    fi
fi

# Initialize database schema
echo -e "${BLUE}🔧 Initializing database schema...${NC}"
if [ -f "database/init-simple.sql" ]; then
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/init-simple.sql
    echo -e "${GREEN}✅ Database schema initialized (simplified without pgvector)${NC}"
    echo -e "${YELLOW}💡 For full semantic search, install pgvector extension as superuser${NC}"
else
    echo -e "${RED}❌ database/init-simple.sql not found${NC}"
    exit 1
fi

# Check if OpenAI API key is set
echo -e "${BLUE}🔍 Checking OpenAI API key...${NC}"
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  OpenAI API key not found in environment${NC}"
    echo "Please set your OpenAI API key:"
    echo "export OPENAI_API_KEY='your-api-key-here'"
    echo
    echo "You can still test the database setup without it."
else
    echo -e "${GREEN}✅ OpenAI API key configured${NC}"
fi

# Install Node.js dependencies
echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
npm install --silent

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Test database connection
echo -e "${BLUE}🧪 Testing database connection...${NC}"
cat > test_db_connection.js << 'EOF'
const { initializeDatabase } = require('./src/database/connection');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const db = await initializeDatabase();
        
        const result = await db.query('SELECT version() as version, current_database() as database');
        console.log('✅ Database connection successful!');
        console.log(`Database: ${result.rows[0].database}`);
        console.log(`PostgreSQL Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
        
        // Test pgvector extension
        const vectorTest = await db.query('SELECT 1 FROM pg_extension WHERE extname = $1', ['vector']);
        if (vectorTest.rows.length > 0) {
            console.log('✅ pgvector extension is available');
        } else {
            console.log('❌ pgvector extension not found');
        }
        
        // Test sample vector operation
        try {
            await db.query('SELECT ARRAY[1,2,3]::vector(3) <-> ARRAY[1,2,4]::vector(3) as distance');
            console.log('✅ Vector operations working');
        } catch (error) {
            console.log('❌ Vector operations failed:', error.message);
        }
        
        await db.close();
        console.log('✅ Database connection test completed successfully');
        
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        process.exit(1);
    }
}

testConnection();
EOF

node test_db_connection.js
rm test_db_connection.js

# Create .env template
echo -e "${BLUE}📝 Creating .env template...${NC}"
cat > .env.template << EOF
# Dev Memory OS - Environment Configuration

# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Database Configuration (optional - defaults provided)
DB_HOST=localhost
DB_PORT=5432
DB_USER=devmemory
DB_PASSWORD=devmemory_secure_password_2024
DB_NAME=dev_memory_os

# Server Configuration
PORT=3003
NODE_ENV=development

# Production Security (set for production deployment)
# API_KEY=your-production-api-key
EOF

echo -e "${GREEN}✅ .env template created${NC}"

echo
echo -e "${GREEN}🎉 === SETUP COMPLETED SUCCESSFULLY! ==="
echo -e "${NC}"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Set your OpenAI API key:"
echo "   export OPENAI_API_KEY='your-api-key-here'"
echo
echo "2. Start the semantic search server:"
echo "   npm run semantic-server:dev"
echo
echo "3. Process existing ADRs (in another terminal):"
echo "   npm run process-adrs:dry    # Dry run first"
echo "   npm run process-adrs        # Process for real"
echo
echo "4. Test the API:"
echo "   curl http://localhost:3003/health"
echo
echo -e "${BLUE}🔗 Important URLs:${NC}"
echo "• Semantic Search Server: http://localhost:3003"
echo "• Health Check: http://localhost:3003/health"
echo "• API Documentation: http://localhost:3003/"
echo
echo -e "${YELLOW}📖 For detailed usage, see: src/README.md${NC}"
echo
echo -e "${GREEN}🚀 Ready for revolutionary semantic search!${NC}"