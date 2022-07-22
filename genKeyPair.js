let subtle;
if (window) {
  subtle = window.crypto.subtle;
} else {
  const { Crypto } = require("@peculiar/webcrypto");
  const cryptosubtle = new Crypto();
  subtle = cryptosubtle.subtle;

  function btoa(str) {
    return Buffer.from(str, "binary").toString("base64");
  }
}

/*
Convert  an ArrayBuffer into a string
from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

async function exportPrivateCryptoKey(key) {
  const exported = await subtle.exportKey("pkcs8", key);
  const exportedAsString = ab2str(exported);
  const exportedAsBase64 = btoa(exportedAsString);
  const pemExported = `-----BEGIN RSA PRIVATE KEY-----\n${exportedAsBase64}\n-----END RSA PRIVATE KEY-----`;

  return pemExported;
}

async function exportPublicCryptoKey(key) {
  const exported = await subtle.exportKey("spki", key);
  const exportedAsString = ab2str(exported);
  const exportedAsBase64 = btoa(exportedAsString);
  let splittedKey = [];
  let lineSize = 40;
  for (let i = 0; i < exportedAsString.length; i += lineSize) {
    splittedKey.push(exportedAsBase64.slice(i, i + lineSize));
  }
  const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
  // console.log(pemExported);

  return pemExported;
}

const keyPairConfiguration = {
  name: "RSA-OAEP",
  // Consider using a 4096-bit key for systems that require long-term security
  modulusLength: 1024,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
}

const packetSize = keyPairConfiguration.modulusLength / 1024 * 64

async function generateKeyPair() {
  console.log(subtle);
  const keyPair = await subtle.generateKey(
    keyPairConfiguration,
    true,
    ["encrypt", "decrypt"]
  );
  console.log(keyPair);
  return {
    priv: await exportPrivateCryptoKey(keyPair.privateKey),
    pub: await exportPublicCryptoKey(keyPair.publicKey),
    keyPair,
  };
}

const base64Encoding = {
  chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  bits: 6,
};

function stringify(data, encoding, opts = {}) {
  const { pad = true } = opts;
  const mask = (1 << encoding.bits) - 1;
  let out = "";

  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  for (let i = 0; i < data.length; ++i) {
    // Slurp data into the buffer:
    buffer = (buffer << 8) | (0xff & data[i]);
    bits += 8;

    // Write out as much as we can:
    while (bits > encoding.bits) {
      bits -= encoding.bits;
      out += encoding.chars[mask & (buffer >> bits)];
    }
  }

  // Partial character:
  if (bits) {
    out += encoding.chars[mask & (buffer << (encoding.bits - bits))];
  }

  // Add padding characters until we hit a byte boundary:
  if (pad) {
    while ((out.length * encoding.bits) & 7) {
      out += "=";
    }
  }

  return out;
}

function parse(string, encoding, opts = {}) {
  // Build the character lookup table:
  if (!encoding.codes) {
    encoding.codes = {};
    for (let i = 0; i < encoding.chars.length; ++i) {
      encoding.codes[encoding.chars[i]] = i;
    }
  }

  // The string must have a whole number of bytes:
  // if (!opts.loose && (string.length * encoding.bits) & 7) {
  //   throw new SyntaxError('Invalid padding')
  // }

  // Count the padding bytes:
  let end = string.length;
  while (string[end - 1] === "=") {
    --end;

    // If we get a whole number of bytes, there is too much padding:
    if (!opts.loose && !(((string.length - end) * encoding.bits) & 7)) {
      throw new SyntaxError("Invalid padding");
    }
  }

  // Allocate the output:
  const out = new (opts.out ?? Uint8Array)(((end * encoding.bits) / 8) | 0);

  // Parse the data:
  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  let written = 0; // Next byte to write
  for (let i = 0; i < end; ++i) {
    // Read one character from the string:
    const value = encoding.codes[string[i]];
    if (value === undefined) {
      throw new SyntaxError("Invalid character " + string[i]);
    }

    // Append the bits to the buffer:
    buffer = (buffer << encoding.bits) | value;
    bits += encoding.bits;

    // Write out some bits if the buffer has a byte's worth:
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 0xff & (buffer >> bits);
    }
  }

  // Verify that we have received just enough bits:
  if (bits >= encoding.bits || 0xff & (buffer << (8 - bits))) {
    throw new SyntaxError("Unexpected end of data");
  }

  return out;
}

function isValidArray(x) {
  return /Int(8|16|32)Array|Uint(8|8Clamped|16|32)Array|Float(32|64)Array|ArrayBuffer/gi.test(
    {}.toString.call(x)
  );
}

function arrayBufferConcat(/* arraybuffers */) {
  console.log("arrayBufferConcat", arguments)
  var arrays = [].slice.call(arguments);

  if (arrays.length <= 0 || !isValidArray(arrays[0])) {
    return new Uint8Array(0).buffer;
  }

  var arrayBuffer = arrays.reduce(function (cbuf, buf, i) {
    if (i === 0) return cbuf;
    if (!isValidArray(buf)) return cbuf;

    var tmp = new Uint8Array(cbuf.byteLength + buf.byteLength);
    tmp.set(new Uint8Array(cbuf), 0);
    tmp.set(new Uint8Array(buf), cbuf.byteLength);

    return tmp.buffer;
  }, arrays[0]);

  return arrayBuffer;
}


// async function main() {
//   console.log(process.argv);
//   let who = process.argv[2];
//   let fs = require("fs");
//   let keyPair = await genKeyPair();

//   console.log(keyPair);

//   fs.writeFileSync(`./KEYS/${who}.key`, keyPair.priv);
//   fs.writeFileSync(`./KEYS/${who}.pub.key`, keyPair.pub);
// }

// main();
