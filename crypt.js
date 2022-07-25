function base64ToArrayBuffer(b64) {
  console.log("base64ToArrayBuffer>>", b64);

  var byteString = atob(b64);
  var byteArray = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  return byteArray;
}

function removeLines(str) {
  return str.replace("\n", "");
}

function _base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

const base64Arraybuffer = async (data) => {
  const base64url = await new Promise((r) => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(new Blob([data]));
  });
  return base64url.split(",", 2)[1];
};

function pemToArrayBufferPublic(pem) {
  var b64Lines = removeLines(pem);
  var b64Prefix = b64Lines.replace("-----BEGIN PUBLIC KEY-----", "");
  var b64Final = b64Prefix.replace("-----END PUBLIC KEY-----", "");

  return base64ToArrayBuffer(b64Final);
}
function pemToArrayBufferPrivate(pem) {
  var b64Lines = removeLines(pem);
  var b64Prefix = b64Lines.replace("-----BEGIN RSA PRIVATE KEY-----", "");
  var b64Final = b64Prefix.replace("-----END RSA PRIVATE KEY-----", "");

  return base64ToArrayBuffer(b64Final);
}

function arrayBufferToString(str) {
  var byteArray = new Uint8Array(str);
  var byteString = "";
  for (var i = 0; i < byteArray.byteLength; i++) {
    byteString += String.fromCodePoint(byteArray[i]);
  }
  return byteString;
}

let ciphertext;
let readableCiphertext;
let data = "a";

var _appendBuffer = function (buffer1, buffer2) {
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
};

async function encrypt(data) {

  let importedPubKey = await window.crypto.subtle.importKey(
    "spki",
    pemToArrayBufferPublic(pair.pub),
    {
      name: "RSA-OAEP",
      hash: { name: "SHA-256" },
    },
    false,
    ["encrypt"]
  );

  console.log("importedPubKey", importedPubKey);

  const encoder = new TextEncoder();

  let ciphertext = new Uint8Array(0);

  for (let i = 0; i < data.length / 10; i++) {
    let ciphertextBlob = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      importedPubKey, //from generateKey or importKey above
      encoder.encode(data.slice(i * 10, (i + 1) * 10)) //ArrayBuffer of data you want to sign
    );
    console.log("💥 ciphertextBlob", ciphertextBlob);
    ciphertext = arrayBufferConcat(ciphertext, ciphertextBlob);
  }

  console.log("DATA;", data);

  return stringify(new Uint8Array(ciphertext), base64Encoding); // btoa(ciphertext.toString())
  
}

function buf2hex(buffer) {
  // buffer is an ArrayBuffer
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

async function decrypt(cipherPayload) {
  if (pair.priv) {
    ciphertext = parse(cipherPayload, base64Encoding);

    console.log("ciphetext", ciphertext);

    let importedPrivKey = await window.crypto.subtle.importKey(
      "pkcs8",
      pemToArrayBufferPrivate(pair.priv),
      {
        name: "RSA-OAEP",
        hash: { name: "SHA-256" },
      },
      false,
      ["decrypt"]
    );

    let totalcipherresult = ""
    for (let i = 0; i < ciphertext.length; i += 128) {
      let recovered = await window.crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
        },
        importedPrivKey, //from generateKey or importKey above
        ciphertext.slice(i, i + 128) //ArrayBuffer of data you want to sign
      );
      console.log("recovered", recovered);
      totalcipherresult += String.fromCharCode(...new Uint8Array(recovered));
    }

    return totalcipherresult
  }
}
