import * as webjsx from "webjsx";
import "side-drawer";

import "./components/SyncButton.js";
import "./components/InboundButton.js";
import "./components/SyncForm.js";
import "./components/icons/SyncIcon.js";
import "./components/icons/CodeSpinIcon.js";

import { checkSyncUrl } from "../networkUtils.js";
import { getProjectSyncUrl } from "../projectSyncUrls.js";
import * as syncStatusStore from "../syncStatusStore.js";
import { InboundButton } from "./components/InboundButton.js";

/**
 * Attaches a sync button (<codespin-sync-button>) to a specific <pre> element.
 * @param preElement The <pre> element to which the sync button will be attached.
 */
function addSyncButtonToDOM(preElement: HTMLElement) {
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
async function attachSyncButton() {
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
      addSyncButtonToDOM(preElement);
      preElement.dataset.codespinAttached = "true";
    }
  });
}

// This needs to run only once because the textbox is created only once.
async function attachInboundButton() {
  const attachFilesButton = document.querySelector(
    'button[aria-label="Attach files"]'
  );

  // Ensure the button is found before proceeding
  if (attachFilesButton) {
    // Create a new custom element
    const inboundButton = webjsx.createNode(
      <codespin-inbound-button></codespin-inbound-button>
    );

    // Insert the custom element right after the button
    attachFilesButton.insertAdjacentElement(
      "afterend",
      inboundButton as InboundButton
    );

    // Get the parent element of the attachFilesButton (which must be a span)
    const parentElement = attachFilesButton.parentElement;

    // Ensure the parent is a span and add the display: flex style
    if (parentElement && parentElement.tagName.toLowerCase() === "span") {
      parentElement.style.display = "flex";
    }
  }
}

/**
 * Initializes the CodeSpin functionality by setting up necessary components
 * and observers.
 */
export function initializeCodeSpin() {
  // Initial attachment of CodeSpin links
  attachSyncButton();

  // We need to attach the inbound button
  attachInboundButton();

  // Optionally, set up periodic checks (if necessary)
  setInterval(() => {
    attachSyncButton();
  }, 3000);
}
