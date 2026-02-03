Issue: chii depends on deprecated `koa-router` (v13.x)

Summary:
- The dependency `chii` (v1.15.5) depends on `koa-router` (^13.0.1).
- `koa-router` is deprecated in favor of `@koa/router`.

Impact:
- This repo has a transitive dependency on `koa-router` via `chii` which causes deprecation warnings.

Suggested actions:
1. Open an upstream issue / PR on the `chii` repository requesting migration to `@koa/router` (or bump to a version that has done so).
2. As a temporary workaround, consider forking `chii` and updating its dependency to `@koa/router`, run tests and publish a patch.
3. Optionally use `patch-package` to apply a local fix until upstream accepts the change (this requires updating `node_modules` and committing patches).

Suggested PR content for `chii` (conceptual):
- Replace `require('koa-router')` with `require('@koa/router')` and update any API differences.
- Update `package.json` dependency from `"koa-router": "^13.0.1"` to `"@koa/router": "^10.0.0"` (verify compatible semver).
- Add tests to ensure router behavior remains unchanged.

Notes:
- `koa-router` and `@koa/router` are similar but not identical; test coverage on route handling is required before merging.

References:
- npm deprecation note: `koa-router@13.1.1: Please use @koa/router instead, starting from v9!`

Prepared-by: GitHub Copilot
