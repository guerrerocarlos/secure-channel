# Send a secret with an agent

When the user gives you a Secure Channel URL containing `?pub=`, use its public
key to encrypt locally and return the resulting reply URL in the conversation.
New links contain the URL-encoded base64 SPKI key body, without PEM headers,
footers, or newlines. Valid legacy PEM links remain supported.
That is delivery: there is no HTTP send endpoint, inbox, or server-side storage.
The recipient opens the reply in the same browser profile and origin that created
their key. Never request their private key.

## With a terminal

Use Node.js 22 or newer. Obtain and inspect a trusted checkout of this repository
before processing secrets. No dependency installation is needed. The helper is
self-contained and can also be downloaded from `./scripts/send-secret.mjs`
relative to the supplied site's directory, then inspected before running.

```sh
node scripts/send-secret.mjs 'RECIPIENT_URL' < /path/to/existing-secret.txt
```

Replace `RECIPIENT_URL` with the exact user-supplied URL. Supply the authorized
secret through stdin from its existing source, without printing it or placing it
in shell arguments, command history, or a newly created plaintext file. An existing
secret-producing process can pipe directly to the helper. Input is preserved
exactly, including a trailing newline. Output is one encrypted URL and a newline.
Return that URL to the requester. Do not fetch the reply URL to test it: an agent
does not have the recipient's private key. The helper makes no network requests.
Keep tool output private until returning the reply to the authorized requester.

## With browser automation

1. Open the exact original recipient URL in a trusted browser session.
2. Fill the `#plaintext` textarea with the authorized secret and dispatch a
   `keyup` event (the current app listens for `keyup`, not `input`).
3. Wait until the URL fragment and visible reply text settle. Read the URL from
   the address bar or `#senderUI .shareableUrl` text. The anchor href is not
   maintained by the legacy sender UI.
4. Return the full `?to=...#...` URL. Do not paste plaintext in the conversation.

The secret exists in browser memory and automation inputs. Only use tooling
approved for handling it. Text-only web readers cannot run encryption; use the
local helper if terminal execution is available. If neither is available, explain
that limitation instead of inventing an encrypted result.

## Input and compatibility limits

- Use only an authenticated recipient link supplied by the user. The short emoji
  or numeric ID is a locator, not proof of identity or sender authentication.
- A `?to=` link alone is insufficient for a new sender, because the key is stored
  in the browser that processed the original `?pub=` link.
- The helper rejects malformed PEM footers, duplicate parameters, fragments,
  alternate key sizes, and noncanonical serialization. Ask for a fresh link
  rather than repairing it. Copy the share URL directly from the original browser.
- The existing receiver corrupts non-ASCII text. The helper accepts only 1-1024
  ASCII bytes; browser senders should also avoid Unicode until this is fixed.
- Reply URLs grow by about 172 characters per 10 input bytes. The maximum helper
  input produces roughly an 18 KB link; chat and browser URL limits may be lower.
- This preserves a legacy 1024-bit RSA format with independently encrypted blocks.
  It does not provide sender authentication, expiry, deletion, or modern
  authenticated message framing. A cryptographic upgrade requires separate review.
- URL fragments are not sent in ordinary HTTP requests, but remain accessible to
  page scripts, browser history, extensions, and anyone who receives the full URL.

## Existing wire format

For compact links, decode the `pub` query value using URLSearchParams, then wrap
the base64 body in the standard PUBLIC KEY PEM header and footer, with one newline
before and after the body. Legacy links already contain this PEM representation.
Import the PEM public key as SPKI RSA. For each consecutive 10 ASCII bytes, encrypt
with RSA-OAEP, SHA-256 for OAEP and MGF1, and an empty label. Concatenate the 128-byte
ciphertext blocks, encode as base64 with `-` and `_` replacing `+` and `/`, and
retain `=` padding. The numeric `to` value is the unsigned big-endian integer from
the first six bytes of SHA-256 of the second PEM line (the base64 body, no newline).
Return the same origin and pathname with `?to=NUMBER#CIPHERTEXT`, removing `pub`.
Prefer the tested helper over reimplementing this format.
