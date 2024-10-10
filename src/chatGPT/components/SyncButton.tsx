import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";
import { getCookie } from "../../cookieUtils.js";
import { connectToServer } from "../../networkUtils.js";
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

  handleClick() {
    const token = getCookie("bearer_token");
    const serverUrl = getCookie("server_url") || "http://localhost:10860";

    connectToServer(token ?? "", serverUrl)
      .then((response) => {
        if (response.success) {
          alert("Connected");
        } else if (response.error === "BAD_TOKEN") {
          this.promptForConnection();
        } else {
          alert("Is the server running?");
        }
      })
      .catch((ex: any) => {
        alert("Is the server running?");
      });
  }

  promptForConnection() {
    let connectionForm = document.querySelector(
      "codespin-connection"
    ) as Connection;

    if (!connectionForm) {
      connectionForm = webjsx.createNode(<codespin-connection />) as Connection;
      document.body.appendChild(connectionForm);
      connectionForm.showModal();
    }
  }

  // handleClick() {
  //   let syncForm = document.querySelector("codespin-sync-form") as SyncForm;

  //   if (!syncForm) {
  //     syncForm = webjsx.createNode(<codespin-sync-form />) as SyncForm;
  //     document.body.appendChild(syncForm);
  //     (document.querySelector("codespin-sync-form") as SyncForm).showModal({
  //       onClose: () => {
  //         document.body.removeChild(syncForm);
  //       },
  //     });
  //   }
  // }
}

// Register the custom element for use
customElements.define("codespin-sync-button", SyncButton);
