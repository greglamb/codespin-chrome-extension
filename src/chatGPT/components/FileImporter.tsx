import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";
import { getFileContent } from "../../api/fs/files.js";
import { FileContentViewer } from "./FileContentViewer.js";
import { exception } from "../../exception.js";

const styleSheet = new CSSStyleSheet();

const cssPath = new URL("./FileImporter.css", import.meta.url).href;
const css = await fetch(cssPath).then((r) => r.text());
styleSheet.replaceSync(css);

export class FileImporter extends HTMLElement {
  #selectedFiles: Set<string> = new Set();
  #treeWidth: number = 300; // Default width
  #isDragging: boolean = false;
  #dragStartX: number = 0;
  #dragStartWidth: number = 0;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.adoptedStyleSheets = [styleSheet];
  }

  connectedCallback() {
    this.render();
    this.#setupDragListeners();
  }

  disconnectedCallback() {
    document.removeEventListener("mousemove", this.#handleMouseMove);
    document.removeEventListener("mouseup", this.#handleMouseUp);
  }

  #handleMouseMove = (e: MouseEvent) => {
    if (!this.#isDragging) return;

    const deltaX = e.clientX - this.#dragStartX;
    const newWidth = Math.max(
      200,
      Math.min(800, this.#dragStartWidth + deltaX)
    );
    this.#treeWidth = newWidth;
    this.render();
  };

  #handleMouseUp = () => {
    if (!this.#isDragging) return;

    this.#isDragging = false;
    document.removeEventListener("mousemove", this.#handleMouseMove);
    document.removeEventListener("mouseup", this.#handleMouseUp);
    const separator = this.shadowRoot!.querySelector(".separator");
    if (separator) {
      separator.classList.remove("dragging");
    }
  };

  #setupDragListeners() {
    const separator = this.shadowRoot!.querySelector(".separator");
    if (!separator) return;

    separator.addEventListener("mousedown", (e: Event) => {
      this.#isDragging = true;
      this.#dragStartX = (e as MouseEvent).clientX;
      this.#dragStartWidth = this.#treeWidth;
      separator.classList.add("dragging");

      document.addEventListener("mousemove", this.#handleMouseMove);
      document.addEventListener("mouseup", this.#handleMouseUp);
      e.preventDefault();
    });
  }

  async handleFileSelect(e: CustomEvent) {
    const newSelection = e.detail;
    this.#selectedFiles = new Set(newSelection);
    const selectedCount = this.#selectedFiles.size;

    const viewer = this.shadowRoot!.querySelector(
      "codespin-file-content-viewer"
    ) as FileContentViewer;

    if (viewer) {
      if (selectedCount === 0) {
        viewer.setContent("", undefined);
      } else if (selectedCount === 1) {
        try {
          const selectedFile = Array.from(this.#selectedFiles)[0];
          const response = await getFileContent(selectedFile);
          if (response?.success) {
            viewer.setContent(
              response.result.contents,
              response.result.filename
            );
          }
        } catch (err: any) {
          viewer.setContent(
            `Error loading file contents: ${err.message}`,
            undefined
          );
        }
      } else {
        viewer.setContent(
          `${selectedCount} files selected. Select a single file to view its contents.`,
          undefined
        );
      }
    }

    requestAnimationFrame(() => {
      this.render();
    });
  }

  handleCancel() {
    this.dispatchEvent(new Event("cancel"));
  }

  async handleSelect() {
    const selectedFiles = Array.from(this.#selectedFiles);

    if (selectedFiles.length === 0) {
      return;
    }

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

    this.dispatchEvent(new CustomEvent("select", { detail: selectedFiles }));
  }

  render() {
    const selectedCount = this.#selectedFiles.size;

    (
      this.shadowRoot!.querySelector(".file-tree-container") as HTMLElement
    )?.style.setProperty("--tree-width", `${this.#treeWidth}px`);
    (
      this.shadowRoot!.querySelector(".button-select") as HTMLElement
    )?.style.setProperty(
      "--select-bg",
      selectedCount === 0 ? "#555" : "#2b579a"
    );
    (
      this.shadowRoot!.querySelector(".button-select") as HTMLElement
    )?.style.setProperty(
      "--select-cursor",
      selectedCount === 0 ? "not-allowed" : "pointer"
    );
    (
      this.shadowRoot!.querySelector(".button-select") as HTMLElement
    )?.style.setProperty("--select-opacity", selectedCount === 0 ? "0.7" : "1");

    const vdom = (
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="main-container">
            <div class="file-tree-container">
              <codespin-file-tree
                onselect={(e) => {
                  this.handleFileSelect(e);
                }}
                oncancel={() => this.handleCancel()}
              ></codespin-file-tree>
            </div>

            <div class="separator"></div>

            <div class="content-container">
              <codespin-file-content-viewer class="viewer-container"></codespin-file-content-viewer>
            </div>
          </div>

          <div class="button-container">
            <button
              class="button button-cancel"
              onclick={() => this.handleCancel()}
            >
              Cancel
            </button>
            <button
              class="button button-select"
              onclick={() => this.handleSelect()}
              disabled={selectedCount === 0}
            >
              Select {selectedCount} file{selectedCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }
}

customElements.define("codespin-file-importer", FileImporter);
