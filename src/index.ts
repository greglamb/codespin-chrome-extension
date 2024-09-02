import * as chatGPT from "./chatGPT.js";

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
    chatGPT.attachLinksForChatGPT();
  }
}

// Start the application
start();
