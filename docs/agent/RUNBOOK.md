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
