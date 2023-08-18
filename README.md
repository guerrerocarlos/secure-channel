# "Easy to use" cryptographically-secure channel

Simple way to create a cryptographically secure channel for transmitting sensible information without pre-shared keys.

## How to use:

 * Open the website: [https://guerrerocarlos.github.io/secure-channel/](https://guerrerocarlos.github.io/secure-channel/)
 * Copy the link provided and share it with your peer
 * Your peer should fill in the private/sensible information and send you back the resulting link
 * Open the link returned by your peer, get/use the sensible information
 * Flush the keys

## Self-hosting

You can have your own secure-channel hosted on github by just cloning this repo and enable Github Pages, you would get a domain in the form of https://<username>.github.io/secure-channel/ or even use a [custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages).

## Disclaimer

* No cookies
* No tracking
* No backend
* Browser-native ([WebCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)) encryption.