# "Easy to use" cryptographically-secure channel

Simple way to create a cryptographically secure channel for transmitting sensible information without pre-shared keys.

<img width="847" alt="Screenshot 2023-08-18 at 11 41 55 PM" src="https://github.com/guerrerocarlos/secure-channel/assets/82532/761b842f-3b7b-4e4f-a696-326d93bc6564">

## How to use:

 * Open the website: [https://guerrerocarlos.github.io/secure-channel/](https://guerrerocarlos.github.io/secure-channel/)
 * Copy the link provided and share it with your peer
 * Your peer should fill in the private/sensible information and send you back the resulting link
 * Open the link returned by your peer, get/use the sensible information
 * Flush the keys

## Self-hosting

You can have your own secure-channel hosted on github by just cloning this repo and enable Github Pages, you would get a domain in the form of __https://**username**.github.io/secure-channel/__ or enable a [custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages) for it.

All code is readable and no javascript builder nor transpiler is required.

## Disclaimer

* No cookies
* No tracking
* No backend
* No storage (only temporary localStorage for the keys in your browser)
* Browser-native ([WebCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)) encryption.