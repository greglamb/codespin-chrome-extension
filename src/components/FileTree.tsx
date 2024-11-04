import { getFiles } from "../api/fs/files.js";
import { getRootDirectoryName } from "../api/fs/getDirectoryHandle.js";
import { getCSS } from "../api/loadCSS.js";
import * as webjsx from "../libs/webjsx/index.js";
import { applyDiff } from "../libs/webjsx/index.js";
import { FileSystemNode } from "../messageTypes.js";

const styleSheet = await getCSS("./FileTree.css", import.meta.url);

export class FileTree extends HTMLElement {
  #expandedNodes: Set<string> = new Set();
  #selectedFiles: Set<string> = new Set();
  #files: FileSystemNode | null = null;
  #loading: boolean = false;
  #error: string | null = null;
  #initialized: boolean = false;

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

    if (this.#initialized) {
      // Clear existing files when refreshing
      this.#files = null;
    }

    this.render();

    try {
      const response = await getFiles(true);
      if (response?.success) {
        this.#files = response.result as FileSystemNode;
        this.#error = null;
      } else {
        this.#error = "Failed to load files";
      }
    } catch (err) {
      // Only set error if we've initialized (user has interacted)
      if (this.#initialized) {
        this.#error = "Error loading files";
      }
    } finally {
      this.#loading = false;
      this.#initialized = true;
      this.render();
    }
  }

  get files() {
    return this.#files;
  }

  getSelectedFiles(): string[] {
    return Array.from(this.#selectedFiles);
  }

  getExpandedNodes(): string[] {
    return Array.from(this.#expandedNodes);
  }

  restoreState(selectedFiles: string[], expandedNodes: string[]) {
    // Only clear if we're actually restoring something
    if (selectedFiles.length > 0) {
      this.#selectedFiles.clear();
    }
    if (expandedNodes.length > 0) {
      this.#expandedNodes.clear();
    }

    // Helper function to check if path exists in current tree
    const pathExists = (path: string): boolean => {
      if (path === ".") return true;
      let current = this.#files;
      const parts = path.split("/").filter((p) => p !== ".");

      for (const part of parts) {
        if (!current || current.type !== "dir") return false;
        const found = current.contents?.find((node) => node.name === part);
        if (!found) return false;
        current = found;
      }
      return true;
    };

    // Restore only existing paths
    for (const file of selectedFiles) {
      if (pathExists(file)) {
        this.#selectedFiles.add(file);
      }
    }

    for (const node of expandedNodes) {
      if (pathExists(node)) {
        this.#expandedNodes.add(node);
      }
    }

    // Only notify if we actually restored selected files
    if (selectedFiles.length > 0) {
      this.notifySelectionChange();
    }
    this.render();
  }

  toggleDirExpansion(path: string) {
    if (this.#expandedNodes.has(path)) {
      this.#expandedNodes.delete(path);
    } else {
      this.#expandedNodes.add(path);
    }
    this.render();
  }

  handleCaretClick(e: MouseEvent, path: string) {
    e.stopPropagation();
    const hasModifier = e.ctrlKey || e.metaKey;
    if (hasModifier) {
      this.toggleSelection(path);
    } else {
      this.toggleDirExpansion(path);
    }
  }

  handleDirNameClick(e: MouseEvent, path: string, node: FileSystemNode) {
    e.stopPropagation();
    const hasModifier = e.ctrlKey || e.metaKey;
    if (hasModifier) {
      this.toggleSelection(path);
    } else {
      // Clear other selections and select this one
      this.#selectedFiles.clear();
      this.#selectedFiles.add(path);
      this.toggleDirExpansion(path);
      this.notifySelectionChange();
    }
  }

  toggleSelection(path: string) {
    const prevSelection = new Set(this.#selectedFiles);
    if (this.#selectedFiles.has(path)) {
      this.#selectedFiles.delete(path);
    } else {
      this.#selectedFiles.add(path);
    }
    this.notifySelectionChange(prevSelection);
    this.render();
  }

  handleFileSelect(e: MouseEvent, path: string) {
    e.stopPropagation();
    const prevSelection = new Set(this.#selectedFiles);
    if (!e.ctrlKey && !e.metaKey) {
      this.#selectedFiles.clear();
      this.#selectedFiles.add(path);
    } else {
      if (this.#selectedFiles.has(path)) {
        this.#selectedFiles.delete(path);
      } else {
        this.#selectedFiles.add(path);
      }
    }
    this.notifySelectionChange(prevSelection);
    this.render();
  }

  notifySelectionChange(prevSelection?: Set<string>) {
    const newSelection = Array.from(this.#selectedFiles);
    if (prevSelection) {
      const prevArray = Array.from(prevSelection);
      if (
        newSelection.length === prevArray.length &&
        newSelection.every((file) => prevSelection.has(file))
      ) {
        return; // No change in selection
      }
    }
    this.dispatchEvent(new CustomEvent("select", { detail: newSelection }));
  }

  handleRefresh = async () => {
    const selectedFiles = this.getSelectedFiles();
    const expandedNodes = this.getExpandedNodes();
    await this.fetchFiles();
    this.restoreState(selectedFiles, expandedNodes);
  };

  sortContents(contents: FileSystemNode[]): FileSystemNode[] {
    const directories = contents.filter((node) => node.type !== "file");
    const files = contents.filter((node) => node.type === "file");
    const sortedDirectories = directories.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));
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
          onclick={(e) => this.handleFileSelect(e, fullPath)}
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
          class={`dir-item ${isRoot ? "root" : ""} ${
            isSelected ? "selected" : ""
          }`}
          onclick={(e) => {
            if (!isRoot) {
              this.handleDirNameClick(e, fullPath, node);
            }
          }}
        >
          {!isRoot && (
            <span
              onclick={(e) => {
                e.stopPropagation();
                this.handleCaretClick(e, fullPath);
              }}
            >
              {isExpanded ? "▾" : "▸"}
            </span>
          )}
          <span>📁</span>
          <span>{isRoot ? getRootDirectoryName() : node.name}</span>
          {isRoot && (
            <button
              class="refresh-button"
              onclick={(e) => {
                e.stopPropagation();
                this.handleRefresh();
              }}
              title="Refresh file tree"
            >
              🔄
            </button>
          )}
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
        {this.#loading && !this.#files && <div class="message">Loading...</div>}
        {this.#error && <div class="error-message">{this.#error}</div>}
        {!this.#loading &&
          !this.#error &&
          !this.#files &&
          !this.#initialized && (
            <div class="message">Select a directory to begin</div>
          )}
        {this.#files &&
          !this.#loading &&
          this.renderNode(this.#files, "", true)}
      </div>
    );
    applyDiff(this.shadowRoot!, vdom);
  }
}

customElements.define("codespin-file-tree", FileTree);
