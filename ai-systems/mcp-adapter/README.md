# @ai-team/mcp-adapter (Bun-first)

En enkel **MCP-stil** adapter som snakker JSON-RPC over **STDIN/STDOUT** og proxy'er kall til deres eksisterende **ToolingServer** (WS).

## Bruk
```bash
cp .env.example .env
bun install
bun src/server.ts   # dev
bun run build
mcp-adapter         # prod, leser fra stdin, skriver til stdout
```

## Eksempel
Send på stdin:
```json
{"id":"1","method":"read_file","params":{"path":"src/x.ts"}}
```
Svar på stdout:
```json
{"id":"1","ok":true,"result":{"content":"..."}} 
```
