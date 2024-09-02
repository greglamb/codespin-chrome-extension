import { writeFile } from "./writeFile.js";
import { CodeSpinButtonHtml } from "./CodeSpinButtonHtml.js";

function findFilePathInMarkdownProse(element: HTMLElement): string | null {
  let sibling = element.previousElementSibling as HTMLElement | null;

  while (sibling) {
    // Stop searching if the sibling is a <pre> element
    if (sibling.tagName.toLowerCase() === "pre") {
      return null;
    }

    const textContent = sibling.textContent || "";
    const filePathMatch = textContent.match(
      /File path:\s*["'`]?(.+?)["'`]?(\n|$)/
    );

    if (filePathMatch) {
      return filePathMatch[1].trim();
    }

    sibling = sibling.previousElementSibling as HTMLElement | null;
  }

  return null;
}

async function extractProjectSyncUrl(): Promise<string | null> {
  const match = document.body.innerText.match(
    /The project's sync url is "(https?:\/\/[^\s]+)"/
  );

  if (match) {
    return match[1];
  }

  // If not found, ask the user to input the URL
  return requestProjectSyncUrlFromUser();
}

// Function to request project sync URL from the user via a dialog
function requestProjectSyncUrlFromUser(): Promise<string | null> {
  const dialogHtml = `
    <dialog id="codespin-dialog" style="width: 400px; background-color: black; color: #ccc; border-radius: 8px; padding: 20px; border: solid #fff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);">
      <label for="codespin-url">Project sync url:</label><br>
      <input type="text" id="codespin-url" name="codespin-url" style="width: 100%; margin-top: 10px; padding: 5px; border-radius: 4px; border: 1px solid #ccc;" required><br><br>
      <button id="codespin-submit" style="background-color: green; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Submit</button>
      <button id="codespin-cancel" style="background-color: #f44336; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Cancel</button>
    </dialog>
  `;

  document.body.insertAdjacentHTML("beforeend", dialogHtml);

  const dialog = document.getElementById(
    "codespin-dialog"
  ) as HTMLDialogElement;
  dialog.showModal();

  return new Promise<string | null>((resolve) => {
    document.getElementById("codespin-submit")!.onclick = () => {
      const url = (document.getElementById("codespin-url") as HTMLInputElement)
        .value;
      dialog.close();
      dialog.remove();
      resolve(url || null);
    };

    document.getElementById("codespin-cancel")!.onclick = () => {
      dialog.close();
      dialog.remove();
      resolve(null);
    };
  });
}

// Separate function to handle the "CodeSpin Sync" button click
async function handleCodeSpinSyncClick(
  preElement: HTMLElement,
  filePath: string
) {
  const projectSyncUrl = await extractProjectSyncUrl();
  const codeText = preElement.querySelector("code")?.innerText || "";

  if (projectSyncUrl && filePath && codeText) {
    const message = {
      type: "code",
      filePath: filePath,
      contents: codeText,
    };

    if ((globalThis as any).__CODESPIN_DEBUG__) {
      console.log({ message });
    }

    writeFile(projectSyncUrl, message);
  }
}

// Function to attach the "CodeSpin Sync" button specifically for ChatGPT
async function attachChatGPTButton(preElement: HTMLElement) {
  const filePath = findFilePathInMarkdownProse(preElement);

  if (filePath) {
    // Find the "Copy code" button container to attach the CodeSpin Sync button
    const copyButtonContainer = preElement.querySelector(
      "div > div > div > span > button"
    )?.parentElement?.parentElement;

    if (copyButtonContainer) {
      // Convert the CodeSpinButtonHtml string to a DOM element
      const parser = new DOMParser();
      const doc = parser.parseFromString(CodeSpinButtonHtml, "text/html");
      const codeSpinButtonElement = doc.body.firstChild as HTMLElement;

      // Attach the click event using the separate function
      codeSpinButtonElement.onclick = () =>
        handleCodeSpinSyncClick(preElement, filePath);

      // Insert the CodeSpin Sync button before the "Copy code" button
      copyButtonContainer.parentElement?.insertBefore(
        codeSpinButtonElement,
        copyButtonContainer
      );
    }
  }
}

// Function to scan and attach buttons to code blocks in ChatGPT
export function attachLinksForChatGPT() {
  const codeBlocks = document.querySelectorAll("pre");

  codeBlocks.forEach((preElement) => {
    if (!(preElement as any).attachedCodespinLink) {
      // Attach the site-specific button
      attachChatGPTButton(preElement as HTMLElement);

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
