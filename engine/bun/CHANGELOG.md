# Engine changelog

## 0.1.0 (2026-10-13)

### bun
- permissions DSL, keyed failure messages, rule issues, write outbox, failure hook (bb2d1ba)
- the shared TypeScript foundation — 20 packages, forms, device, permissions-ready ports (047168c)

### context
- list fields in forms (3d15ced)
- queue undeliverable writes through the outbox (cc2ce99)

### form
- object fields under dotted names, and autosave (6ab4191)

### observe
- one trace through the socket, and a meter per operation (e900350)

### spec
- contracts.options.insecure gates cleartext transports (61333f7)

### validate
- zod/mini behind the classic chain (b8ac004)
