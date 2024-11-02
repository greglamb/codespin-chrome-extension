async function start() {
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
    const chatGPTModule = await import("./chatGPT/index.js");
    setTimeout(() => {
      chatGPTModule.initializeCodeSpin();
    }, 1000);
  } else if (app === "CLAUDE") {
    const claudeModule = await import("./claude/index.js");
    setTimeout(() => {
      claudeModule.initializeCodeSpin();
    }, 1000);
  } else {
    throw new Error("Only ChatGPT is supported now.");
  }
}

function onAppLoad() {
  start().catch((error) => {
    console.error("Error during startup:", error);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    onAppLoad();
  });
} else {
  onAppLoad();
}
