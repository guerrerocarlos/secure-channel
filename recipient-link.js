// Share only the base64 SPKI body. PEM punctuation is unnecessary in a URL.
function recipientPem(value) {
  const legacy = /^-----BEGIN PUBLIC KEY-----\n([A-Za-z0-9+/]+={0,2})\n-----END PUBLIC KEY-----$/.exec(value);
  const body = legacy ? legacy[1] : value;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(body) || body.length % 4 !== 0 || btoa(atob(body)) !== body) {
    throw new Error('Invalid recipient link. Please copy a fresh link from the original browser.');
  }
  return `-----BEGIN PUBLIC KEY-----\n${body}\n-----END PUBLIC KEY-----`;
}

function recipientUrl(base, pem) {
  const url = new URL(base);
  url.search = '';
  url.hash = '';
  url.searchParams.set('pub', recipientPem(pem).split('\n')[1]);
  return url.href;
}

async function copyRecipientLink() {
  const status = document.getElementById('copyLinkStatus');
  try {
    await navigator.clipboard.writeText(document.querySelector('#receiverUI .shareableUrl').href);
    status.innerText = 'Link copied.';
  } catch {
    status.innerText = 'Could not copy automatically. Copy the displayed link using its context menu.';
  }
}
