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
