# Secure Channel State

## Workspace

- Local repository: `/home/gnu/secure-channel`.
- Telegram: ROOT CODEX topic `secure-channel` (`5854`).
- Upstream: `git@github.com:guerrerocarlos/secure-channel.git` on `master`.

## Current Status

- GitHub Pages serves the repository root from `master` (legacy Pages build).
- Agent support includes static discovery, an agent guide, and an offline Node.js
  sender helper. On 2026-11-03, @guerrerocarlos explicitly approved merging and
  publishing PR #2 with "push and deploy!" after the security review request.
- Local tests verify helper replies against the unchanged browser decryption code
  with ephemeral keys and synthetic ASCII input. No real secret or recipient private
  key is used. Browser automation and real-recipient decryption remain unverified.
  Verify live static assets after each release as described in the runbook.
- Legacy limitations: 1024-bit RSA, independent OAEP blocks, broken Unicode decoding,
  and browser-local private keys. The helper preserves the format and rejects Unicode.
- The recipient link pasted in the task had a malformed PEM footer; request a fresh
  browser-generated link for actual use. Do not persist that recipient's key here.

## Copy-safe recipient links (pending explicit review)

- Branch `fix/copy-safe-recipient-links` shares only the URL-encoded base64 SPKI
  body in `pub`, avoiding PEM delimiter punctuation. Existing localStorage keys,
  recipient IDs, encryption, and reply URLs are preserved.
- Browser and offline helper accept compact links and valid legacy PEM links.
  Invalid browser links show an error. Copy recipient link has clipboard success
  feedback and manual-copy guidance when clipboard access fails.
- First-visit key storage now completes before navigation to the share URL.
- Ten local tests pass, including browser-script integration in a simulated DOM,
  clipboard outcomes, old/new link compatibility, and decryption. Real-browser
  clipboard behavior and Telegram transport remain manual acceptance checks.
- Explicit review is required before merging or deploying this key-link change.
