import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createReply, parseRecipient } from '../scripts/send-secret.mjs';

const source = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');

function session(href, entries = []) {
  const storage = new Map(entries);
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { classList: { add() {}, remove() {} },
      addEventListener() {}, innerText: '', href: '' });
    return elements.get(id);
  };
  const location = new URL(href);
  const context = vm.createContext({ URL, URLSearchParams, TextEncoder, atob, btoa,
    console: { log() {} }, setInterval() {},
    localStorage: { getItem: key => storage.get(String(key)) ?? null,
      setItem: (key, value) => storage.set(String(key), value) },
    window: { crypto: webcrypto, location }, navigator: { clipboard: { async writeText(value) {
      context.copied = value;
    } } }, document: { location, getElementById: element, querySelector: element,
      getElementsByClassName: () => [] } });
  for (const file of ['genKeyPair.js', 'crypt.js', 'emojiHash.js', 'recipient-link.js']) {
    vm.runInContext(source(file), context);
  }
  return { context, storage, element, location };
}

const generated = session('https://example.test/secure-channel/');
const pair = await vm.runInContext('generateKeyPair()', generated.context);
const pem = pair.pub;
const base = 'https://example.test/secure-channel/';
const compact = new URL(base);
compact.searchParams.set('pub', pem.split('\n')[1]);
const legacy = new URL(base);
legacy.searchParams.set('pub', pem);

test('compact and legacy links preserve the exact key and recipient ID', async () => {
  for (const link of [compact, legacy]) {
    assert.equal(parseRecipient(link.href).pem, pem);
    const page = session(link.href);
    page.context.input = link.searchParams.get('pub');
    assert.equal(vm.runInContext('recipientPem(input)', page.context), pem);
    await vm.runInContext(source('main.js'), page.context);
    const reply = new URL(createReply(link.href, Buffer.from('synthetic fixture')));
    assert.equal(page.location.searchParams.get('to'), reply.searchParams.get('to'));
    assert.equal(page.storage.get(reply.searchParams.get('to')), pem);
    const receiver = session(reply.href, [[pem, pair.priv], [reply.searchParams.get('to'), pem]]);
    await vm.runInContext(source('main.js'), receiver.context);
    assert.equal(receiver.element('decripted').value, 'synthetic fixture');
  }
});

test('existing receiver keys produce punctuation-safe share links without rotation', async () => {
  const page = session(legacy.href, [[pem, pair.priv]]);
  await vm.runInContext(source('main.js'), page.context);
  const share = page.element('#receiverUI .shareableUrl').href;
  assert.equal(share, compact.href);
  assert.equal(share.includes('-----'), false);
  assert.equal(share.includes('%0A'), false);
  assert.equal(page.storage.get(pem), pair.priv);
  await vm.runInContext('copyRecipientLink()', page.context);
  assert.equal(page.context.copied, compact.href);
  assert.equal(page.element('copyLinkStatus').innerText, 'Link copied.');
});

test('first visit stores keys and recipient ID before navigating to compact URL', async () => {
  const page = session(base);
  await vm.runInContext(source('main.js'), page.context);
  const result = parseRecipient(page.location.href);
  assert.equal(page.location.searchParams.get('pub'), result.pem.split('\n')[1]);
  assert.ok(page.storage.get(result.pem));
  assert.equal(page.storage.size, 2);
});

test('invalid or punctuation-damaged key input is rejected, never repaired', async () => {
  for (const value of ['', pem.replace(/-----$/, '---\u2014'), 'YWJj=', 'YWJj\u2014', 'not a key']) {
    const page = session(base);
    page.context.input = value;
    assert.throws(() => vm.runInContext('recipientPem(input)', page.context));
  }
  const page = session(base + '?pub=YWJj'); // valid base64, invalid SPKI
  let showedError = false;
  page.element('linkError').classList.remove = () => { showedError = true; };
  await vm.runInContext(source('main.js'), page.context);
  assert.ok(showedError);
  assert.equal(page.storage.size, 0);
});

test('clipboard failure provides manual copy guidance', async () => {
  const page = session(base);
  page.context.navigator.clipboard.writeText = async () => { throw new Error('denied'); };
  await vm.runInContext('copyRecipientLink()', page.context);
  assert.match(page.element('copyLinkStatus').innerText, /context menu/);
});
