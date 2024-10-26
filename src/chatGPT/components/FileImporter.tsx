import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";
import { getFileContent } from "../../api/files.js";

export class FileImporter extends HTMLElement {
  #selectedFiles: Set<string> = new Set();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  async handleFileSelect(e: CustomEvent<string[]>) {
    // Clear the existing selection and add new files
    this.#selectedFiles.clear();
    e.detail.forEach((file) => this.#selectedFiles.add(file));

    // If there's exactly one file selected, show its contents
    if (this.#selectedFiles.size === 1) {
      const selectedFile = Array.from(this.#selectedFiles)[0];
      try {
        const response = await getFileContent(selectedFile);
        if (response?.success) {
          const viewer = this.shadowRoot!.querySelector(
            "codespin-file-content-viewer"
          );
          if (viewer instanceof HTMLElement) {
            (viewer as any).setContent(response.result);
          }
        }
      } catch (err: any) {
        const viewer = this.shadowRoot!.querySelector(
          "codespin-file-content-viewer"
        );
        if (viewer instanceof HTMLElement) {
          (viewer as any).setContent(
            `Error loading file contents: ${err.message}`
          );
        }
      }
    } else if (this.#selectedFiles.size === 0) {
      // Clear the viewer if no files are selected
      const viewer = this.shadowRoot!.querySelector(
        "codespin-file-content-viewer"
      );
      if (viewer instanceof HTMLElement) {
        (viewer as any).setContent("");
      }
    } else {
      // Show a message when multiple files are selected
      const viewer = this.shadowRoot!.querySelector(
        "codespin-file-content-viewer"
      );
      if (viewer instanceof HTMLElement) {
        (viewer as any).setContent(
          `${
            this.#selectedFiles.size
          } files selected. Select a single file to view its contents.`
        );
      }
    }

    this.render();
  }

  handleCancel() {
    this.dispatchEvent(new Event("cancel"));
  }

  handleSelect() {
    const detail = Array.from(this.#selectedFiles);
    this.dispatchEvent(new CustomEvent("select", { detail }));
  }

  render() {
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
        {/* Left Pane - File Tree */}
        <div style="flex: 0 0 300px; overflow: hidden;">
          <codespin-file-tree
            onselect={(e) => this.handleFileSelect(e)}
            oncancel={() => this.handleCancel()}
          ></codespin-file-tree>
        </div>

        {/* Right Pane - Content Viewer */}
        <div style="flex: 1; overflow: hidden;">
          <codespin-file-content-viewer style="height: 100%;"></codespin-file-content-viewer>
        </div>

        {/* Bottom Buttons */}
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
            disabled={this.#selectedFiles.size === 0}
            style={`
              padding: 6px 12px;
              background: ${
                this.#selectedFiles.size === 0 ? "#555" : "#2b579a"
              };
              border: none;
              color: white;
              border-radius: 4px;
              cursor: ${
                this.#selectedFiles.size === 0 ? "not-allowed" : "pointer"
              };
              opacity: ${this.#selectedFiles.size === 0 ? "0.7" : "1"};
            `}
          >
            Select {this.#selectedFiles.size} file
            {this.#selectedFiles.size !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }
}

customElements.define("codespin-file-importer", FileImporter);
