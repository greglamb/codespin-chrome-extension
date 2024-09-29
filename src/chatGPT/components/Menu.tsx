import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";
import "./OptionsDialog.js";
import "./PromptDialog.js";
import "./SyncUrlDialog.js";

declare module "webjsx" {
  namespace JSX {
    interface IntrinsicElements {
      "codespin-sync-status-button": {};
      "codespin-sync-button": {};
      "codespin-options-dialog": {};
      "codespin-prompt-dialog": {};
      "codespin-sync-url-dialog": {
        currentSyncUrl?: string;
      };
      "codespin-menu": {
        left?: number;
        bottom?: number;
      };
    }
  }
}


class MenuComponent extends HTMLElement {
  private left: number;
  private bottom: number;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.left = 0;
    this.bottom = 0;
    this.onPromptClick = this.onPromptClick.bind(this);
    this.onSetSyncUrlClick = this.onSetSyncUrlClick.bind(this);
    this.onOptionsClick = this.onOptionsClick.bind(this);
    this.onOutsideClick = this.onOutsideClick.bind(this);
  }

  connectedCallback() {
    this.left = parseInt(this.getAttribute("left") || "0", 10);
    this.bottom = parseInt(this.getAttribute("bottom") || "0", 10);
    this.render();
    this.shadowRoot!.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", this.onOutsideClick);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.onOutsideClick);
  }

  render() {
    const vdom = (
      <div
        id="codespin-menu"
        style={{
          position: "fixed",
          left: `${this.left}px`,
          bottom: `${this.bottom}px`,
          width: "160px",
          backgroundColor: "white",
          color: "black",
          border: "1px solid #ccc",
          borderRadius: "4px",
          zIndex: 1001,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <ul style={{ listStyleType: "none", margin: "0", padding: "0" }}>
          <li
            style={{
              padding: "8px",
              cursor: "pointer",
              borderBottom: "1px solid #ccc",
            }}
            onclick={this.onPromptClick}
          >
            Prompt
          </li>
          <li
            style={{
              padding: "8px",
              cursor: "pointer",
              borderBottom: "1px solid #ccc",
            }}
            onclick={this.onSetSyncUrlClick}
          >
            Set Sync Url
          </li>
          <li
            style={{
              padding: "8px",
              cursor: "pointer",
            }}
            onclick={this.onOptionsClick}
          >
            Options
          </li>
        </ul>
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }

  onPromptClick() {
    const promptDialog = <codespin-prompt-dialog />;
    document.body.appendChild(promptDialog);
    this.remove();
  }

  onSetSyncUrlClick() {
    const syncUrlDialog = <codespin-sync-url-dialog />;
    document.body.appendChild(syncUrlDialog);
    this.remove();
  }

  onOptionsClick() {
    const optionsDialog = <codespin-options-dialog />;
    document.body.appendChild(optionsDialog);
    this.remove();
  }

  onOutsideClick() {
    this.remove();
  }
}

customElements.define("codespin-menu", MenuComponent);
