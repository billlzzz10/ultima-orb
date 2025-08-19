---
# Codacy Rules
Configuration for AI behavior when interacting with Codacy's MCP Server

## CRITICAL: After ANY successful `edit_file` or `reapply` operation
- YOU MUST IMMEDIATELY run the `codacy_cli_analyze` tool from Codacy's MCP Server for each file that was edited, with:
  - `rootPath`: set to the workspace path
  - `file`: set to the edited file

## Quick project overview
- Type: Obsidian plugin scaffold (TypeScript, strict). Entry: `main.ts` → bundled to `main.js` by `esbuild.config.mjs`.
- Layout: `src/settings`, `src/services`, `src/providers`, `src/views`, `src/rag`.
- Startup flow: `main.ts` initializes Logger, EventsBus, StorageService, loads settings and instantiates `ProviderManager`, then registers views.

## High-impact files & workflows
- `esbuild.config.mjs`: watch/build behavior and externals — keep `obsidian` (and editor libs) externalized.
- `main.ts`: DEFAULT_SETTINGS (provider endpoints, RAG chunk.topK) and lifecycle wiring.
- `package.json` scripts: `npm run dev` (esbuild watch), `npm run build` (tsc check + esbuild prod), `npx tsc --noEmit` (quick type-check).

## Conventions & patterns
- TypeScript `strict: true`: prefer explicit types; avoid implicit `any`.
- Event bus: `src/services/events.ts` for cross-component pub/sub; StorageService wraps Obsidian storage API.
- ProviderManager receives settings.apiKeys and endpoints; providers (Ollama/LM Studio) are local by default.
- RAG defaults in `main.ts` are authoritative: chunk.size=1200, overlap=200, topK=5.

## Before and after edits (required checklist)
1. Read `esbuild.config.mjs` and `main.ts` before touching build/runtime wiring.
2. Run `npx tsc --noEmit` (type check).
3. Run `npm run dev` (watch) or `npm run build` (prod) to validate output.
4. Immediately run `codacy_cli_analyze` for each edited file; if deps changed, run with `tool: "trivy"`.

## Examples
- Keep `obsidian` external in esbuild:
  `external: ["obsidian", "electron", ...builtins]`
- RAG defaults in `main.ts`:
  `chunk: { size: 1200, overlap: 200 }, topK: 5`
---