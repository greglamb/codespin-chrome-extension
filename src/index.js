const script = document.createElement("script");
script.type = "module";
script.src = chrome.runtime.getURL("/dist/main.js");
document.body.appendChild(script);

window.addEventListener("message", function (event) {
  if (event.source !== window) return; // Only handle messages from the same page

  if (event.data && event.data.action === "connectToServer") {
    const { token, serverUrl } = event.data.data;

    // Send the message to the background script
    chrome.runtime.sendMessage(
      { action: "connectToServer", data: { token, serverUrl } },
      (response) => {
        // Post the response back to the page
        window.postMessage({ action: "serverResponse", response }, "*");
      }
    );
  }
});
