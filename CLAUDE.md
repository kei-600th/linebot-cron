# CLAUDE.md
必ず日本語で回答してください。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` or `npm start` - starts Wrangler dev server
- **Deploy to Cloudflare**: `npm run deploy` - deploys the Worker to Cloudflare
- **Run tests**: `npm test` - runs Vitest test suite with Cloudflare Workers pool

## Project Architecture

This is a **Cloudflare Worker** project built for cron-based LINE bot functionality. The architecture follows Cloudflare Workers patterns:

### Core Structure
- **Entry point**: `src/index.js` - exports default object with `fetch()` handler
- **Worker handler**: Uses the standard `async fetch(request, env, ctx)` signature
- **Configuration**: `wrangler.jsonc` - Cloudflare Workers configuration
- **Testing**: Uses Vitest with `@cloudflare/vitest-pool-workers` for Worker environment testing

### Key Files
- `src/index.js` - Main Worker script with fetch handler
- `wrangler.jsonc` - Worker deployment and runtime configuration
- `vitest.config.js` - Test configuration using Workers pool
- `test/index.spec.js` - Unit and integration tests

### Testing Environment
- Tests run in actual Cloudflare Workers environment via Vitest pool
- Supports both unit-style tests (with mocked context) and integration-style tests
- Uses `cloudflare:test` utilities for creating execution contexts

### Deployment Context
- Targets Cloudflare Workers runtime
- Configured for observability and monitoring
- Ready for environment variables and bindings (currently commented in config)