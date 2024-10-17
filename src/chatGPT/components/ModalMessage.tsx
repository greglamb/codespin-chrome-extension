import * as webjsx from "webjsx";

import { ModalDialog } from "./ModalDialog.js";

export class ModalMessage extends HTMLElement {
  #modalDialog!: ModalDialog<void>;
  #title: string;
  #message: string;

  constructor() {
    super();
    this.#title = "";
    this.#message = "";
  }

  // Accept title and message as parameters
  set title(value: string) {
    this.#title = value;
    this.render(); // Re-render when title changes
  }

  get title(): string {
    return this.#title;
  }

  set message(value: string) {
    this.#message = value;
    this.render(); // Re-render when message changes
  }

  get message(): string {
    return this.#message;
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
      <>
        {/* Use ModalDialog internally */}
        <codespin-modal-dialog
          ref={(el) => (this.#modalDialog = el as ModalDialog<void>)}
        >
          <div slot="content">
            <h3>{this.#title}</h3>
            <p>{this.#message}</p>
          </div>

          <div slot="buttons">
            <button type="button" onclick={() => this.close()}>
              OK
            </button>
          </div>
        </codespin-modal-dialog>
      </>
    );
    webjsx.applyDiff(this, vdom);
  }

  connectedCallback() {
    this.render();
  }
}

// Define the custom element with generics
customElements.define("codespin-modal-message", ModalMessage);
