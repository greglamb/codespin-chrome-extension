console.log("My service worker loaded...");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "connectToServer") {
    console.log("YYAAA", message.data);
    const { token, serverUrl } = message.data;

    fetch(`${serverUrl}/auth`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: data.error });
        }
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate that we will send the response asynchronously
    return true;
  }
});
