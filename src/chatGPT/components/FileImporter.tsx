import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";
import { getFileContent } from "../../api/fs/files.js";
import { FileContentViewer } from "./FileContentViewer.js";
import { exception } from "../../exception.js";

export class FileImporter extends HTMLElement {
  #selectedFiles: Set<string> = new Set();
  #treeWidth: number = 300; // Default width
  #isDragging: boolean = false;
  #dragStartX: number = 0;
  #dragStartWidth: number = 0;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
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

    // Update content viewer based on selection
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
      `
    
    \n======================\nEnd of file contents\n

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

    const styles = `
      .file-tree-container {
        flex: 0 0 ${this.#treeWidth}px;
        display: flex;
        flex-direction: column;
        min-width: 200px;
        max-width: 800px;
        height: 100%;
      }
      
      .separator {
        width: 8px;
        margin: 0 -4px;
        background: transparent;
        position: relative;
        cursor: col-resize;
        z-index: 10;
        flex: none;
      }
      
      .separator::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #444;
        transition: background 0.2s;
      }
      
      .separator:hover::after,
      .separator.dragging::after {
        background: #666;
      }
      
      codespin-file-tree {
        height: 100%;
        white-space: nowrap;
        display: block;
        width: 100%;
        overflow-x: auto;
        overflow-y: auto;
      }
      
      .content-container {
        flex: 1;
        height: 100%;
        overflow: hidden;
        min-width: 0;
      }

      .main-container {
        height: 100%;
        display: flex;
        gap: 0;
      }
    `;

    const vdom = (
      <div
        style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
        "
      >
        <style>{styles}</style>
        <div
          style="
            position: relative;
            width: calc(100% - 200px);
            height: calc(100% - 200px);
            display: flex;
            flex-direction: column;
            background: #1e1e1e;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          "
        >
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
              <codespin-file-content-viewer style="height: 100%;"></codespin-file-content-viewer>
            </div>
          </div>

          <div
            style="
              position: absolute;
              bottom: 16px;
              right: 16px;
              display: flex;
              gap: 8px;
            "
          >
            <button
              onclick={() => this.handleCancel()}
              style="
                padding: 6px 12px;
                background: #333;
                border: none;
                color: white;
                border-radius: 4px;
                cursor: pointer;
              "
            >
              Cancel
            </button>
            <button
              onclick={() => this.handleSelect()}
              disabled={selectedCount === 0}
              style={`
                padding: 6px 12px;
                background: ${selectedCount === 0 ? "#555" : "#2b579a"};
                border: none;
                color: white;
                border-radius: 4px;
                cursor: ${selectedCount === 0 ? "not-allowed" : "pointer"};
                opacity: ${selectedCount === 0 ? "0.7" : "1"};
              `}
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
