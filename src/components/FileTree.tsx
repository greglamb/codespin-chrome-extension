import * as webjsx from "../libs/webjsx/index.js";
import { applyDiff } from "../libs/webjsx/index.js";
import { getFiles } from "../api/fs/files.js";
import { FileSystemNode } from "../messageTypes.js";
import { getCSS } from "../api/loadCSS.js";
import { getRootDirectoryName } from "../api/fs/getDirectoryHandle.js";

const styleSheet = await getCSS("./FileTree.css", import.meta.url);

export class FileTreeSelector extends HTMLElement {
  #expandedNodes: Set<string> = new Set();
  #selectedFiles: Set<string> = new Set();
  #files: FileSystemNode | null = null;
  #loading: boolean = false;
  #error: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.adoptedStyleSheets = [styleSheet];
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
        this.dispatchEvent(new CustomEvent("select", { detail: newSelection }));
      }
    }

    this.render();
  }

  sortContents(contents: FileSystemNode[]): FileSystemNode[] {
    // Separate directories and files
    const directories = contents.filter((node) => node.type !== "file");
    const files = contents.filter((node) => node.type === "file");

    // Sort directories and files separately by name
    const sortedDirectories = directories.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));

    // Return concatenated sorted arrays with directories first
    return [...sortedDirectories, ...sortedFiles];
  }

  renderNode(node: FileSystemNode, path: string, isRoot: boolean = false) {
    const fullPath = isRoot ? "." : path ? `${path}/${node.name}` : node.name;
    const isExpanded = isRoot || this.#expandedNodes.has(fullPath);
    const isSelected = this.#selectedFiles.has(fullPath);

    if (node.type === "file") {
      return (
        <div
          class={`file-item ${isSelected ? "selected" : ""}`}
          onclick={(e) => this.handleSelect(e, fullPath, node)}
        >
          <span>📄</span>
          <span>{node.name}</span>
          <span class="file-meta"></span>
        </div>
      );
    }

    return (
      <div>
        <div
          class={`dir-item ${isRoot ? "root" : ""}`}
          onclick={(e) => !isRoot && this.handleDirClick(e, fullPath)}
        >
          {!isRoot && <span>{isExpanded ? "▾" : "▸"}</span>}
          <span>📁</span>
          <span>{isRoot ? getRootDirectoryName() : node.name}</span>
        </div>
        {isExpanded && node.contents && (
          <div class={`dir-contents ${isRoot ? "root" : ""}`}>
            {this.sortContents(node.contents).map((child) =>
              this.renderNode(child, fullPath)
            )}
          </div>
        )}
      </div>
    );
  }

  render() {
    const vdom = (
      <div class="tree-container">
        {this.#loading && <div class="message">Loading...</div>}
        {this.#error && <div class="error-message">{this.#error}</div>}
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
