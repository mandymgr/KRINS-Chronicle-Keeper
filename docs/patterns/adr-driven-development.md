# Pattern: ADR-Driven Development
**Når bruke:** Ved arkitekturbeslutninger som påvirker flere team/komponenter  •  **Ikke bruk når:** Småendringer som kun påvirker lokal kode  •  **Kontekst:** @team/@crossfunctional

## Steg-for-steg
1) Identifiser en betydelig arkitekturbeslutning som må tas
2) Lag ADR med `./tools/adr_new.sh "Beslutningstittel" "område"`
3) Fyll ut ADR-malen med kontekst, alternativer og konsekvenser
4) Review ADR med relevante team/eksperter
5) Implementer løsningen og oppdater ADR med resultater

## Språkvarianter
### Shell Script (Automation)
```bash
# Opprett ny ADR automatisk
./tools/adr_new.sh "Bruke Redis for caching" "platform/cache"
git add docs/adr/
git commit -m "chore: add caching ADR"
```

### GitHub Actions (CI Integration)
```yaml
# Sjekk at store PR-er har ADR-referanse
- name: Check ADR reference
  if: github.event.pull_request.additions + github.event.pull_request.deletions > 200
  run: |
    grep -q "ADR-[0-9]" <<< "${{ github.event.pull_request.body }}"
```

### Markdown Template
```markdown
# ADR-XXXX: [Tittel]
**Status:** Proposed | Accepted | Rejected | Superseded
**Dato:** YYYY-MM-DD
**Eiere:** @team

## Kontekst
Hva er situasjonen og hvorfor trengs denne beslutningen?

## Beslutning
Hva har vi bestemt?

## Konsekvenser
Positive og negative utfall av beslutningen.
```

## Ytelse/Sikkerhet
Reduserer teknisk gjeld ved å dokumentere rasjonale; minimerer risiko for uintenderte arkitekturendringer; sikrer at beslutninger kan revideres og forstås senere.

## Observability
Spor: ADR-opprettelse, review-tid, implementering-til-ADR-oppdatering. Nøkkelmetrikker: Mean-Time-To-Explain, beslutnings-coverage.

## Vanlige feil / Anti-mønstre
- Skrive ADR etter implementering (bør skrives før/under)
- For detaljerte ADR-er som aldri oppdateres
- Ikke involvere relevante stakeholders i review
- Glemme å oppdatere ADR med faktiske resultater