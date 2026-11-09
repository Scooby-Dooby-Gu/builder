# State machines

Lifecycles that used to be spread across booleans and string literals live here
as pure, typed state machines. Each file has no runtime dependencies, so it runs
in the browser, in API routes and under `npm test`.

| Machine | File | Used by |
|---|---|---|
| Document save and publish | `document.ts` | builder toolbar, autosave, variant badges (`store/slices/builderSlice.ts`, `components/builder/useDraftAndPublish.ts`) |
| Component publication status | `componentStatus.ts` | API (`lib/server/components.ts`), library badges, builder |
| Live data source connection test | `connectionTest.ts` | `components/datasources/ConnectDatasourceForm.tsx` |

To change behavior, change the reducer and its tests in `machines.test.ts`, not
the components. Components only send events and render derived values
(`statusLine`, `publishBlocker`, `variantStatuses`, …).

## Observable states

Every lifecycle is reflected in a stable `data-*` attribute, for tests, scripts
and agents. Wait on these instead of timeouts or text.

| Attribute | Element | Values |
|---|---|---|
| `data-load-state` | component page wrapper | `loading`, `ready`, `error` |
| `data-editor-state` | builder canvas | `unloaded`, `starting`, `initialized`, `ready` |
| `data-save-state` | builder publish controls | `clean`, `dirty`, `saving`, `error` |
| `data-publish-state` | builder publish controls | `unpublished`, `changed`, `published`, `publishing` |
| `data-publish-state` | library status badge | `unpublished`, `changed`, `published` |
| `data-variant-state` | variant badge | `unpublished`, `changed`, `published`, `removed` |
| `data-connection-state` | connect data source form | `idle`, `testing`, `passed`, `stale`, `failed`, `saving` |
| `data-state` | `<builder-component>` embed | `loading`, `ready`, `error` |

## Vocabulary

One set of words everywhere: **Not published**, **Unpublished changes**,
**Published**. The server stores `new` / `changed` / `published` (kept for
existing data); `toPublicationStatus` maps them. Whether something changed is
decided by content fingerprints (`variantFingerprints`), not timestamps, so
undoing an edit back to the live version reads as published again.
