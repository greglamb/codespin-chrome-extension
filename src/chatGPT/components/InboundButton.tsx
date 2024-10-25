import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";

export class InboundButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Render the button and attach the event listener
    this.render();
    this.querySelector("#codespin-inbound-button")!.addEventListener(
      "click",
      this.handleClick.bind(this)
    );
  }

  disconnectedCallback() {
    // Clean up the event listener when the element is removed
    this.querySelector("#codespin-inbound-button")!.removeEventListener(
      "click",
      this.handleClick.bind(this)
    );
  }

  render() {
    const vdom = (
      <button
        class="flex items-center justify-center h-8 w-8 rounded-full text-token-text-primary dark:text-white focus-visible:outline-black dark:focus-visible:outline-white mb-1; padding: 0; margin: 0;"
        aria-disabled="false"
        aria-label="CodeSpin Attach"
        id="codespin-inbound-button"
      >
        <codespin-icon></codespin-icon>
      </button>
    );

    applyDiff(this, vdom); // Applying diff to the light DOM
  }

  handleClick() {
    alert("hello world inbound..");
  }
}

// Register the custom element for use
customElements.define("codespin-inbound-button", InboundButton);
