#!/bin/bash

# 🚀 KRINS Capabilities Tracker - Automated Feature Logging
# Automatisk oppdatering av KRINS-CAPABILITIES.md med nye funksjoner og dato

set -e

# Farger for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Standard paths
CAPABILITIES_FILE="../KRINS-CAPABILITIES.md"
BACKUP_DIR="../_capabilities_backup"

# Sjekk at vi er i riktig directory
if [[ ! -f "$CAPABILITIES_FILE" ]]; then
    echo -e "${RED}❌ Error: KRINS-CAPABILITIES.md not found!${NC}"
    echo "Run this script from the tools/ directory"
    exit 1
fi

# Funksjon for å vise hjelpetekst
show_help() {
    echo -e "${BLUE}🚀 KRINS Capabilities Tracker${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS] <function_name> <description> <category>"
    echo ""
    echo "CATEGORIES:"
    echo "  decision      - Core decision management features"
    echo "  governance    - CI/CD and governance processes" 
    echo "  knowledge     - Knowledge organization systems"
    echo "  ai            - AI integration and intelligence"
    echo "  collaboration - Team collaboration features"
    echo "  analytics     - Analytics and organizational intelligence"
    echo "  interface     - Web interface and frontend"
    echo "  integration   - System integration and automation"
    echo "  infrastructure- Infrastructure and deployment"
    echo "  testing       - Testing and quality assurance"
    echo "  platform      - Cross-platform capabilities"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help    Show this help message"
    echo "  -l, --list    List recent capability additions"
    echo "  -b, --backup  Create backup before updating"
    echo "  -d, --date    Specify custom date (YYYY-MM-DD)"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 \"Advanced ML Prediction\" \"Custom trained models for decision outcomes\" \"ai\""
    echo "  $0 -d \"2025-09-15\" \"Voice Interface\" \"New voice-based interaction system\" \"interface\""
    echo "  $0 -l  # List recent additions"
}

# Funksjon for å lise nylige tillegg
list_recent() {
    echo -e "${BLUE}📊 Recent Capability Additions:${NC}"
    echo ""
    
    # Find linjer som inneholder datoer i siste 30 dager
    current_date=$(date +%Y-%m-%d)
    month_ago=$(date -d '30 days ago' +%Y-%m-%d 2>/dev/null || date -v-30d +%Y-%m-%d)
    
    grep -n "✅.*20[0-9][0-9]-" "$CAPABILITIES_FILE" | tail -10 | while read line; do
        echo "  $line"
    done
    
    echo ""
    echo -e "${GREEN}💡 Tip: Use -h for help on adding new capabilities${NC}"
}

# Funksjon for å lage backup
create_backup() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    backup_file="$BACKUP_DIR/capabilities-backup-$(date +%Y%m%d-%H%M%S).md"
    cp "$CAPABILITIES_FILE" "$backup_file"
    echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
}

# Funksjon for å mappe kategori til riktig seksjon
get_section_header() {
    case $1 in
        "decision")
            echo "## 📋 **CORE DECISION MANAGEMENT**"
            ;;
        "governance") 
            echo "## 🔄 **ADVANCED GOVERNANCE & PROCESS**"
            ;;
        "knowledge")
            echo "## 📚 **COMPREHENSIVE KNOWLEDGE ORGANIZATION**"
            ;;
        "ai")
            echo "## 🤖 **NEXT-GENERATION AI INTEGRATION**"
            ;;
        "collaboration")
            echo "## 👥 **ENTERPRISE TEAM COLLABORATION**"
            ;;
        "analytics")
            echo "## 📊 **ORGANIZATIONAL INTELLIGENCE & ANALYTICS**"
            ;;
        "interface")
            echo "## 🌐 **MODERN WEB INTERFACE**"
            ;;
        "integration")
            echo "## ⚙️ **INTEGRATION & AUTOMATION**"
            ;;
        "infrastructure")
            echo "## 🏗️ **PRODUCTION-READY INFRASTRUCTURE**"
            ;;
        "testing")
            echo "## 🧪 **TESTING & QUALITY ASSURANCE**"
            ;;
        "platform")
            echo "## 📱 **CROSS-PLATFORM CAPABILITIES**"
            ;;
        *)
            echo "## 🎯 **KOMMENDE FUNKSJONER**"
            ;;
    esac
}

