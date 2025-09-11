# Krin UI + IPC — Bun Edition

Dette er en Bun-optimalisert pakke for Krin sitt editorial (Kinfolk/Rum) UI + Electron IPC mot `krin`-CLI.

- **Bun brukes til alt av install/build/dev scripts** (`bun install`, `bunx`, `bun run`).
- **Electron kjører fortsatt på Node under panseret** (det er slik Electron fungerer), men du styrer alt via Bun.

## Installer
```bash
bun install
```

## Kjør utvikling
```bash
bun run dev        # starter Electron
# i en annen terminal (valgfritt, hvis du vil bygge Tailwind manuelt):
bun run build:css
```

## Forutsetning
- `krin`-CLI må ligge i PATH (eller bytt `exe` i `src/main/krinProcess.js`).

## Notater
- IPC wiring bruker `child_process.spawn` (Electron kjører på Node).
- UI bruker design tokens (`tokens.css`) + Tailwind + enkle React-komponenter.
