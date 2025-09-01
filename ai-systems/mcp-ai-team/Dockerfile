# 🐳 MCP-AI-Team Docker Image
# Revolutionary AI Team Coordination - Built by Krin & Mandy
FROM oven/bun:1.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY src/ ./src/
COPY test/ ./test/
COPY start-*.js ./

# Expose ports
EXPOSE 3006 3007

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3006/health || exit 1

# Default command
CMD ["bun", "src/server.js"]