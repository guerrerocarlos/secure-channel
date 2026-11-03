# Secure Channel Runbook

## Safety

- Do not store keys, messages, or credentials in Git or Telegram.
- Review cryptographic and key-management changes before deployment.
- Verify the applicable test and build commands before making application changes.

## Workspace Checks

```bash
git status --short
git fetch origin
git status -sb
```

## Agent sender and verification

Node.js 22 or newer, no package installation or build step:

```bash
node --test tests/*.test.mjs
node scripts/send-secret.mjs --help
node scripts/send-secret.mjs 'RECIPIENT_URL' < /path/to/existing-secret.txt
```

The helper is offline, takes the exact original HTTPS `?pub=` link, reads at most
1024 ASCII bytes through stdin, and prints only the encrypted reply URL. Do not
put secrets in arguments, logs, source, or tests. See `agent-guide.md` for limitations.

GitHub Pages is configured to publish `/` from `master`. Pushing a feature branch
does not publish the feature. Obtain explicit review of security-sensitive changes
before merging to `master`. After an authorized release, verify the Pages build and
fetch `index.html`, `llms.txt`, `agent-guide.md`, and `scripts/send-secret.mjs` under
the live `/secure-channel/` path. A live fetch does not verify recipient decryption.
