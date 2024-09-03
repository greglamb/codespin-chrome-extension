import { attachSyncButton } from "./syncButton";
import { setConnectionState } from "./syncStatusButton";
import { getProjectSyncUrl } from "./projectSyncUrls";

async function checkSyncUrl(url: string): Promise<boolean> {
  if (!url) {
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
    setConnectionState("disconnected");
  } else {
    const isValid = await checkSyncUrl(syncUrl);
    if (!isValid) {
      setConnectionState("disconnected");
    } else {
      setConnectionState("connected");
    }
  }

  const codeBlocks = document.querySelectorAll("pre");

  codeBlocks.forEach((preElement) => {
    if (!(preElement as any).attachedCodeSpinLink) {
      attachSyncButton(preElement as HTMLElement);
      (preElement as any).attachedCodeSpinLink = true;
    }
  });
}
