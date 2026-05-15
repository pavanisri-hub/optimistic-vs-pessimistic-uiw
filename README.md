# Optimistic vs Pessimistic UI

A side-by-side benchmark of two React Query update strategies, backed by a
fully mocked API (MSW) with configurable latency and failure injection.

## Overview

Two feeds render the same data through the same mock API but use opposite
mutation strategies:

| Feed         | Strategy                                          |
|--------------|---------------------------------------------------|
| Pessimistic  | Wait for the server, then update the UI           |
| Optimistic   | Update the cache instantly, roll back on failure  |

A control panel injects latency (100 / 300 / 500 / 1000 ms) and failure rate
(0 / 50 / 100 %) into the shared MSW handlers at runtime so you can feel the
difference without restarting anything.

## Architecture

```
src/
  api/         fetch wrappers (postsApi)
  components/  presentational PostCard
  config/      shared networkConditions object + subscribers
  features/    ControlPanel, PessimisticFeed, OptimisticFeed
  hooks/       usePessimisticPosts, useOptimisticPosts (React Query)
  mocks/       in-memory db + MSW handlers + browser worker bootstrap
  utils/       window.testHarness installer
  routes/      TanStack Router route tree (single page)
```

- **Pessimistic** uses plain `useMutation` + `invalidateQueries` on success.
- **Optimistic** uses the full `cancelQueries` → `getQueryData` →
  `setQueryData` → rollback-on-error → `invalidateQueries`-on-settled flow,
  preventing flashes via `cancelQueries`.
- Query keys are isolated: `['pessimistic-posts']` vs `['optimistic-posts']`.

## Setup

```bash
bun install      # or: npm install
bun run dev      # http://localhost:5173
```

## Docker

```bash
docker compose up --build
# open http://localhost:3000
```

The compose file exposes a single service with a `/` healthcheck.

## Testing / Test Harness

The app exposes `window.testHarness` once MSW is online:

```js
window.testHarness.setNetworkConditions({ latency: 1000, failureRate: 0.5 })
window.testHarness.getPostState('optimistic', '1')
// => { likeCount, likedByUser, isVisible }
window.testHarness.clickButton('optimistic', '1', 'like')
window.testHarness.resetFeed()
```

Stable selectors:
- `[data-testid="pessimistic-feed"]` / `[data-testid="optimistic-feed"]`
- `[data-testid="post-<id>"]`
- `[data-testid="like-button"]` / `[data-testid="delete-button"]`
- `[data-testid="like-count"]`

## Folder Structure

See *Architecture* above. Each module has a single responsibility; mutation
logic is defined once per strategy in its own hook and reused by the feed.
