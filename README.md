# Dev Memory OS — Starter Repo

Dette er et minimalt, praktisk utgangspunkt for å fange beslutninger (ADR), patterns og runbooks — koblet til CI gjennom en enkel GitHub Action som krever ADR-referanse på store PR-er.

## Innhold
- `docs/adr/` — Arkitektur-beslutninger (ADRs)
- `docs/patterns/` — Gjenbrukbare «Pattern Cards» (multi-språk)
- `docs/runbooks/` — Operasjonelle runbooks
- `tools/adr_new.sh` — Rask CLI for å opprette nye ADR-filer fra mal
- `.github/workflows/adr-gate.yml` — CI-gate som krever ADR-lenke på store PR-er
- `.github/pull_request_template.md` — Mal som minner om ADR
- `CODEOWNERS` — Eierskap til patterns/områder

## Kom i gang
```bash
# 1) Gjør skript kjørbart
chmod +x tools/adr_new.sh

# 2) Opprett en ny ADR (titel valgfri)
./tools/adr_new.sh "Bruke pgvector for semantikk-søk" "platform/search"

# 3) Commit og push
git add .
git commit -m "chore: add ADR for pgvector"
git push
```

Skriptet genererer `docs/adr/ADR-XXXX-<slug>.md` basert på `docs/adr/templates/ADR-template.md` og fyller inn dato, nummer og eierskap.

## PR-policy (CI-gate)
- PR > 200 linjer (sum lagt til + fjernet) må inneholde en referanse til en ADR i PR-beskrivelsen, f.eks. `ADR-0007`.
- Juster terskel i `.github/workflows/adr-gate.yml` om ønskelig.

## Anbefalt arbeidsflyt
1. Start diskusjon i issue/Slack → lag ADR med `tools/adr_new.sh` (10-min-mal).
2. Knytt PR til ADR (legg referanse i PR-body).
3. Oppdater ADR med før/etter-målinger når endringen er i drift.
4. Om løsningen er generell: lag et `docs/patterns/*`-kort med kodeeksempler for flere språk.
5. Opprett/oppdater `docs/runbooks/*` for drift og feilhåndtering.

Lykke til — og husk: «Mean-Time-To-Explain» er en like viktig metrikk som «Mean-Time-To-Recover». :)
