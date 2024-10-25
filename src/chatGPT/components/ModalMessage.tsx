import * as webjsx from "webjsx";

import { ModalDialog } from "./ModalDialog.js";

export class ModalMessage extends HTMLElement {
  #modalDialog!: ModalDialog<void>;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  // Close the dialog
  close() {
    this.#modalDialog.close(undefined); // Resolve with `undefined` for "OK" button
  }

  // Expose the resolve method to handle external promise resolution
  set resolve(value: () => void) {
    if (this.#modalDialog) {
      this.#modalDialog.resolve = value;
    }
  }

  render() {
    const vdom = (
      <codespin-modal-dialog
        ref={(el) => (this.#modalDialog = el as ModalDialog<void>)}
      >
        <div slot="content">
          <div>
            <slot name="title"></slot>
            <slot name="message"></slot>
          </div>
        </div>

        <div slot="buttons">
          <button
            style="cursor: pointer; background: white; color: darkgreen; width: 80px; padding: 8px; border-radius: 4px; border: 0px; box-shadow: none;"
            type="button"
            onclick={() => this.close()}
          >
            OK
          </button>
        </div>
      </codespin-modal-dialog>
    );
    webjsx.applyDiff(this.shadowRoot!, vdom);
  }

  connectedCallback() {
    this.render();
  }
}

// Define the custom element with generics
customElements.define("codespin-modal-message", ModalMessage);
