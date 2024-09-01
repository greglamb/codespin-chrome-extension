import { sendCodeToIDE } from "./core.js";
import { CodeSpinButtonHtml } from "./CodeSpinButtonHtml.js";
// Function to find the nearest parent with classes "markdown" and "prose"
// and extract the first "File path:..." occurrence in the text content
function findFilePathInMarkdownProse(element) {
    const parent = element.closest(".markdown.prose");
    if (parent) {
        const paragraphs = parent.querySelectorAll("p");
        for (const paragraph of Array.from(paragraphs)) {
            const textContent = paragraph.textContent || "";
            console.log({ textContent });
            const filePathMatch = textContent.match(/File path:(.*?)(?=\n|$)/);
            if (filePathMatch) {
                return filePathMatch[1].trim();
            }
        }
    }
    return null;
}
// Function to extract the project root from the HTML
function extractProjectRoot() {
    const rootMatch = document.body.innerText.match(/The project root is "(.*?)"/);
    return rootMatch ? rootMatch[1] : null;
}
// Separate function to handle the "CodeSpin Sync" button click
function handleCodeSpinSyncClick(preElement, projectRoot, filePath) {
    const codeText = preElement.querySelector("code")?.innerText || "";
    if (projectRoot && filePath && codeText) {
        const message = {
            type: "code",
            projectPath: projectRoot,
            filePath: filePath,
            contents: codeText,
        };
        console.log({
            message,
        });
        sendCodeToIDE(message);
    }
    else {
        console.error("Project root, file path, or code content is missing.");
    }
}
// Function to attach the "CodeSpin Sync" button specifically for ChatGPT
function attachChatGPTButton(preElement, projectRoot) {
    const filePath = findFilePathInMarkdownProse(preElement);
    if (!filePath) {
        console.error("File path could not be found.");
        return;
    }
    // Find the "Copy code" button container to attach the CodeSpin Sync button
    const copyButtonContainer = preElement.querySelector('div > div > div > span[data-state="closed"]')?.parentElement;
    if (copyButtonContainer) {
        // Convert the CodeSpinButtonHtml string to a DOM element
        const parser = new DOMParser();
        const doc = parser.parseFromString(CodeSpinButtonHtml, "text/html");
        const codeSpinButtonElement = doc.body.firstChild;
        // Attach the click event using the separate function
        codeSpinButtonElement.onclick = () => handleCodeSpinSyncClick(preElement, projectRoot, filePath);
        // Insert the CodeSpin Sync button before the "Copy code" button
        copyButtonContainer.parentElement?.insertBefore(codeSpinButtonElement, copyButtonContainer);
    }
    else {
        console.error("Copy code button container could not be found.");
    }
}
// Function to scan and attach buttons to code blocks in ChatGPT
export function attachLinksForChatGPT() {
    const codeBlocks = document.querySelectorAll("pre");
    // Extract the project root from the HTML content
    const projectRoot = extractProjectRoot();
    if (!projectRoot) {
        console.error("Project root could not be found.");
        return;
    }
    codeBlocks.forEach((preElement) => {
        if (!preElement.attachedCodespinLink) {
            console.log(`Code length: ${preElement.innerText.length}`);
            // Attach the site-specific button
            attachChatGPTButton(preElement, projectRoot);
            preElement.attachedCodespinLink = true;
        }
    });
}
// Attach the CodeSpin buttons to code blocks
setTimeout(() => {
    attachLinksForChatGPT();
}, 1000);
// Re-check for new code blocks every 3 seconds
setInterval(() => {
    attachLinksForChatGPT();
}, 3000);
//# sourceMappingURL=chatGPT.js.map