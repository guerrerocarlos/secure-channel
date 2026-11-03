# Decisions

## 2026-11-03: ROOT CODEX workspace binding

Use ROOT CODEX topic `secure-channel` (`5854`) as the agent surface for this repository. Preserve the existing `master` default branch.

## 2026-11-03: Agent sender compatibility

Expose agent instructions in static HTML and `llms.txt`, and provide an offline,
dependency-free Node.js helper using native RSA-OAEP/SHA-256. Preserve the deployed
browser wire format; verify interoperability using the actual browser decryption
functions. Reject non-ASCII input rather than silently corrupting Unicode. Do not
repair malformed public keys. Return encrypted URLs through the conversation,
without adding a server, send API, or private-key handling. Keep these changes on
a nonpublishing branch until explicit review. On 2026-11-03, @guerrerocarlos
approved merging and publishing PR #2 in response to the explicit review request.
A modern cryptographic format and Unicode support need a separate reviewed migration.

## 2026-11-03: Copy-safe public-key transport (pending explicit review)

Encode only the standard base64 SPKI body in the existing `pub` query parameter
using URLSearchParams. This eliminates PEM hyphen runs and newlines from newly
shared URLs. Reconstruct the original PEM serialization on input to preserve
localStorage lookups and recipient IDs. Keep valid PEM links compatible; reject
damaged or ambiguous input rather than guessing key bytes. Add an explicit copy
button. Preserve encryption and private-key storage formats. Deploy only after
explicit review of this concrete change.
