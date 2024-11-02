import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";

import { writeFileContent } from "../../api/fs/files.js";

export class SyncButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Render the button and attach the event listener
    this.render();
    this.querySelector("#sync-button")!.addEventListener(
      "click",
      this.handleClick.bind(this)
    );
  }

  disconnectedCallback() {
    // Clean up the event listener when the element is removed
    this.querySelector("#sync-button")!.removeEventListener(
      "click",
      this.handleClick.bind(this)
    );
  }

  render() {
    const vdom = (
      <div
        class="flex items-center rounded bg-token-main-surface-secondary px-2 font-sans text-xs text-token-text-secondary"
        style="margin-right: 4px"
      >
        <span>
          <button class="flex gap-1 items-center py-1" id="sync-button">
            <codespin-sync-icon></codespin-sync-icon>
            CodeSpin
          </button>
        </span>
      </div>
    );
    applyDiff(this, vdom); // Applying diff to the light DOM
  }

  async handleClick() {
    // Find the parent element with data-codespin-attached attribute
    const codeSpinElement = this.closest('[data-codespin-attached="true"]');

    if (codeSpinElement) {
      // Get filepath
      let filepath;
      let previousElement = codeSpinElement.previousElementSibling;
      while (previousElement) {
        const textContent = previousElement.textContent;
        if (textContent && textContent.startsWith("File path:")) {
          filepath = textContent.replace("File path:", "").trim();
          break;
        }
        previousElement = previousElement.previousElementSibling;
      }

      // Get source code
      const codeElement = codeSpinElement.querySelector("code");
      const sourceCode = codeElement ? codeElement.innerText : "";

      // Log both
      console.log("File path:", filepath);
      console.log("Source code:", sourceCode);

      if (filepath?.startsWith("./")) {
        writeFileContent(filepath, sourceCode);
      }
    }
  }
}

// Register the custom element for use
customElements.define("codespin-sync-button", SyncButton);
