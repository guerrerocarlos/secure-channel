# Secure Channel State

## Workspace

- Local repository: `/home/gnu/secure-channel`.
- Telegram: ROOT CODEX topic `secure-channel` (`5854`).
- Upstream: `git@github.com:guerrerocarlos/secure-channel.git` on `master`.

## Current Status

- GitHub Pages serves the repository root from `master` (legacy Pages build).
- `feat/agent-friendly` adds static agent discovery, an agent guide, and an offline
  Node.js sender helper. Explicit security review is pending before merge/deployment.
- Local tests verify helper replies against the unchanged browser decryption code
  with ephemeral keys and synthetic ASCII input. No real secret or recipient private
  key is used. Browser automation and live deployment remain unverified.
- Legacy limitations: 1024-bit RSA, independent OAEP blocks, broken Unicode decoding,
  and browser-local private keys. The helper preserves the format and rejects Unicode.
- The recipient link pasted in the task had a malformed PEM footer; request a fresh
  browser-generated link for actual use. Do not persist that recipient's key here.
