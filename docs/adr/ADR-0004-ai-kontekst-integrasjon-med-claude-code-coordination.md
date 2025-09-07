# ADR-0004: AI-kontekst integrasjon med Claude-Code-Coordination
**Dato:** 2025-01-17  "  **Komponent:** platform/ai  "  **Eier:** @mandymarigjervikrygg

## Problem
AI-kodegeneratorer mangler kontekst om team-beslutninger og arkitekturstandarder, noe som fører til inkonsistent kode som ikke følger etablerte patterns. Utviklere må manuelt korrigere AI-generert kode for å matche arkitektur-beslutninger (ADRs).

Målbare symptomer:
- 60% av AI-generert kode krever arkitektur-review og omskriving
- 3-5 timer ukentlig brukt på å justere AI-output til team-standarder
- Inkonsistente teknologivalg på tvers av AI-genererte komponenter

## Alternativer
1) **ADR-aware AI integration**  Koble Claude-Code-Coordination til ADR-repository for automatisk kontekst-lesing
   - Fordeler: Konsistent kode, automatisk compliance, redusert review-tid
   - Ulemper: Avhengighet mellom systemer, kompleksitet i implementasjon
   
2) **Manual AI prompting**  Kopiere ADR-innhold manuelt inn i AI-prompts
   - Fordeler: Enkel implementasjon, full kontroll
   - Ulemper: Tidkrevende, feilprone, ikke skalerbart
   
3) **Do nothing**  Fortsette med manuelle korreksjoner av AI-output
   - Konsekvens: Fortsatt høy review-overhead, arkitektur-drift, redusert AI-verdi

## Beslutning
Valgt: **ADR-aware AI integration**. 

Begrunnelse: Automatisk kontekst-lesing fra ADRs vil redusere review-tid med estimert 70% og sikre arkitektur-compliance fra første generering. Risiko mitigeres ved fallback til manual prompting hvis integrasjon feiler.

Rollback-plan: Hvis integrasjon medfører >10% redusert AI-responstid eller hyppige feil, reverter vi til manual prompting innen 2 uker.

## Evidens (før/etter)
Før: 60% av AI-kode krever review, 3-5t ukentlig korreksjonstid  
Etter (forventet): <30% review-rate, <1t ukentlig korreksjonstid, 100% ADR-compliance i AI-output

## Lenker
Implementasjon: claude-code-coordination/packages/ai-core/src/adr-context-reader.ts  
Repository: https://github.com/mandymgr/claude-code-coordination  
Demo: packages/ai-core/src/test-adr-integration.js  
Dokumentasjon: README.md#adr-aware-architecture-intelligence