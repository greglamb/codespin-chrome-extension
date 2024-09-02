import { showSyncStatusButton } from "./syncStatusButton.js";
import { getProjectSyncUrl, setProjectSyncUrl } from "./projectSyncUrls.js";
import { showSyncUrlDialog } from "./syncUrlDialog.js";

export function extractFilePath(element: HTMLElement): string | null {
  let sibling = element.previousElementSibling as HTMLElement | null;

  while (sibling) {
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

export async function extractSyncUrl(): Promise<string | null> {
  const currentUrl = window.location.href;

  if (getProjectSyncUrl(currentUrl)) {
    return getProjectSyncUrl(currentUrl);
  }

  const match = document.body.innerText.match(
    /The project's sync url is "(https?:\/\/[^\s]+)"/
  );

  if (match) {
    const syncUrl = match[1];
    setProjectSyncUrl(currentUrl, syncUrl);
    showSyncStatusButton();
    return syncUrl;
  }

  return showSyncUrlDialog();
}
