import { attachSyncButton } from "./syncButton";
import {
  showSyncStatusButton,
  setButtonBgColor,
  setButtonText,
} from "./syncStatusButton";
import { getProjectSyncUrl } from "./projectSyncUrls";

async function checkSyncUrl(url: string): Promise<boolean> {
  if (!url) {
    // If the URL is an empty string or null, return false immediately
    return false;
  }
  try {
    const response = await fetch(url, { method: "GET" });
    return response.ok;
  } catch (error) {
    console.error("Error checking sync URL:", error);
    return false;
  }
}

export async function attachCodeSpinLinks() {
  const currentUrl = window.location.href;
  const syncUrl = getProjectSyncUrl(currentUrl);

  if (!syncUrl || syncUrl.trim() === "") {
    // If there's no sync URL or it's an empty string, update the button to "Not Connected"
    setButtonBgColor("gray");
    setButtonText("Not Connected");
    showSyncStatusButton();
  } else {
    const isValid = await checkSyncUrl(syncUrl);
    if (!isValid) {
      setButtonBgColor("gray");
      setButtonText("Not Connected");
    } else {
      setButtonBgColor("green");
      setButtonText("CodeSpin Syncing");
    }
    showSyncStatusButton();
  }

  const codeBlocks = document.querySelectorAll("pre");

  codeBlocks.forEach((preElement) => {
    if (!(preElement as any).attachedCodeSpinLink) {
      attachSyncButton(preElement as HTMLElement);
      (preElement as any).attachedCodeSpinLink = true;
    }
  });
}
