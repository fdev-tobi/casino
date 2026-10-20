# Value system integration

This document describes how a later stage can connect an authorized value source. The current lobby does not call Elvebredd or any other external value service. Match values, pots, and standings come from `src/lib/mock-data.ts`.

## Current boundary

- Interface: `src/lib/integrations/value-provider.ts`
- Selection: `getValueProvider()` returns the in-file mock adapter only
- Lobby pages do not call the provider yet; they read local mock records so the UI stays independent of any vendor

The provider interface is intentionally small:

- `getItemValuation(externalId)`

Unavailable figures and upstream errors belong in the result type. The interface does not assume a public Elvebredd API, a response schema, or an authentication scheme.

`server-only` guards the provider module so a secret-bearing adapter cannot be imported into a client component.

## What was checked

The public Elvebredd homepage describes Adopt Me value lists and a value calculator, and it points support to Discord. That page does not document a public API, authentication method, permitted automated use, or rate limits. No endpoints were guessed from that page, and no protected route was requested.

## Before a live adapter

Stop and confirm all of the following with the provider:

1. There is an official or otherwise authorized integration method.
2. The current documentation, authentication requirements, and rate limits are known.
3. The client has permission to use that method for this product.
4. Credentials can be stored as server-side environment variables and are absent from `NEXT_PUBLIC_*` variables and client bundles.
5. The response fields that map to item identity and value are documented by the provider.

If that method does not exist, do not scrape the site, do not bypass access controls, and do not invent endpoints. Report the limitation and leave the mock provider in place.

## Product boundary

Even after a value source is connected, Join / Create / Upgrade / Race actions must not imply real deposits, withdrawals, or live wagers until licensing, jurisdiction, and security requirements are approved.
