# Decisions

## 2026-11-03: ROOT CODEX workspace binding

Use ROOT CODEX topic `secure-channel` (`5854`) as the agent surface for this repository. Preserve the existing `master` default branch.

## 2026-11-03: Agent sender compatibility (pending security review)

Expose agent instructions in static HTML and `llms.txt`, and provide an offline,
dependency-free Node.js helper using native RSA-OAEP/SHA-256. Preserve the deployed
browser wire format; verify interoperability using the actual browser decryption
functions. Reject non-ASCII input rather than silently corrupting Unicode. Do not
repair malformed public keys. Return encrypted URLs through the conversation,
without adding a server, send API, or private-key handling. Keep these changes on
a nonpublishing branch until explicit review. A modern cryptographic format and
Unicode support need a separate reviewed migration.
