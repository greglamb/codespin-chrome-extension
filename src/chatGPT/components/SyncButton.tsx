import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";
import { getCSS } from "../../api/loadCSS.js";

const styleSheet = await getCSS("./SyncButton.css", import.meta.url);

interface FileChange {
  path: string;
  content: string;
}

export class SyncButton extends HTMLElement {
  #dialog: HTMLDialogElement | null = null;

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
    this.#dialog?.remove();
    this.#dialog = null;
    this.shadowRoot!.querySelector("#sync-button")!.removeEventListener(
      "click",
      this.handleClick.bind(this)
    );
  }

  async initializeDialog() {
    if (this.#dialog) return;

    this.#dialog = webjsx.createNode(
      <dialog class="dialog">
        <codespin-file-writer
          onwritten={() => {
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

  getClickedFilePath(): string | null {
    // Get the file path associated with this sync button
    const codeSpinElement = (
      this.shadowRoot!.getRootNode() as ShadowRoot
    ).host.closest('[data-codespin-attached="true"]');

    if (codeSpinElement) {
      let previousElement = codeSpinElement.previousElementSibling;
      while (previousElement) {
        const textContent = previousElement.textContent;
        if (textContent && textContent.startsWith("File path:")) {
          return textContent.replace("File path:", "").trim();
        }
        previousElement = previousElement.previousElementSibling;
      }
    }
    return null;
  }

  collectSyncButtonFiles(): FileChange[] {
    const changes: FileChange[] = [];

    // Find all elements with codespin-attached
    const codeSpinElements = document.querySelectorAll(
      '[data-codespin-attached="true"]'
    );

    codeSpinElements.forEach((element) => {
      let filepath;
      let previousElement = element.previousElementSibling;

      // Find the filepath
      while (previousElement) {
        const textContent = previousElement.textContent;
        if (textContent && textContent.startsWith("File path:")) {
          filepath = textContent.replace("File path:", "").trim();
          break;
        }
        previousElement = previousElement.previousElementSibling;
      }

      // Get source code
      const codeElement = element.querySelector("code");
      const sourceCode = codeElement ? codeElement.innerText : "";

      if (filepath?.startsWith("./")) {
        changes.push({
          path: filepath,
          content: sourceCode,
        });
      }
    });

    return changes;
  }

  render() {
    const vdom = (
      <div class="sync-container">
        <span>
          <button class="sync-button" id="sync-button">
            <codespin-sync-icon></codespin-sync-icon>
            Code Sync
          </button>
        </span>
      </div>
    );
    applyDiff(this.shadowRoot!, vdom);
  }

  async handleClick() {
    await this.initializeDialog();

    if (this.#dialog) {
      // Get the file path for this sync button
      const clickedFilePath = this.getClickedFilePath();
      if (!clickedFilePath) {
        console.warn("Could not determine file path for sync button");
        return;
      }

      // Collect all sync button files
      const changes = this.collectSyncButtonFiles();
      if (changes.length === 0) {
        console.warn("No file changes detected");
        return;
      }

      // Get the change viewer component and set the files
      const viewer = this.#dialog.querySelector("codespin-file-writer");
      if (viewer) {
        (viewer as any).setFiles(changes, clickedFilePath);
        this.#dialog.showModal();
      }
    }
  }
}

customElements.define("codespin-sync-button", SyncButton);
