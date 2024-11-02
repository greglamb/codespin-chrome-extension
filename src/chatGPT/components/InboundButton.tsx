import { getCSS } from "../../api/loadCSS.js";
import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";
import { getFileContent } from "../../api/fs/files.js";
import { exception } from "../../exception.js";

const styleSheet = await getCSS("./InboundButton.css", import.meta.url);

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

    All the code you produce in this conversation should be formatted in the following way:

    File path: ./path/to/file1.txt
    \`\`\`
    file1.txt contents go here...
    \`\`\`

    File path: ./path/to/file2.txt
    \`\`\`
    file2.txt contents go here...
    \`\`\`
    \n\n`;

      (document.querySelector("#prompt-textarea") as HTMLDivElement).innerText =
        prompt;
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
        id="codespin-inbound-button"
      >
        <codespin-icon></codespin-icon>
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }

  handleClick() {
    const dialog = webjsx.createNode(
      <dialog class="dialog">
        <codespin-file-importer
          onselect={(e: CustomEvent<string[]>) => {
            this.handleFileSelection(e.detail);
            dialog.remove();
          }}
          oncancel={() => {
            dialog.remove();
          }}
        />
      </dialog>
    ) as HTMLDialogElement;

    document.body.appendChild(dialog);
    dialog.showModal();
  }
}

customElements.define("codespin-inbound-button", InboundButton);
