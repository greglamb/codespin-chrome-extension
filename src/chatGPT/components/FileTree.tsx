import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";
import { getFiles } from "../../api/files.js";
import { FileSystemNode } from "../../messageTypes.js";

export class FileTreeSelector extends HTMLElement {
  #expandedNodes: Set<string> = new Set();
  #selectedFiles: Set<string> = new Set();
  #files: FileSystemNode | null = null;
  #loading: boolean = false;
  #error: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    await this.fetchFiles();
    this.render();
  }

  async fetchFiles() {
    this.#loading = true;
    this.#error = null;
    this.render();

    try {
      const response = await getFiles();
      if (response?.success) {
        this.#files = response.result as FileSystemNode;
      } else {
        this.#error = "Failed to load files";
      }
    } catch (err) {
      this.#error = "Error loading files";
    } finally {
      this.#loading = false;
      this.render();
    }
  }

  toggleNode(path: string) {
    if (this.#expandedNodes.has(path)) {
      this.#expandedNodes.delete(path);
    } else {
      this.#expandedNodes.add(path);
    }
    this.render();
  }

  toggleSelect(path: string) {
    if (this.#selectedFiles.has(path)) {
      this.#selectedFiles.delete(path);
    } else {
      this.#selectedFiles.add(path);
    }
    this.render();
  }

  renderNode(node: FileSystemNode, path: string) {
    const isExpanded = this.#expandedNodes.has(path);
    const isSelected = this.#selectedFiles.has(path);
    const fullPath = path ? `${path}/${node.name}` : node.name;

    if (node.type === "file") {
      return (
        <div
          class="file-item"
          style={`
            padding: 4px 8px;
            padding-left: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            ${isSelected ? "background-color: #2b579a; color: white;" : ""}
          `}
          onclick={() => this.toggleSelect(fullPath)}
        >
          <span>📄</span>
          <span>{node.name}</span>
          <span
            style={`
            color: ${isSelected ? "#ccc" : "#666"}; 
            font-size: 0.8em;
          `}
          >
            ({node.length} bytes)
          </span>
        </div>
      );
    }

    return (
      <div>
        <div
          class="dir-item"
          style={`
            padding: 4px 8px;
            padding-left: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            user-select: none;
          `}
          onclick={(e) => {
            e.stopPropagation();
            this.toggleNode(fullPath);
          }}
        >
          <span>{isExpanded ? "▾" : "▸"}</span>
          <span>📁</span>
          <span>{node.name}</span>
        </div>
        {isExpanded && node.contents && (
          <div style="margin-left: 12px;">
            {node.contents.map((child) => this.renderNode(child, fullPath))}
          </div>
        )}
      </div>
    );
  }

  render() {
    const vdom = (
      <div
        style="
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 8px 0;
        border-radius: 4px;
        max-height: 500px;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
      "
      >
        <style>
          {`
            .file-item:hover {
              background-color: #2b579a44;
            }
            .dir-item:hover {
              background-color: #2b579a22;
            }
          `}
        </style>
        {this.#loading && <div style="padding: 8px 24px;">Loading...</div>}
        {this.#error && (
          <div style="padding: 8px 24px; color: #f14c4c;">{this.#error}</div>
        )}
        {this.#files && this.renderNode(this.#files, "")}

        <div
          style="
          margin-top: 16px;
          padding: 8px 24px;
          border-top: 1px solid #333;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        "
        >
          <button
            onclick={() => this.dispatchEvent(new Event("cancel"))}
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
            onclick={() => {
              const detail = Array.from(this.#selectedFiles);
              this.dispatchEvent(new CustomEvent("select", { detail }));
            }}
            style="
              padding: 6px 12px;
              background: #2b579a;
              border: none;
              color: white;
              border-radius: 4px;
              cursor: pointer;
            "
          >
            Select {this.#selectedFiles.size} file
            {this.#selectedFiles.size !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }

  getSelectedFiles(): string[] {
    return Array.from(this.#selectedFiles);
  }
}

customElements.define("codespin-file-tree", FileTreeSelector);
