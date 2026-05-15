# Results

## Benchmark observations

With MSW latency at 1000 ms and failure rate at 0 %:

- **Pessimistic** — clicking Like shows a spinner for ~1 s before the count
  changes. Delete keeps the post on screen until the server confirms.
- **Optimistic** — the like count flips and the post disappears within
  ~16 ms (one render frame), independent of latency.

With failure rate at 100 %:

- **Pessimistic** never mutates the UI; an error toast appears after the
  latency window.
- **Optimistic** flips the UI instantly, then rolls back to the snapshot
  taken in `onMutate` and shows a "rolled back" toast.

## Comparison

| Metric                       | Pessimistic UI                  | Optimistic UI                          |
|------------------------------|----------------------------------|-----------------------------------------|
| Perceived latency            | == network latency               | ~0 ms                                   |
| Code complexity              | Low (mutate + invalidate)        | Higher (cancel + snapshot + rollback)   |
| Risk on failure              | None — UI never lied             | UI must roll back + notify the user     |
| Best for slow networks       | Feels broken                     | Feels native                            |
| Race-condition surface       | Small                            | Real — must `cancelQueries` first       |
| Server-of-truth display      | Always accurate                  | Eventually accurate (after `onSettled`) |

## Decision rubric

| Action                      | Recommended       | Why                                                                 |
|-----------------------------|-------------------|---------------------------------------------------------------------|
| Liking a photo              | **Optimistic**    | Tiny side effect, idempotent-ish, instant feedback expected         |
| Submitting a comment        | **Optimistic**    | High-frequency action; render with a "pending" state, rollback rare |
| Deleting an account         | **Pessimistic**   | Destructive + irreversible; user must see real server confirmation  |
| Sending a chat message      | **Optimistic**    | Latency dominates UX; show with greyed bubble until ack             |
| Making a purchase           | **Pessimistic**   | Money + legal contract; never claim success before the server does  |

Rule of thumb: **optimistic for cheap, reversible interactions; pessimistic
for anything destructive, financial, or legally binding.**
