import * as chatGPT from "./chatGPT.js";

export function start() {
  const app = getDomain();

  function getDomain(): "CHATGPT" | "CLAUDE" | undefined {
    const hostname = window.location.hostname;
    if (hostname === "chatgpt.com" || hostname === "chat.openai.com") {
      return "CHATGPT" as const;
    } else if (hostname === "claude.ai") {
      return "CLAUDE" as const;
    }
  }

  if (app === "CHATGPT") {
    chatGPT.attachLinks();
  }
}
