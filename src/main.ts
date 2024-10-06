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

function onAppLoad() {
  start();
}
if (document.readyState === "loading") {
  // The DOM is still loading, you can attach the DOMContentLoaded event listener
  document.addEventListener("DOMContentLoaded", function () {
    onAppLoad();
  });
} else {
  onAppLoad();
}
