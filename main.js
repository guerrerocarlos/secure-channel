function flushKeys() {
  window.localStorage.clear();
  document.getElementById("flushResults").innerText = "All keys flushed.";

  let seconds = 5;
  setInterval(() => {
    document.getElementById(
      "flushResults"
    ).innerText = `All keys flushed. Restarting in ${seconds} seconds.`;
    seconds--;
  }, 1000);

  setTimeout(() => {
    document.location.hash = "";
    document.location.search = "";
  }, seconds * 1000);
}

console = { log: () => {} }

let pair = {};
let params = new URLSearchParams(document.location.search);
console.log("---- params", params);

async function main() {
  if (params.has('pub')) {
    if (params.getAll('pub').length !== 1 || params.has('to')) {
      throw new Error('Ambiguous recipient link. Please copy a fresh link.');
    }
    const pem = recipientPem(params.get('pub'));
    await window.crypto.subtle.importKey('spki', pemToArrayBufferPublic(pem),
      { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
    params.set('pub', pem);
  }
  if (!params.get("pub") && !params.get("to")) {
    console.log("NO PUB!");
    pair = await generateKeyPair();
    localStorage.setItem(pair.pub, pair.priv);
    let h = await emojiHash(pair.pub, 6);
    console.log("H", h);
    localStorage.setItem(h.decimal, pair.pub);
    document.location.href = recipientUrl(document.location.href, pair.pub);
    return;
  } else {
    console.log("GOT PUB!");
    pair.pub = params.get("pub") || localStorage.getItem(params.get("to"));
    console.log("Try to get private for pub:", pair.pub, localStorage.getItem(pair.pub))
    pair.priv = localStorage.getItem(pair.pub);
  }

  if(params.get("to") && !localStorage.getItem(params.get("to"))) {
    console.log("WRONG BROWSER!!")
    document.getElementById("wrongUI").classList.remove("hidden");
    document.getElementById("receiverUI").classList.add("hidden");
  } else {
    console.log("pair", pair);
  
    if (pair.priv) {
      const shareLink = recipientUrl(window.location.href, pair.pub);
      document.querySelector('#receiverUI .shareableUrl').href = shareLink;
      document.querySelector('#receiverUI .shareableUrl').innerText = shareLink;
  
      lastHash = document.location.hash
      setInterval(() => {
        console.log("COMPARE!", lastHash, document.location.hash)
        if(lastHash !== document.location.hash) {
          main()
        }
      }, 1000)
    } else {
      if (params.get("pub")) {
        let d = await emojiHash(params.get("pub"), 6);
        localStorage.setItem(d.decimal, params.get("pub"));
        params.set("to", d.decimal);
        params.delete("pub");
        console.log("GO TO:", params.toString());
        document.location.search = params.toString("utf-8");
      }
  
      document.getElementById("senderUI").classList.remove("hidden");
      document.getElementById("receiverUI").classList.add("hidden");
      document.getElementById("secretTextarea").classList.remove("hidden");
    }
  
    emojids = document.getElementsByClassName("emoid");
    let hash = await emojiHash(pair.pub, 6);
    for (let i = 0; i < emojids.length; i++) {
      emojids[i].innerText = hash.emoji;
    }
  
    // if (params.get("ciphertext")) {
    //   document.getElementById("ciphertext").value = params.get("ciphertext");
    // }
  
    if (document.location.hash) {
      console.log("GOT HASH:", document.location.hash);
  
      let result = await decrypt(document.location.hash.replace("#", ""));
  
      if (result) {
        document.getElementById("decriptedUI").classList.remove("hidden");
        document.getElementById("receiverUI").classList.add("hidden");
  
        document.getElementById("decripted").value = result;
        document.getElementById("decripted").disabled = true;
      } else {
        console.log("Private Key not Found :(");
      }
  
      document.getElementById("secretTextarea").classList.remove("hidden");
    }
  
    // document.getElementById("priv").innerText = pair.priv;
    // document.getElementById("pub").innerText = pair.pub;
    // document.getElementById("content").innerText = "";
  
    // if (document.location.hash) {
    //   document.getElementById("ciphertext").value =
    //     document.location.hash.replace("#", "");
    //   // decrypt();
    // }
  
    // encrypt();
  
    const encriptNow = async () => {
      let plaintext = document.getElementById("plaintext").value;
      let ciphertext = await encrypt(plaintext);
      document.location.hash = ciphertext;
      console.log("ENCRIPTED:", ciphertext);
      document.getElementById("shareableUrl").innerText = document.location.href;
  
      shareableUIs = document.getElementsByClassName("shareableUrl");
      for (let i = 0; i < shareableUIs.length; i++) {
        shareableUIs[i].innerText = document.location.href;
      }
    };
  
    document.getElementById("plaintext").addEventListener("keyup", encriptNow);
  }
}

main().catch(() => {
  for (const id of ['receiverUI', 'senderUI', 'decriptedUI', 'wrongUI']) {
    document.getElementById(id).classList.add('hidden');
  }
  document.getElementById('linkError').classList.remove('hidden');
});
