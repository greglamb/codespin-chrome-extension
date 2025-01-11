import "./components/ChatGPTInboundButton.js";
import "./components/ChatGPTSyncButton.js";
import "../components/FileImporter.js";
import "../components/FileTree.js";
import "../components/FileContentViewer.js";
import "../components/icons/CodeSpinIcon.js";
import "../components/icons/SyncIcon.js";
import "../components/FileWriter.js";
import "../components/ChangeTree.js";
import "../components/FileEdits.js";
import { createDOMElement } from "webjsx";

/**
 * Attaches a sync button (<codespin-chatgpt-sync-button>) to a specific <pre> element.
 * @param preElement The <pre> element to which the sync button will be attached.
 */
function addSyncButtonToDOM(preElement: HTMLElement) {
  const previousElement = preElement.previousElementSibling;
  if (!previousElement?.textContent?.startsWith("File path:")) {
    return;
  }

  const copyButtonContainer = preElement.querySelector(
    "div > div > div > span > button"
  )?.parentElement?.parentElement;

  if (copyButtonContainer) {
    const syncButton = createDOMElement(<codespin-chatgpt-sync-button />);
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
  if (!document.querySelector("codespin-chatgpt-inbound-button")) {
    const composer = document.getElementById("composer-background");
    if (!composer) return;

    // Get second div child of composer
    const secondDiv = composer.children[1];
    if (!secondDiv) return;

    // Get first div of that div
    const targetDiv = secondDiv.children[0];
    if (!targetDiv) return;

    const inboundButton = createDOMElement(
      <codespin-chatgpt-inbound-button></codespin-chatgpt-inbound-button>
    );

    // Append as last element
    targetDiv.appendChild(inboundButton as Element);
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
