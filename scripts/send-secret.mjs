#!/usr/bin/env node
// Legacy browser wire format. Security review is required before changing it.
import { createHash, createPublicKey, publicEncrypt, constants } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export function parseRecipient(link) {
  let url;
  try { url = new URL(link); } catch { throw new Error('Provide an absolute recipient URL.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash ||
      url.searchParams.getAll('pub').length !== 1 || [...url.searchParams.keys()].some(k => k !== 'pub')) {
    throw new Error('Use the original HTTPS recipient URL with only one pub parameter and no fragment.');
  }
  const value = url.searchParams.get('pub');
  const pem = /^[A-Za-z0-9+/]+={0,2}$/.test(value)
    ? `-----BEGIN PUBLIC KEY-----\n${value}\n-----END PUBLIC KEY-----` : value;
  // Exact serialization matters: the browser hashes the second PEM line.
  if (!/^-----BEGIN PUBLIC KEY-----\n[A-Za-z0-9+/]+={0,2}\n-----END PUBLIC KEY-----$/.test(pem)) {
    throw new Error('Malformed public key. Ask for a fresh link; do not repair or guess the key.');
  }
  let key;
  try { key = createPublicKey(pem); } catch { throw new Error('Invalid public key. Ask for a fresh link.'); }
  if (key.asymmetricKeyType !== 'rsa' || key.asymmetricKeyDetails.modulusLength !== 1024) {
    throw new Error('This legacy browser format requires a 1024-bit RSA public key.');
  }
  if (key.export({ type: 'spki', format: 'der' }).toString('base64') !== pem.split('\n')[1]) {
    throw new Error('Noncanonical public key. Ask for a fresh browser-generated link.');
  }
  return { url, pem, key };
}

export function createReply(link, secret) {
  const { url, pem, key } = parseRecipient(link);
  if (!Buffer.isBuffer(secret)) throw new Error('Secret must be a Buffer.');
  if (!secret.length || secret.length > 1024 || secret.some(byte => byte > 127)) {
    throw new Error('Use 1 to 1024 ASCII bytes. The legacy browser cannot recover Unicode correctly.');
  }
  const blocks = [];
  for (let offset = 0; offset < secret.length; offset += 10) {
    blocks.push(publicEncrypt({ key, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      secret.subarray(offset, offset + 10)));
  }
  const recipient = BigInt('0x' + createHash('sha256').update(pem.split('\n')[1]).digest('hex').slice(0, 12));
  url.search = '';
  url.searchParams.set('to', recipient.toString());
  // The existing browser uses the URL-safe alphabet with retained '=' padding.
  url.hash = Buffer.concat(blocks).toString('base64').replaceAll('+', '-').replaceAll('/', '_');
  return url.href;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    process.stdout.write('Usage: node scripts/send-secret.mjs "RECIPIENT_URL" < /path/to/secret.txt\nReads 1-1024 ASCII bytes from stdin; prints only the encrypted reply URL. No network requests.\n');
    return;
  }
  if (args.length !== 1) throw new Error('Expected one recipient URL. Use --help for usage.');
  parseRecipient(args[0]);
  if (process.stdin.isTTY) throw new Error('Read the secret from stdin, not arguments or an interactive terminal.');
  const chunks = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > 1024) throw new Error('Secret exceeds the 1024-byte limit.');
    chunks.push(chunk);
  }
  process.stdout.write(createReply(args[0], Buffer.concat(chunks)) + '\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    // Avoid echoing arguments, plaintext, or crypto-library error internals.
    process.stderr.write('Unable to encrypt. Check the recipient URL and 1-1024 ASCII byte input. See --help and agent-guide.md.\n');
    process.exitCode = 1;
  });
}
