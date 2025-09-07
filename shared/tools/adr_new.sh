#!/usr/bin/env bash

# ADR Creation Script - Dev Memory OS
# Usage: ./adr_new.sh "ADR Title"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ADR_DIR="$PROJECT_ROOT/SHARED/docs/adr"
TEMPLATE_DIR="$ADR_DIR/templates"
TEMPLATE_FILE="$TEMPLATE_DIR/ADR-template.md"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_usage() {
    echo "Usage: $0 \"ADR Title\""
    echo "Example: $0 \"Use PostgreSQL for primary database\""
}

if [[ $# -ne 1 ]]; then
    echo -e "${RED}Error: Please provide an ADR title${NC}"
    print_usage
    exit 1
fi

ADR_TITLE="$1"

# Create ADR directory if it doesn't exist
mkdir -p "$ADR_DIR"
mkdir -p "$TEMPLATE_DIR"

# Create template if it doesn't exist
if [[ ! -f "$TEMPLATE_FILE" ]]; then
    echo -e "${YELLOW}Creating ADR template...${NC}"
    cat > "$TEMPLATE_FILE" << 'EOF'
# ADR-XXXX: [Title]

## Status
Proposed | Accepted | Rejected | Superseded | Deprecated

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

### Positive Consequences
- 

### Negative Consequences
- 

### Risks
- 

## Alternatives Considered
What other options were evaluated?

## References
- Link to relevant discussions
- Link to implementation PR
- Related ADRs
EOF
fi

# Find next ADR number
NEXT_NUM=1
if [[ -d "$ADR_DIR" ]]; then
    # Find existing ADRs and get the highest number
    for adr_file in "$ADR_DIR"/ADR-*.md; do
        if [[ -f "$adr_file" ]]; then
            filename=$(basename "$adr_file")
            if [[ $filename =~ ADR-([0-9]+) ]]; then
                num=${BASH_REMATCH[1]}
                if [[ $num -ge $NEXT_NUM ]]; then
                    NEXT_NUM=$((num + 1))
                fi
            fi
        fi
    done
fi

# Format number with leading zeros
ADR_NUM=$(printf "%04d" $NEXT_NUM)

# Create filename from title
ADR_FILENAME=$(echo "$ADR_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
ADR_FILE="$ADR_DIR/ADR-$ADR_NUM-$ADR_FILENAME.md"

# Create ADR from template
cp "$TEMPLATE_FILE" "$ADR_FILE"

# Replace placeholders
sed -i.bak "s/ADR-XXXX:/ADR-$ADR_NUM:/" "$ADR_FILE"
sed -i.bak "s/\[Title\]/$ADR_TITLE/" "$ADR_FILE"
rm "$ADR_FILE.bak"

echo -e "${GREEN}✅ Created ADR: $ADR_FILE${NC}"
echo -e "${BLUE}📝 Next steps:${NC}"
echo "   1. Edit the ADR to fill in the sections"
echo "   2. Change status from 'Proposed' to 'Accepted' when ready"
echo "   3. Commit the ADR to version control"

# Open in editor if available
if command -v code >/dev/null 2>&1; then
    code "$ADR_FILE"
elif command -v vim >/dev/null 2>&1; then
    echo -e "${BLUE}💡 Opening in vim...${NC}"
    vim "$ADR_FILE"
else
    echo -e "${YELLOW}⚠️  No editor found. Please manually edit: $ADR_FILE${NC}"
fi