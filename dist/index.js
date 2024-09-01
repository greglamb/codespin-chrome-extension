import * as chatGPT from "./chatGPT.js";
function start() {
    const app = getDomain();
    function getDomain() {
        const hostname = window.location.hostname;
        if (hostname === "chat.openai.com") {
            return "CHATGPT";
        }
        else if (hostname === "claude.ai") {
            return "CLAUDE";
        }
    }
    if (app === "CHATGPT") {
        chatGPT.attachLinksForChatGPT();
    }
}
// Start the application
start();
//# sourceMappingURL=index.js.map