# 🧠 Krins Multi-Agent Orchestrator - Build System

.PHONY: zip clean help

# Default target
help:
	@echo "🧠 Krins Multi-Agent Orchestrator Build System"
	@echo ""
	@echo "Available commands:"
	@echo "  make zip    - Create krins-agent-archive.zip with complete system"
	@echo "  make clean  - Remove generated archives"
	@echo "  make help   - Show this help message"
	@echo ""
	@echo "📦 ZIP Creation:"
	@echo "  - Includes all essential files for complete system deployment"
	@echo "  - Excludes node_modules, .git, and other unnecessary files"
	@echo "  - Customize exclusions in scripts/make_zip.py"

zip:
	@echo "🚀 Creating Krins Agent Archive..."
	@python3 scripts/make_zip.py
	@echo "✅ Archive created: krins-agent-archive.zip"
	@echo "📦 Bundle ready for deployment!"

clean:
	@echo "🧹 Cleaning up generated files..."
	@rm -f *.zip
	@echo "✅ Cleanup complete!"