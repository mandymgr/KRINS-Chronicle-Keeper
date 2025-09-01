# Domain Packs - Spesialiserte Utviklingsscenario

## 🎯 Konsept
Domain Packs utvider vår universale Krin AI-platform med domene-spesifikke:
- **Prompts**: Spesialiserte AI-instruksjoner for domenet
- **Blueprints**: Template-systemer tilpasset teknologi-stack
- **Evals**: Kvalitetsmålinger spesifikt for domenet
- **Guardrails**: Sikkerhet og compliance-sjekker

## 🏗️ Struktur
```
packs/
  realtime/          # HFT, gaming, robotikk
  safety_critical/   # Medisinsk, luftfart, automotive
  ml_product/        # AI/ML-heavy applications
  mobile_offline/    # Mobile, edge, offline-first
  enterprise/        # Finans, audit, compliance
  web3_crypto/       # Blockchain, DeFi, NFT
```

## 🚀 Aktivering
```bash
export KRINS_PACK=ml_product
python pipeline/orchestrator.py --pack ml_product
```

## 📊 Kriterier for Pack-valg
- **SLO-krav**: latency < 10ms → realtime pack
- **Safety**: menneskeliv → safety_critical pack  
- **Regulation**: GDPR/finans → enterprise pack
- **Resources**: mobil/IoT → mobile_offline pack
- **Domain**: AI/ML → ml_product pack