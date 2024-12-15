import { insertHTML } from "../../api/contentEditable.js";
import { getCSS } from "../../api/loadCSS.js";
import { fromFileSelection } from "../../api/prompt.js";
import * as webjsx from "../../libs/webjsx/factory.js";
import { applyDiff, createNode } from "../../libs/webjsx/index.js";

const styleSheet = await getCSS("./ClaudeInboundButton.css", import.meta.url);

export class ClaudeInboundButton extends HTMLElement {
  #dialog: HTMLDialogElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.adoptedStyleSheets = [styleSheet];
  }

  connectedCallback() {
    this.render();
    this.shadowRoot!.querySelector(
      "#codespin-claude-inbound-icon-wrapper"
    )?.addEventListener("click", this.handleClick.bind(this));
  }

  disconnectedCallback() {
    this.#dialog?.remove();
    this.#dialog = null;
  }

  async initializeDialog() {
    if (this.#dialog) return;
    this.#dialog = createNode(
      <dialog class="dialog">
        <codespin-file-importer
          onselect={(e: CustomEvent<string[]>) => {
            this.handleFileSelection(e.detail);
            this.#dialog?.close();
          }}
          oncancel={() => {
            this.#dialog?.close();
          }}
        />
      </dialog>
    ) as HTMLDialogElement;
    document.body.appendChild(this.#dialog);
  }

  async handleFileSelection(selectedFiles: string[]) {
    try {
      const prompt = await fromFileSelection(selectedFiles);
      const editor = document.querySelector(
        '.ProseMirror[contenteditable="true"]'
      );
      if (editor) {
        insertHTML(editor, prompt);
      }
    } catch (error) {
      console.error("Error loading file contents:", error);
    }
  }

  render() {
    const vdom = (
      <div
        class="inbound-button"
        aria-disabled="false"
        aria-label="Add Source Code"
        id="codespin-claude-inbound-icon-wrapper"
      >
        <codespin-icon></codespin-icon>
      </div>
    );
    applyDiff(this.shadowRoot!, vdom);
  }

  async handleClick() {
    await this.initializeDialog();
    const importer = this.#dialog?.querySelector("codespin-file-importer");
    if (importer) {
      (importer as any).show();
    }
    this.#dialog?.showModal();
  }
}

customElements.define("codespin-claude-inbound-button", ClaudeInboundButton);