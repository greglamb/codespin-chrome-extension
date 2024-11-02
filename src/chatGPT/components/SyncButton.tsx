import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";
import { writeFileContent } from "../../api/fs/files.js";

const styleSheet = new CSSStyleSheet();
const cssPath = new URL("./SyncButton.css", import.meta.url).href;
const css = await fetch(cssPath).then((r) => r.text());
styleSheet.replaceSync(css);

export class SyncButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.adoptedStyleSheets = [styleSheet];
  }

  connectedCallback() {
    this.render();
    this.shadowRoot!.querySelector("#sync-button")!.addEventListener(
      "click",
      this.handleClick.bind(this)
    );
  }

  disconnectedCallback() {
    this.shadowRoot!.querySelector("#sync-button")!.removeEventListener(
      "click",
      this.handleClick.bind(this)
    );
  }

  render() {
    const vdom = (
      <div class="sync-container">
        <span>
          <button class="sync-button" id="sync-button">
            <codespin-sync-icon></codespin-sync-icon>
            CodeSpin
          </button>
        </span>
      </div>
    );
    applyDiff(this.shadowRoot!, vdom);
  }

  async handleClick() {
    // Need to use getRootNode().host to get out of shadow DOM
    const hostElement = (this.shadowRoot!.getRootNode() as ShadowRoot).host;
    const codeSpinElement = hostElement.closest(
      '[data-codespin-attached="true"]'
    );

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

      if (filepath?.startsWith("./")) {
        writeFileContent(filepath, sourceCode);
      }
    }
  }
}

customElements.define("codespin-sync-button", SyncButton);
