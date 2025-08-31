# Pattern: CI/CD Gate Pattern
**Når bruke:** For å sikre dokumentasjon ved store endringer (>200 linjer)  •  **Ikke bruk når:** Små bugfixes eller typos  •  **Kontekst:** @automation/@governance

## Steg-for-steg
1) Definer terskel for når gate skal aktiveres (f.eks. >200 linjer endret)
2) Implementer automatisk sjekk i CI/CD pipeline
3) Krev spesifikk formatering i PR-beskrivelse (f.eks. ADR-XXXX)
4) Blokker merge hvis krav ikke er oppfylt
5) Gi klare feilmeldinger med instruksjoner for å løse

## Språkvarianter
### GitHub Actions (Workflow)
```yaml
name: ADR Gate
on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  adr-gate:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Check PR size and ADR reference
      run: |
        ADDITIONS=${{ github.event.pull_request.additions }}
        DELETIONS=${{ github.event.pull_request.deletions }}
        TOTAL=$((ADDITIONS + DELETIONS))
        
        if [ $TOTAL -gt 200 ]; then
          if ! grep -q "ADR-[0-9]" <<< "${{ github.event.pull_request.body }}"; then
            echo "❌ Store PR-er (>200 linjer) må referere til en ADR"
            exit 1
          fi
        fi
```

### GitLab CI (.gitlab-ci.yml)
```yaml
adr_gate:
  stage: validate
  script:
    - |
      CHANGES=$(git diff --stat HEAD~1 | tail -1 | grep -o '[0-9]\+ insertions\|[0-9]\+ deletions' | awk '{sum+=$1} END {print sum}')
      if [ "$CHANGES" -gt 200 ] && ! echo "$CI_MERGE_REQUEST_DESCRIPTION" | grep -q "ADR-[0-9]"; then
        echo "❌ Store MR-er må referere til ADR"
        exit 1
      fi
  only:
    - merge_requests
```

### Azure DevOps (Pipeline)
```yaml
trigger: none
pr:
  branches:
    include:
    - main

jobs:
- job: ADRGate
  displayName: 'Check ADR Reference'
  steps:
  - powershell: |
      $additions = $(System.PullRequest.AddedLines)
      $deletions = $(System.PullRequest.DeletedLines)
      if (($additions + $deletions) -gt 200 -and "$(System.PullRequest.PullRequestDescription)" -notmatch "ADR-\d+") {
        Write-Error "Store PR-er må referere til ADR"
        exit 1
      }
```

## Ytelse/Sikkerhet
Gate-pattern sikrer compliance uten manuell overhead; reduserer risiko for udokumenterte arkitekturbeslutninger; automatiserer governance.

## Observability
Spor: Gate-trigger-rate, compliance-rate, false-positive-rate. Logg når gates blokkerer PR-er og årsaken.

## Vanlige feil / Anti-mønstre
- For strenge terskler som frustrerer utviklere
- Dårlige feilmeldinger som ikke forklarer hvordan man løser
- Gates som ikke kan bypasses i nødstilfeller
- Ikke oppdatere team når gate-regler endres