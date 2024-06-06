import * as chatGPT from "./chatGPT.js";
export function start() {
    const app = getDomain();
    function getDomain() {
        const hostname = window.location.hostname;
        if (hostname === "chatgpt.com" || hostname === "chat.openai.com") {
            return "CHATGPT";
        }
        else if (hostname === "claude.ai") {
            return "CLAUDE";
        }
    }
    if (app === "CHATGPT") {
        chatGPT.attachLinks();
    }
}
//# sourceMappingURL=entry.js.map