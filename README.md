# "Easy to use" cryptographically-secure channel

Simple way to create a cryptographically secure channel for transmitting sensible information without pre-shared keys.

<img width="847" alt="Screenshot 2023-08-18 at 11 41 55 PM" src="https://github.com/guerrerocarlos/secure-channel/assets/82532/761b842f-3b7b-4e4f-a696-326d93bc6564">

## How to use:

 * Open the website: [https://guerrerocarlos.github.io/secure-channel/](https://guerrerocarlos.github.io/secure-channel/)
 * Click **Copy recipient link** and share it with your peer. New links omit PEM punctuation so smart punctuation cannot alter a closing delimiter.
 * Your peer should fill in the private/sensible information and send you back the resulting link
 * Open the link returned by your peer, get/use the sensible information
 * Flush the keys

## AI agents

Share the original recipient URL containing `?pub=` with your agent. The static
page includes instructions readable without JavaScript. See [agent-guide.md](./agent-guide.md)
and [llms.txt](./llms.txt) for the browser workflow and dependency-free Node.js helper:

```sh
node scripts/send-secret.mjs 'RECIPIENT_URL' < /path/to/existing-secret.txt
```

The helper prints an encrypted reply URL, which the agent returns to you. Open it
in your original browser profile. It performs no network requests and accepts
1-1024 ASCII bytes to match the legacy receiver. Malformed links require a fresh
recipient URL. Existing cryptographic limitations are documented in the guide.

Existing receiver keys and valid older PEM links remain compatible. The sender
helper accepts both link formats. Malformed links show an error instead of failing
silently; damaged key data is never repaired automatically.

Run compatibility checks with `node --test tests/*.test.mjs`.

## Self-hosting

You can have your own secure-channel hosted on github by just cloning this repo and enable Github Pages, you would get a domain in the form of __https://**username**.github.io/secure-channel/__ or enable a [custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages) for it.

All code is readable and no javascript builder nor transpiler is required.

## Disclaimer

* No cookies
* No tracking
* No backend
* No storage (only temporary localStorage for the keys in your browser)
* Browser-native ([WebCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)) encryption.
