import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";
import { getFileContent } from "../../api/files.js";
import { FileContentViewer } from "./FileContentViewer.js";

export class FileImporter extends HTMLElement {
  #selectedFiles: Set<string> = new Set();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  async handleFileSelect(e: CustomEvent) {
    const newSelection = e.detail;
    console.log("FileImporter received new selection:", newSelection);

    // Always create a new Set from the event detail
    this.#selectedFiles = new Set(newSelection);

    const selectedCount = this.#selectedFiles.size;
    console.log("Updated selection count:", selectedCount);

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

    // Force a render
    requestAnimationFrame(() => {
      this.render();
    });
  }

  handleCancel() {
    this.dispatchEvent(new Event("cancel"));
  }

  handleSelect() {
    const detail = Array.from(this.#selectedFiles);
    this.dispatchEvent(new CustomEvent("select", { detail }));
  }

  render() {
    const selectedCount = this.#selectedFiles.size;
    console.log("FileImporter rendering with count:", selectedCount);

    const vdom = (
      <div
        style="
          position: fixed;
          top: 100px;
          left: 100px;
          right: 100px;
          bottom: 100px;
          display: flex;
          gap: 16px;
          background: #1e1e1e;
          padding: 16px;
          border-radius: 4px;
        "
      >
        <div style="flex: 0 0 300px; overflow: hidden;">
          <codespin-file-tree
            onselect={(e) => {
              console.log("FileTree select event received");
              this.handleFileSelect(e);
            }}
            oncancel={() => this.handleCancel()}
          ></codespin-file-tree>
        </div>

        <div style="flex: 1; overflow: hidden;">
          <codespin-file-content-viewer style="height: 100%;"></codespin-file-content-viewer>
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
    );

    applyDiff(this.shadowRoot!, vdom);
  }
}

customElements.define("codespin-file-importer", FileImporter);
