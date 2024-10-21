import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";

export class ModalDialog<T> extends HTMLElement {
  #resolve: ((value: T | undefined) => void) | undefined = undefined;

  // Attach a shadow root
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  // Expose the resolve function to handle a value of type T
  get resolve() {
    return this.#resolve;
  }

  set resolve(value: ((value: T | undefined) => void) | undefined) {
    this.#resolve = value;
  }

  // Function to close the modal with a specific value of type T
  close(value?: T) {
    this.#closeDialog(value);
  }

  render() {
    const vdom = (
      <>
        {/* Dark overlay for background */}
        <div
          id="overlay"
          style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.8); /* Darken the background */
            z-index: 10; /* Ensure it is behind the dialog but above other content */
          "
        ></div>

        <dialog
          id="codespin-dialog"
          style="
            width: 480px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 20; /* Ensure it is above the overlay */
            border-radius: 12px; /* Rounded corners for a softer look */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
            border: none; /* Remove default dialog border */
            background: darkgreen; 
          "
        >
          {/* Named slot for custom content */}
          <slot name="content"></slot>

          {/* Named slot for custom buttons */}
          <div
            style="
              display: flex; 
              justify-content: flex-end; 
              gap: 10px; /* Add space between the buttons */
            "
          >
            <slot name="buttons"></slot>
          </div>
        </dialog>
      </>
    );
    // Apply the virtual DOM inside the shadow DOM
    applyDiff(this.shadowRoot!, vdom);
  }

  connectedCallback() {
    this.render();
    const dialog = this.shadowRoot!.querySelector(
      "#codespin-dialog"
    ) as HTMLDialogElement;
    dialog.showModal();
  }

  // Close the dialog and resolve the promise with a value or undefined
  #closeDialog(value?: T) {
    document.body.removeChild(this.parentElement!);
    if (this.#resolve) {
      this.#resolve(value); // Resolve with the value or undefined if canceled
    }
  }
}

// Define the custom element with generics
customElements.define("codespin-modal-dialog", ModalDialog);
