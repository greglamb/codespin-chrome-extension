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

  handleDirClick(e: MouseEvent, path: string) {
    e.stopPropagation();
    if (this.#expandedNodes.has(path)) {
      this.#expandedNodes.delete(path);
    } else {
      this.#expandedNodes.add(path);
    }
    this.render();
  }

  handleSelect(e: MouseEvent, path: string, node: FileSystemNode) {
    e.stopPropagation();

    if (node.type === "file") {
      const prevSelection = new Set(this.#selectedFiles);

      if (!e.ctrlKey && !e.metaKey) {
        // Single click without Ctrl/Cmd - clear selection and select only this file
        this.#selectedFiles.clear();
        this.#selectedFiles.add(path);
      } else {
        // Ctrl/Cmd click - toggle selection
        if (this.#selectedFiles.has(path)) {
          this.#selectedFiles.delete(path);
        } else {
          this.#selectedFiles.add(path);
        }
      }

      // Only dispatch if selection actually changed
      const newSelection = Array.from(this.#selectedFiles);
      const prevArray = Array.from(prevSelection);
      if (
        newSelection.length !== prevArray.length ||
        !newSelection.every((file) => prevSelection.has(file))
      ) {
        console.log("Selection changed:", newSelection);
        this.dispatchEvent(new CustomEvent("select", { detail: newSelection }));
      }
    }

    this.render();
  }

  renderNode(node: FileSystemNode, path: string, isRoot: boolean = false) {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = isRoot || this.#expandedNodes.has(fullPath);
    const isSelected = this.#selectedFiles.has(fullPath);

    if (node.type === "file") {
      return (
        <div
          class={`file-item ${isSelected ? "selected" : ""}`}
          style={`
            padding: 4px 8px;
            padding-left: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            ${isSelected ? "background-color: #2b579a; color: white;" : ""}
            position: relative;
          `}
          onclick={(e) => this.handleSelect(e, fullPath, node)}
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
            padding-left: ${isRoot ? "8px" : "24px"};
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            user-select: none;
          `}
          onclick={(e) => !isRoot && this.handleDirClick(e, fullPath)}
        >
          {!isRoot && <span>{isExpanded ? "▾" : "▸"}</span>}
          <span>📁</span>
          <span>{isRoot ? "Project Files" : node.name}</span>
        </div>
        {isExpanded && node.contents && (
          <div style={`margin-left: ${isRoot ? "0px" : "12px"};`}>
            {node.contents.map((child) => this.renderNode(child, fullPath))}
          </div>
        )}
      </div>
    );
  }

  render() {
    const vdom = (
      <div style="height: 100%; background: #252526; border-radius: 4px; overflow-y: auto; font-size: 13px;">
        <style>
          {`
            .file-item {
              position: relative;
              transition: background-color 0.1s ease;
            }
            .file-item:hover {
              background-color: #2b579a44;
            }
            .file-item.selected {
              background-color: #2b579a;
              color: white;
            }
            .file-item.selected:hover {
              background-color: #2b579add;
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
        {this.#files && this.renderNode(this.#files, "", true)}
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }

  getSelectedFiles(): string[] {
    return Array.from(this.#selectedFiles);
  }
}

customElements.define("codespin-file-tree", FileTreeSelector);
