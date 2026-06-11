# Currency — multi-currency display

## The money shape (never violated)

Money is always `{ amount, currency }` where `amount` is an integer in
minor units (cents, piasters). Floats never represent money — not in
transport, not in state, not in math. Arithmetic on money happens in
`lib/num` money helpers on integers only.

## Base vs display

- The store has one **base currency** in which all amounts are stored
  and charged: `[OPERATOR INPUT]` (assume `USD` until confirmed).
- Users pick a **display currency** (v1 set: `USD`, `EGP`, `SAR`
  `[OPERATOR INPUT]`); the choice persists in a cookie and applies
  everywhere amounts render.
- Conversion is display-only convenience: converted values are marked
  approximate in the UI; orders, refunds, and reports always show the
  base-currency amount alongside.

## Exchange rates

- Source: the backend exposes `GET /exchange-rates` (cached, refreshed
  server-side) `[OPERATOR INPUT]` confirm endpoint and refresh cadence.
- The frontend treats rates as read-only data with normal TanStack
  caching — never hardcodes a rate, never fetches a third-party rate
  API directly.

## Formatting

- Rendering goes through the next-intl/`Intl` number formatter with
  `style: "currency"` — symbol placement, separators, and Arabic
  numeral forms come from the locale, never from string concatenation.
- Rounding for display: round half-up to the currency's minor-unit
  precision; the backend owns any rounding that affects what is
  charged.
- Inputs (price fields) accept and display in the field's declared
  currency only — no silent conversion on input.
