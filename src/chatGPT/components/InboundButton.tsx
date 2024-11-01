import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";

export class InboundButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.shadowRoot!.querySelector(
      "#codespin-inbound-button"
    )?.addEventListener("click", this.handleClick.bind(this));
  }

  render() {
    const vdom = (
      <div
        style="padding: 0; margin: 0; border: 0; background: transparent;"
        aria-disabled="false"
        aria-label="Add Source Code"
        id="codespin-inbound-button"
      >
        <codespin-icon></codespin-icon>
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }

  handleClick() {
    // Create a fresh dialog each time
    const dialog = webjsx.createNode(
      <dialog
        style="
          border: none;
          padding: 0;
          background: transparent;
          max-width: 80vw;
          max-height: 80vh;
        "
      >
        <codespin-file-importer
          onselect={(e: CustomEvent<string[]>) => {
            console.log("Selected files:", e.detail);
            dialog.remove();
          }}
          oncancel={() => {
            dialog.remove();
          }}
        />
      </dialog>
    ) as HTMLDialogElement;

    // Add to document body and show
    document.body.appendChild(dialog);
    dialog.showModal();
  }
}

// Register the custom element for use
customElements.define("codespin-inbound-button", InboundButton);
