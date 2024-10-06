import * as webjsx from "webjsx";
import { SyncButton } from "./components/SyncButton.js";
import { checkSyncUrl } from "../networkUtils.js";
import { getProjectSyncUrl } from "../projectSyncUrls.js";
import * as syncStatusStore from "../syncStatusStore.js";

/**
 * Attaches a sync button (<codespin-sync-button>) to a specific <pre> element.
 * @param preElement The <pre> element to which the sync button will be attached.
 */
function attachSyncButton(preElement: HTMLElement) {
  const copyButtonContainer = preElement.querySelector(
    "div > div > div > span > button"
  )?.parentElement?.parentElement;

  if (copyButtonContainer) {
    const syncButton = webjsx.createNode(<codespin-sync-button />);
    copyButtonContainer.parentElement?.insertBefore(
      syncButton,
      copyButtonContainer
    );
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
  // Initial attachment of CodeSpin links
  attachCodeSpinLinks();

  // Optionally, set up periodic checks (if necessary)
  setInterval(() => {
    attachCodeSpinLinks();
  }, 3000);
}

// Register the custom element for use
customElements.define("codespin-sync-button", SyncButton);
