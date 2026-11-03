import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { createReply, parseRecipient } from '../scripts/send-secret.mjs';

// Ephemeral keys and synthetic messages only. Nothing is written to disk.
const browser = vm.createContext({ window: { crypto: webcrypto }, TextEncoder,
  console: { log() {} }, atob, btoa, pair: {} });
for (const file of ['genKeyPair.js', 'crypt.js', 'emojiHash.js']) {
  vm.runInContext(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), browser);
}
browser.pair = await vm.runInContext('generateKeyPair()', browser);
const link = new URL('https://example.test/secure-channel/');
link.searchParams.set('pub', browser.pair.pub);

test('helper replies decrypt using the unchanged browser receiver', async () => {
  for (const text of ['x', '1234567890', '12345678901', 'synthetic\nASCII\tinput\r\n', 'a'.repeat(1024)]) {
    const reply = new URL(createReply(link.href, Buffer.from(text)));
    const id = await vm.runInContext('emojiHash(pair.pub, 6)', browser);
    assert.equal(reply.searchParams.get('to'), String(id.decimal));
    assert.equal(reply.searchParams.has('pub'), false);
    assert.equal(reply.origin + reply.pathname, link.origin + link.pathname);
    browser.payload = reply.hash.slice(1);
    assert.equal(await vm.runInContext('decrypt(payload)', browser), text);
  }
});

test('OAEP encryption is randomized', () => {
  assert.notEqual(createReply(link.href, Buffer.from('fixture')), createReply(link.href, Buffer.from('fixture')));
});

test('reject invalid, ambiguous, or unsupported recipient links', () => {
  const invalid = [link.href.replace('https:', 'http:'), link.href + '#old',
    link.href + '&pub=duplicate', link.href + '&to=123',
    'https://example.test/?to=123', 'not a URL'];
  const malformed = new URL(link);
  malformed.searchParams.set('pub', browser.pair.pub.replace('-----END PUBLIC KEY-----', '-----END PUBLIC KEY---\u2014'));
  invalid.push(malformed.href);
  for (const value of invalid) assert.throws(() => parseRecipient(value));
});

test('reject input the receiver cannot recover safely', () => {
  for (const bytes of [Buffer.alloc(0), Buffer.alloc(1025), Buffer.from('fixture \u00e9'), Buffer.from([255])]) {
    assert.throws(() => createReply(link.href, bytes));
  }
});

test('CLI prints only a reply URL and keeps failure output free of input', async () => {
  const cli = new URL('../scripts/send-secret.mjs', import.meta.url);
  const run = (url, input) => spawnSync(process.execPath, [cli.pathname, url], { input, encoding: 'utf8' });
  const success = run(link.href, 'synthetic CLI fixture\n');
  assert.equal(success.status, 0);
  assert.equal(success.stderr, '');
  assert.equal(success.stdout.split('\n').length, 2);
  browser.payload = new URL(success.stdout.trim()).hash.slice(1);
  assert.equal(await vm.runInContext('decrypt(payload)', browser), 'synthetic CLI fixture\n');
  for (const [url, input] of [[link.href, '\u00e9 private fixture'], [link.href, 'a'.repeat(1025)], ['invalid', 'private fixture']]) {
    const failure = run(url, input);
    assert.equal(failure.status, 1);
    assert.equal(failure.stdout, '');
    assert.equal(failure.stderr.includes(input), false);
  }
});
