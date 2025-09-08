# ADR-0001: Eksempel — pgvector for semantikk-søk
**Dato:** 2025-08-27  •  **Komponent:** platform/search  •  **Eier:** @owner

## Problem
Vi trenger semantisk søk i dokumenter/PR-diffs uten å kjøpe separat søketjeneste. Fuzzy-treff i FTS gir for dårlig recall.

## Alternativer
1) Postgres + pgvector — innebygd, enkel drift, moderat ytelse
2) Elasticsearch + dense vectors — sterkere søk, mer drift
3) Do nothing — behold FTS, lavere kvalitet på treff

## Beslutning
Valgt: pgvector. Begrunnelse: lav driftskost, tilstrekkelig presisjon/recall for MVP. Rollback: migrér embeddings-tabeller til ES om presisjon < terskel.

## Evidens (før/etter)
Før: top-5 recall 42% (manuell eval) • Etter: forventet 70%+ (A/B under utrulling)

## Lenker
PR: #123  •  Runbook: /docs/runbooks/search-ingest.md  •  Metrikker: Grafana:search:recall  •  Issue: #77
