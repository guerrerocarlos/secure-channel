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

let pair = {};
let params = new URLSearchParams(document.location.search);
console.log("---- params", params);

async function main() {
  if (!params.get("pub") && !params.get("to")) {
    console.log("NO PUB!");
    pair = await generateKeyPair();
    params.set("pub", pair.pub);
    document.location.search = params.toString();
    localStorage.setItem(pair.pub, pair.priv);
    let h = await emojiHash(pair.pub, 6);
    console.log("H", h);
    localStorage.setItem(h.decimal, pair.pub);
  } else {
    console.log("GOT PUB!");
    pair.pub = params.get("pub") || localStorage.getItem(params.get("to"));
    console.log("Try to get private for pub:", pair.pub, localStorage.getItem(pair.pub))
    pair.priv = localStorage.getItem(pair.pub);
  }

  console.log("pair", pair);

  if (pair.priv) {
    document.getElementById("shareableUrl").href = window.location.href;
    document.getElementById("shareableUrl").innerText = window.location.href;

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
      document.location.search = params.toString();
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

main();
