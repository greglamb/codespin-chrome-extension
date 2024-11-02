import * as webjsx from "../libs/webjsx/index.js";

import "./components/InboundButton.js";
import "./components/ModalDialog.js";
import "./components/ModalMessage.js";
import "./components/SyncButton.js";
import "./components/FileImporter.js";
import "./components/FileTree.js";
import "./components/FileContentViewer.js";
import "./components/icons/CodeSpinIcon.js";
import "./components/icons/SyncIcon.js";

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
  if (!document.querySelector("codespin-inbound-button")) {
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
      attachFilesButton.parentElement?.parentElement?.parentElement?.parentElement?.parentElement!.insertAdjacentElement(
        "afterend",
        inboundButton as InboundButton
      );
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
    attachInboundButton();
  }, 3000);
}
