import { getCSS } from "../../api/loadCSS.js";
import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";
import { getFileContent } from "../../api/fs/files.js";
import { exception } from "../../exception.js";

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
    // Clean up the dialog when the component is removed
    this.#dialog?.remove();
    this.#dialog = null;
  }

  async initializeDialog() {
    if (this.#dialog) return;

    this.#dialog = webjsx.createNode(
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
      const prompt =
        "File contents below:\n======================\n" +
        (
          await Promise.all(
            selectedFiles.map(async (filePath) => {
              const fileContentsResponse = await getFileContent(filePath);
              return fileContentsResponse.success
                ? `File path: ./${fileContentsResponse.result.path}\n\`\`\`\n${fileContentsResponse.result.contents}\`\`\`\n`
                : exception(`Failed to fetch ${filePath}`);
            })
          )
        ).join("\n\n") +
        `\n======================\nEnd of file contents\n

          All the code you output in this conversation should be formatted in the following way:

          File path: ./path/to/file1.txt
          \`\`\`
          file1.txt contents go here...
          \`\`\`

          File path: ./path/to/file2.txt
          \`\`\`
          file2.txt contents go here...
          \`\`\`

          Note that you must always output the entire file whenever you're changing something.
          \n\n`;

      const editor = document.querySelector(
        '.ProseMirror[contenteditable="true"]'
      );
      if (editor) {
        // Split the prompt by newlines
        const lines = prompt.split("\n");

        // Create and append a p element for each line
        lines.forEach((line) => {
          if (line.trim()) {
            // Only create elements for non-empty lines
            const p = document.createElement("p");
            p.textContent = line;
            editor.appendChild(p);
          }
        });
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
    this.#dialog?.showModal();
  }
}

customElements.define("codespin-claude-inbound-button", ClaudeInboundButton);
