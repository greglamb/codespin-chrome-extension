import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";
import { getFiles } from "../../api/fs/files.js";
import { ConnectionInfo } from "../../messageTypes.js";
import { Connection } from "./Connection.js";

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
    const filesResponse = await getFiles();
  }

  promptForConnection() {
    return new Promise<ConnectionInfo | undefined>((resolve) => {
      const connectionForm = webjsx.createNode(
        <codespin-connection resolve={resolve} />
      ) as Connection;
      document.body.appendChild(connectionForm);
    });
  }
}

// Register the custom element for use
customElements.define("codespin-sync-button", SyncButton);
