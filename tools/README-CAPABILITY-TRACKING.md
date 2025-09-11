# 📈 KRINS Capability Tracking System

**Automatisk logging og sporing av nye funksjoner med datostempel**

## 🎯 Oversikt

Dette systemet lar deg enkelt legge til nye capabilities i KRINS-CAPABILITIES.md med automatisk datostempel og riktig kategorisering. Det sikrer at all funksjonalitet blir dokumentert kronologisk og konsistent.

## 🚀 Quick Start

### Legge til ny capability
```bash
# Via pnpm (anbefalt)
pnpm -w run capability:add "Function Name" "Description" "category" "file/location"

# Via Node.js direkte  
node tools/add-capability.js "Function Name" "Description" "category" "file/location"

# Eksempel
pnpm -w run capability:add "Voice Interface" "Speech-based interaction with AI" "interface" "voice-system/"
```

### Liste opp nylige tillegg
```bash
pnpm -w run capability:list
```

### Vise hjelp
```bash
pnpm -w run capability:help
```

## 📋 Kategorier

| Kategori | Beskrivelse | Emoji |
|----------|-------------|-------|
| `decision` | Core decision management features | 📋 |
| `governance` | CI/CD and governance processes | 🔄 |
| `knowledge` | Knowledge organization systems | 📚 |
| `ai` | AI integration and intelligence | 🤖 |
| `collaboration` | Team collaboration features | 👥 |
| `analytics` | Analytics and organizational intelligence | 📊 |
| `interface` | Web interface and frontend | 🌐 |
| `integration` | System integration and automation | ⚙️ |
| `infrastructure` | Infrastructure and deployment | 🏗️ |
| `testing` | Testing and quality assurance | 🧪 |
| `platform` | Cross-platform capabilities | 📱 |

## 💡 Eksempler

### Grunnleggende bruk
```bash
# Legg til ny AI-funksjon
pnpm -w run capability:add "ML Prediction Engine" "Custom trained models for decision outcomes" "ai"

# Legg til frontend-feature
pnpm -w run capability:add "Dark Mode Toggle" "Theme switching for user interface" "interface" "frontend/src/components/"

# Legg til integrasjon
pnpm -w run capability:add "Slack Notifications" "Real-time team notifications" "integration" "tools/slack-bot.js"
```

### Med spesifikk filplassering
```bash
pnpm -w run capability:add "Advanced Search" "Semantic search with AI filtering" "knowledge" "src/search/semantic-engine.ts"
```

## 🔧 Tekniske detaljer

### Hva skjer når du legger til en capability?

1. **Automatisk datostempel** - Bruker dagens dato (YYYY-MM-DD format)
2. **Kategori validering** - Sjekker at kategorien er gyldig
3. **Riktig plassering** - Finner riktig seksjon i KRINS-CAPABILITIES.md
4. **Tabell insertion** - Legger til ny rad i riktig tabell
5. **Metadata oppdatering** - Oppdaterer "Sist oppdatert" dato øverst i filen

### Filformat i KRINS-CAPABILITIES.md
```markdown
| **Function Name** | ✅ YYYY-MM-DD | Description | `file/location` |
```

### Script filer
- `add-capability.js` - Hovedscript for å legge til capabilities
- `update-capabilities.sh` - Bash-versjon (backup)
- `README-CAPABILITY-TRACKING.md` - Denne dokumentasjonen

## 📊 Workflow Integration

### Git Integration
```bash
# Etter å ha lagt til capability
git add KRINS-CAPABILITIES.md
git commit -m "📈 Add capability: Function Name"

# Eller bruk suggested commit message fra scriptet
```

### Claude Instruks Integration
Dette systemet er integrert i `CLAUDE.md` instruksene:

```markdown
**ALLTID oppdater `KRINS-CAPABILITIES.md` når du:**
- Implementerer nye funksjoner eller capabilities
- Forbedrer eksisterende systemer 
- Lanserer nye AI-agenter eller komponenter
- Deployer nye integrasjoner eller workflows
- Fullfører milestone features
```

### Package.json Scripts
```json
{
  "capability:add": "node tools/add-capability.js",
  "capability:list": "node tools/add-capability.js --list", 
  "capability:help": "node tools/add-capability.js --help"
}
```

## 🎯 Best Practices

### Funksjonsnavn
- Bruk beskrivende navn: "Advanced Search" ikke "Search"
- Vær spesifikk: "Voice Interface" ikke "UI Update"
- Bruk konsistent navngivning på tvers av lignende funksjoner

### Beskrivelser  
- Klar og konsis (40-60 tegn ideelt)
- Fokuser på verdi/formål, ikke teknisk implementasjon
- Unngå interne kodeord eller forkortelser

### Filplasseringer
- Bruk relative paths fra root: `src/components/`
- Inkluder filnavn hvis spesifikt: `src/auth/login.ts`
- Bruk `Implementation location` hvis ukjent

### Kategorisering
- Velg mest passende primærkategori
- Ved tvil, bruk `integration` for tverrgående funksjoner
- Nye kategorier kan legges til ved behov

## 🔍 Debugging & Troubleshooting

### Common Issues

**Script finds ikke KRINS-CAPABILITIES.md**
```bash
# Sjekk at du er i riktig directory
pwd
ls -la KRINS-CAPABILITIES.md
```

**Kategori ikke funnet**
```bash
# Se gyldige kategorier
pnpm -w run capability:help
```

**Permission denied**
```bash
# Sjekk permissions på script
chmod +x tools/add-capability.js
```

### Manuell reparasjon
Hvis automatisk insertion feiler, kan du manuelt legge til linjen:
```markdown
| **Function Name** | ✅ 2025-09-11 | Description | `location` |
```

## 🚀 Future Enhancements

### Planlagte forbedringer
- [ ] **Bulk import** - Importer flere capabilities fra fil
- [ ] **Template support** - Pre-defined templates for vanlige typer
- [ ] **Validation rules** - Strengere validering av input
- [ ] **History tracking** - Changelog for capability endringer
- [ ] **Integration med ADR** - Automatisk kobling til beslutninger

### Integration muligheter
- **GitHub Actions** - Automatisk capability detection fra commits
- **AI Analysis** - Intelligent kategorisering basert på kodeanalyse
- **Slack Notifications** - Team notifications ved nye capabilities
- **Dashboard Views** - Web interface for capability management

---

## 📞 Support

For spørsmål eller problemer:
1. Sjekk denne dokumentasjonen
2. Kjør `pnpm -w run capability:help`
3. Se KRINS-CAPABILITIES.md for eksempler
4. Opprett issue i repository

---

**🎯 Keep your capabilities documented - Keep your system growing!**

*Sist oppdatert: 2025-09-11 | System versjon: 1.0*