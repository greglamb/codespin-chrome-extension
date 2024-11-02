import * as webjsx from "../libs/webjsx/index.js";
import { applyDiff } from "../libs/webjsx/index.js";
import { getCSS } from "../api/loadCSS.js";
import { writeFileContent } from "../api/fs/files.js";

const styleSheet = await getCSS("./FileWriter.css", import.meta.url);

interface FileChange {
  path: string;
  content: string;
}

export class FileWriter extends HTMLElement {
  #files: FileChange[] = [];
  #selectedFiles: Set<string> = new Set();
  #currentFile: string | null = null;
  #treeWidth: number = 300;
  #isDragging: boolean = false;
  #dragStartX: number = 0;
  #dragStartWidth: number = 0;
  #contentViewer: any = null;

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

  setFiles(files: FileChange[], initialSelectedFile: string) {
    this.#files = files;
    this.#selectedFiles = new Set([initialSelectedFile]);
    this.#currentFile = initialSelectedFile;
    this.#updateContent();
    this.render();
  }

  #updateContent() {
    if (!this.#contentViewer || !this.#currentFile) return;

    const currentFile = this.#files.find((f) => f.path === this.#currentFile);
    if (currentFile) {
      this.#contentViewer.setContent(currentFile.content, currentFile.path);
    }
  }

  handleSelect(e: CustomEvent<string[]>) {
    const selected = e.detail[0]; // Get first selected file
    if (selected) {
      this.#currentFile = selected;
      this.#selectedFiles = new Set(e.detail);
      this.#updateContent();
      this.render();
    }
  }

  handleCancel() {
    this.dispatchEvent(new Event("cancel"));
  }

  async handleWrite() {
    try {
      const selectedFiles = this.#files.filter((file) =>
        this.#selectedFiles.has(file.path)
      );

      await Promise.all(
        selectedFiles.map((file) => writeFileContent(file.path, file.content))
      );
      this.dispatchEvent(new Event("written"));
    } catch (error) {
      console.error("Error writing files:", error);
    }
  }

  render() {
    const selectedCount = this.#selectedFiles.size;

    const vdom = (
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="main-container">
            <div
              class="tree-container"
              style={`--tree-width: ${this.#treeWidth}px`}
            >
              <codespin-change-tree
                ref={(el: any) => {
                  if (el && this.#files.length > 0) {
                    el.setFiles(this.#files, this.#currentFile!);
                  }
                }}
                onselect={(e: CustomEvent<string[]>) => this.handleSelect(e)}
              />
            </div>

            <div class="separator"></div>

            <div class="content-container">
              <codespin-file-edits
                ref={(el) => {
                  this.#contentViewer = el;
                  this.#updateContent();
                }}
              />
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
              class="button button-write"
              onclick={() => this.handleWrite()}
              disabled={selectedCount === 0}
            >
              Write {selectedCount} File{selectedCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }
}

customElements.define("codespin-file-writer", FileWriter);
