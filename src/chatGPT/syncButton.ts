import { writeFile } from "../writeFile.js";
import { CodeSpinButtonHtml } from "../CodeSpinButtonHtml.js";
import { extractFilePath, extractSyncUrl } from "./domExtractions.js";

export async function attachSyncButton(preElement: HTMLElement) {
  const filePath = extractFilePath(preElement);

  if (filePath) {
    const copyButtonContainer = preElement.querySelector(
      "div > div > div > span > button"
    )?.parentElement?.parentElement;

    if (copyButtonContainer) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(CodeSpinButtonHtml, "text/html");
      const codeSpinButtonElement = doc.body.firstChild as HTMLElement;

      codeSpinButtonElement.onclick = () =>
        handleSyncClick(preElement, filePath);

      copyButtonContainer.parentElement?.insertBefore(
        codeSpinButtonElement,
        copyButtonContainer
      );
    }
  }
}


async function handleSyncClick(
  preElement: HTMLElement,
  filePath: string
) {
  const projectSyncUrl = await extractSyncUrl();
  const codeText = preElement.querySelector("code")?.innerText || "";

  if (projectSyncUrl && filePath && codeText) {
    const message = {
      type: "code",
      filePath,
      contents: codeText,
    };

    if ((globalThis as any).__CODESPIN_DEBUG__) {
      console.log({ message });
    }

    writeFile(projectSyncUrl, message);
  }
}