# Funksjon for å legge til ny capability
add_capability() {
    local function_name="$1"
    local description="$2" 
    local category="$3"
    local date="$4"
    
    echo -e "${BLUE}🔄 Adding new capability...${NC}"
    echo "  Function: $function_name"
    echo "  Description: $description"
    echo "  Category: $category"
    echo "  Date: $date"
    echo ""
    
    # Lag backup hvis ønsket
    if [[ "$BACKUP_ENABLED" == "true" ]]; then
        create_backup
    fi
    
    # Find riktig seksjon
    section_header=$(get_section_header "$category")
    
    # Opprett ny tabell rad
    table_row="| **$function_name** | ✅ $date | $description | Implementation location |"
    
    # Find seksjon i filen og legg til ny rad
    # Dette er en forenklet implementasjon - i virkeligheten ville vi bruke mer sofistikert parsing
    
    # Lag en midlertidig fil med den nye capability
    temp_file=$(mktemp)
    
    # Les gjennom filen og legg til den nye capability
    found_section=false
    while IFS= read -r line; do
        echo "$line" >> "$temp_file"
        
        # Hvis vi finner riktig seksjon, legg til ny rad etter første tabell header
        if [[ "$line" == *"$section_header"* ]]; then
            found_section=true
        elif [[ "$found_section" == "true" && "$line" == *"|----------|"* ]]; then
            echo "$table_row" >> "$temp_file"
            found_section=false
        fi
    done < "$CAPABILITIES_FILE"
    
    # Erstatt original fil
    mv "$temp_file" "$CAPABILITIES_FILE"
    
    # Oppdater "Sist oppdatert" dato øverst i filen
    sed -i.bak "s/\*\*Sist oppdatert:\*\* [0-9-]*/\*\*Sist oppdatert:\*\* $date/" "$CAPABILITIES_FILE"
    rm "$CAPABILITIES_FILE.bak"
    
    echo -e "${GREEN}✅ Capability added successfully!${NC}"
    echo -e "${YELLOW}📝 Remember to update implementation location in KRINS-CAPABILITIES.md${NC}"
    echo ""
    echo -e "${BLUE}🔗 Quick actions:${NC}"
    echo "  - Commit changes: git add KRINS-CAPABILITIES.md && git commit -m \"📈 Add new capability: $function_name\""
    echo "  - View file: less KRINS-CAPABILITIES.md"
}

# Parse command line argumenter
BACKUP_ENABLED=false
CUSTOM_DATE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -l|--list)
            list_recent
            exit 0
            ;;
        -b|--backup)
            BACKUP_ENABLED=true
            shift
            ;;
        -d|--date)
            CUSTOM_DATE="$2"
            shift 2
            ;;
        -*)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
        *)
            break
            ;;
    esac
done

# Sjekk at vi har nok argumenter
if [[ $# -lt 3 ]]; then
    echo -e "${RED}❌ Error: Missing required arguments${NC}"
    echo ""
    show_help
    exit 1
fi

# Hent argumenter
FUNCTION_NAME="$1"
DESCRIPTION="$2"
CATEGORY="$3"

# Sett dato - bruk custom eller dagens dato
if [[ -n "$CUSTOM_DATE" ]]; then
    # Valider dato format
    if ! date -d "$CUSTOM_DATE" >/dev/null 2>&1 && ! date -j -f "%Y-%m-%d" "$CUSTOM_DATE" >/dev/null 2>&1; then
        echo -e "${RED}❌ Invalid date format. Use YYYY-MM-DD${NC}"
        exit 1
    fi
    DATE="$CUSTOM_DATE"
else
    DATE=$(date +%Y-%m-%d)
fi

# Valider kategori
valid_categories=("decision" "governance" "knowledge" "ai" "collaboration" "analytics" "interface" "integration" "infrastructure" "testing" "platform" "future")
if [[ ! " ${valid_categories[@]} " =~ " ${CATEGORY} " ]]; then
    echo -e "${YELLOW}⚠️  Warning: '$CATEGORY' is not a standard category${NC}"
    echo "Valid categories: ${valid_categories[*]}"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 1
    fi
fi

# Legg til ny capability
add_capability "$FUNCTION_NAME" "$DESCRIPTION" "$CATEGORY" "$DATE"

# Git integration (valgfritt)
if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
    echo -e "${BLUE}📊 Git Status:${NC}"
    git status --porcelain KRINS-CAPABILITIES.md
    echo ""
    echo -e "${GREEN}💡 Ready to commit your changes!${NC}"
fi