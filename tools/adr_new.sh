#!/usr/bin/env bash
set -euo pipefail

TITLE="${1:-Untitled decision}"
COMPONENT="${2:-unknown}"
ADR_DIR="docs/adr"
TEMPLATE="docs/adr/templates/ADR-template.md"

mkdir -p "$ADR_DIR"

# Finn neste nummer
next_number() {
  local last
  last=$(ls "$ADR_DIR"/ADR-*.md 2>/dev/null | sed -n 's/.*ADR-\([0-9][0-9]*\).*/\1/p' | sort -n | tail -1)
  if [[ -z "${last:-}" ]]; then
    echo "0001"
  else
    printf "%04d" $((10#$last + 1))
  fi
}

NUMBER=$(next_number)

# Lag filnavn (slug)
slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g'
}
SLUG=$(slugify "$TITLE")
DATE=$(date +%F)
OWNER=$(git config user.name || echo "owner")

OUT="$ADR_DIR/ADR-$NUMBER-$SLUG.md"

# Fyll mal
if [[ ! -f "$TEMPLATE" ]]; then
  echo "Mangler mal: $TEMPLATE" >&2
  exit 1
fi

sed \
  -e "s/{{NUMBER}}/$NUMBER/g" \
  -e "s/{{TITLE}}/$TITLE/g" \
  -e "s/{{DATE}}/$DATE/g" \
  -e "s/{{COMPONENT}}/$COMPONENT/g" \
  -e "s/{{OWNER}}/@${OWNER// /}/g" \
  "$TEMPLATE" > "$OUT"

echo "Opprettet $OUT"
