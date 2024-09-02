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
      chatGPT.attachCodeSpinLinks();
    }, 1000);

    setInterval(() => {
      chatGPT.attachCodeSpinLinks();
    }, 3000);
  }
}

// Start the application
start();
