ACTION: ship

Round 2 — architecture phase. Both round-1 defects resolved precisely; the 16 accepted tasks were left
untouched (no churn), no accepted decision re-litigated, no new defect introduced.

Verified fixes:
- **Defect 1 (blocking) — users substrate.** 0015 now adds a minimal `users` table + `App\Models\User`:
  UUIDv7 PK, `tenant_id?` (super NULL per the platform-table exception), `unique(email, tenant_id)` (never
  `email` alone), `use HasTenant` + Sanctum `HasApiTokens`; `user_roles.user_id` is a real FK to `users`;
  acceptance updated to "all five tables" + clean `migrate:rollback`. A binding scope guard fences auth flows,
  token↔tenant binding, the `Context`-populating middleware, and seeding to the downstream Identity system
  (AGENTX.md §2), which extends this same table additively. 0017's acceptance now mounts on that concrete
  `User` and is satisfiable. 0018 correctly left untouched — the actor it gates now exists.
- **Defect 2 — 0019 gate reachability.** A binding "Gate reachability" section now requires the demonstrator to
  register + grant `allow_likes` via the 0017 write surface within its own path before asserting a like, and to
  assert the closed (denied) case. No dependency on a downstream seeder.

Delta seam check: `users.tenant_id?` + `HasTenant` is the known platform-nullable-row interaction (handled by
model config, not by weakening the fail-closed scope — already a flagged watch-point for execution review);
`personal_access_tokens` already exists so `HasApiTokens` is functional; the `user_roles`→`users` FK is additive
within one migration set; Identity extends additively (no recreate collision). Integrates cleanly.

The breakdown is complete, ordered (0001–0019), minimal, non-overlapping, and contract-compliant — every task
carries path, public interface, invariants, testable acceptance, and deliverable type. The only thing not
self-certifiable here is post-execution gate-green; that is the executors' phase. Proceed to tasks.

Carried-forward backlog item (for the journey summary, NOT this run): the downstream Identity system —
auth flows, Sanctum token↔tenant binding, the `Context`-populating panel/tenant middleware, and
permission/role seeding. Already captured by AGENTX.md §2; no new requirement file needed.
