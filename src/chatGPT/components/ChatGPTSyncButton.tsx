// File path:./src/chatGPT/components/ChatGPTSyncButton.tsx
import { getCSS } from "../../api/loadCSS.js";
import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";

const styleSheet = await getCSS("./ChatGPTSyncButton.css", import.meta.url);

interface FileChange {
  path: string;
  content: string;
}

export class ChatGPTSyncButton extends HTMLElement {
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
    const codeSpinElement = (
      this.shadowRoot!.getRootNode() as ShadowRoot
    ).host.closest('[data-codespin-attached="true"]');

    if (codeSpinElement) {
      const filePathElement = codeSpinElement.previousElementSibling;
      if (
        filePathElement &&
        filePathElement.textContent?.startsWith("File path:")
      ) {
        return filePathElement.textContent.replace("File path:", "").trim();
      }
    }
    return null;
  }

  collectSyncButtonFiles(): FileChange[] {
    const changesMap = new Map<string, string>();
    const codeSpinElements = document.querySelectorAll(
      '[data-codespin-attached="true"]'
    );

    codeSpinElements.forEach((element) => {
      const filePathElement = element.previousElementSibling;
      if (
        filePathElement &&
        filePathElement.textContent?.startsWith("File path:")
      ) {
        const filepath = filePathElement.textContent
          .replace("File path:", "")
          .trim();
        const codeElement = element.querySelector("code");
        const sourceCode = codeElement ? codeElement.innerText : "";

        if (filepath.startsWith("./")) {
          changesMap.set(filepath, sourceCode);
        }
      }
    });

    return Array.from(changesMap, ([path, content]) => ({ path, content }));
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
      const clickedFilePath = this.getClickedFilePath();
      if (!clickedFilePath) {
        console.warn("Could not determine file path for sync button");
        return;
      }

      const changes = this.collectSyncButtonFiles();
      if (changes.length === 0) {
        console.warn("No file changes detected");
        return;
      }

      const viewer = this.#dialog.querySelector("codespin-file-writer");
      if (viewer) {
        (viewer as any).setFiles(changes, clickedFilePath);
        this.#dialog.showModal();
      }
    }
  }
}

customElements.define("codespin-chatgpt-sync-button", ChatGPTSyncButton);
