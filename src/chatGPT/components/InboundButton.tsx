import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";

const styleSheet = new CSSStyleSheet();
const cssPath = new URL("./InboundButton.css", import.meta.url).href;
const css = await fetch(cssPath).then((r) => r.text());
styleSheet.replaceSync(css);

export class InboundButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.adoptedStyleSheets = [styleSheet];
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
        class="inbound-button"
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
      <dialog class="dialog">
        <codespin-file-importer
          onselect={(e: CustomEvent<string[]>) => {
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
