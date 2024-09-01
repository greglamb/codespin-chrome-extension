import { sendCodeToIDE } from "./core.js";
import { CodeSpinButtonHtml } from "./CodeSpinButtonHtml.js";

// Function to find the nearest parent with classes "markdown" and "prose"
// and extract the first "File path:..." occurrence in the text content
function findFilePathInMarkdownProse(element: HTMLElement): string | null {
  const parent = element.closest(".markdown.prose");

  if (parent) {
    const paragraphs = parent.querySelectorAll("p");
    for (const paragraph of Array.from(paragraphs)) {
      const textContent = paragraph.textContent || "";
      const filePathMatch = textContent.match(
        /File path:\s*["'`]?(.+?)["'`]?(\n|$)/
      );

      if (filePathMatch) {
        return filePathMatch[1].trim();
      }
    }
  }
  return null;
}

// Function to extract the project root from the HTML
function extractProjectRoot(): string | null {
  const rootMatch = document.body.innerText.match(
    /The project root is "(.*?)"/
  );
  return rootMatch ? rootMatch[1] : null;
}

// Separate function to handle the "CodeSpin Sync" button click
function handleCodeSpinSyncClick(
  preElement: HTMLElement,
  projectRoot: string,
  filePath: string
) {
  const codeText = preElement.querySelector("code")?.innerText || "";

  if (projectRoot && filePath && codeText) {
    const message = {
      type: "code",
      projectPath: projectRoot,
      filePath: filePath,
      contents: codeText,
    };
    sendCodeToIDE(message);
  }
}

// Function to attach the "CodeSpin Sync" button specifically for ChatGPT
function attachChatGPTButton(preElement: HTMLElement, projectRoot: string) {
  const filePath = findFilePathInMarkdownProse(preElement);

  if (!filePath) {
    return;
  }

  // Find the "Copy code" button container to attach the CodeSpin Sync button
  const copyButtonContainer = preElement.querySelector(
    'div > div > div > span[data-state="closed"]'
  )?.parentElement;

  if (copyButtonContainer) {
    // Convert the CodeSpinButtonHtml string to a DOM element
    const parser = new DOMParser();
    const doc = parser.parseFromString(CodeSpinButtonHtml, "text/html");
    const codeSpinButtonElement = doc.body.firstChild as HTMLElement;

    // Attach the click event using the separate function
    codeSpinButtonElement.onclick = () =>
      handleCodeSpinSyncClick(preElement, projectRoot, filePath);

    // Insert the CodeSpin Sync button before the "Copy code" button
    copyButtonContainer.parentElement?.insertBefore(
      codeSpinButtonElement,
      copyButtonContainer
    );
  }
}

// Function to scan and attach buttons to code blocks in ChatGPT
export function attachLinksForChatGPT() {
  const codeBlocks = document.querySelectorAll("pre");

  // Extract the project root from the HTML content
  const projectRoot = extractProjectRoot();

  if (!projectRoot) {
    return;
  }

  codeBlocks.forEach((preElement) => {
    if (!(preElement as any).attachedCodespinLink) {
      // Attach the site-specific button
      attachChatGPTButton(preElement as HTMLElement, projectRoot);

      (preElement as any).attachedCodespinLink = true;
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
