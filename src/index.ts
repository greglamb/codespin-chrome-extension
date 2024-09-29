import * as chatGPT from "./chatGPT/index.js";

function start() {
  const app = getDomain();

  function getDomain(): "CHATGPT" | "CLAUDE" | undefined {
    const hostname = window.location.hostname;
    if (hostname === "chat.openai.com" || hostname === "chatgpt.com") {
      return "CHATGPT" as const;
    } else if (hostname === "claude.ai") {
      return "CLAUDE" as const;
    }
  }

  if (app === "CHATGPT") {
    setTimeout(() => {
      chatGPT.initializeCodeSpin();
      chatGPT.attachCodeSpinLinks();
    }, 1000);
  } else {
    throw new Error("Only ChatGPT is supported now.");
  }
}

// Start the application
document.addEventListener("DOMContentLoaded", function () {
  start();
});
