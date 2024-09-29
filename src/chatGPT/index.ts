import { checkSyncUrl } from "../networkUtils.js";
import { getProjectSyncUrl } from "../projectSyncUrls.js";
import * as syncStatusStore from "../syncStatusStore.js";

import "./components/Menu.js";
import "./components/OptionsDialog.js";
import "./components/PromptDialog.js";
import "./components/SyncButton.js";
import "./components/SyncStatusButton.js";
import "./components/SyncUrlDialog.js";

/**
 * Attaches a sync button (codespin-sync-button) to a specific <pre> element.
 * @param preElement The <pre> element to which the sync button will be attached.
 */
function attachSyncButton(preElement: HTMLElement) {
  const filePath = preElement.dataset.filePath || "";

  if (filePath) {
    const copyButtonContainer = preElement.querySelector(
      "div > div > div > span > button"
    )?.parentElement?.parentElement;

    if (copyButtonContainer) {
      const syncButton = document.createElement("codespin-sync-button");
      copyButtonContainer.parentElement?.insertBefore(
        syncButton,
        copyButtonContainer
      );
    }
  }
}

/**
 * Attaches CodeSpin links to all <pre> elements on the page.
 * This function should be called periodically to handle dynamically added code blocks.
 */
export async function attachCodeSpinLinks() {
  const currentUrl = window.location.href;
  const syncUrl = getProjectSyncUrl(currentUrl);

  if (!syncUrl || syncUrl.trim() === "") {
    syncStatusStore.setConnectionState("disconnected");
  } else {
    const isValid = await checkSyncUrl(syncUrl);
    if (!isValid) {
      syncStatusStore.setConnectionState("disconnected");
    } else {
      syncStatusStore.setConnectionState("connected");
    }
  }

  const codeBlocks = document.querySelectorAll("pre");

  codeBlocks.forEach((preElement) => {
    if (!preElement.dataset.codespinAttached) {
      attachSyncButton(preElement);
      preElement.dataset.codespinAttached = "true";
    }
  });
}

/**
 * Initializes the CodeSpin functionality by setting up necessary components
 * and observers.
 */
export function initializeCodeSpin() {
  // Initialize the Sync Status Button
  const syncStatusButton = document.createElement(
    "codespin-sync-status-button"
  );
  document.body.appendChild(syncStatusButton);

  // Initial attachment of CodeSpin links
  attachCodeSpinLinks();

  // Set up a MutationObserver to handle dynamically added code blocks
  const observer = new MutationObserver(() => {
    attachCodeSpinLinks();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Optionally, set up periodic checks (if necessary)
  setInterval(() => {
    attachCodeSpinLinks();
  }, 3000);
}

// Automatically initialize CodeSpin when this module is imported
initializeCodeSpin();
