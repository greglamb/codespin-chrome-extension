import * as webjsx from "../libs/webjsx/index.js";
import { applyDiff } from "../libs/webjsx/index.js";
import { FileContentViewer } from "./FileContentViewer.js";
import { getFileContent } from "../api/fs/files.js";
import { getCSS } from "../api/loadCSS.js";
import {
  clearFileSystemCache,
  getDirectoryHandle,
} from "../api/fs/getDirectoryHandle.js";
import { FileSystemNode } from "../messageTypes.js";
import { FileTree } from "./FileTree.js";

const styleSheet = await getCSS("./FileImporter.css", import.meta.url);

export class FileImporter extends HTMLElement {
  #selectedFiles: Set<string> = new Set();
  #treeWidth: number = 300;
  #isDragging: boolean = false;
  #dragStartX: number = 0;
  #dragStartWidth: number = 0;
  #fileTree: Map<string, FileSystemNode> = new Map();

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

  show() {
    const fileTree = this.shadowRoot!.querySelector("codespin-file-tree") as FileTree;
    const viewer = this.shadowRoot!.querySelector("codespin-file-content-viewer") as FileContentViewer;
    
    if (fileTree) {
      // Get current state before refresh
      const selectedFiles = fileTree.getSelectedFiles();
      const expandedNodes = fileTree.getExpandedNodes();
      
      // Clear the viewer temporarily
      if (viewer) viewer.clear();
      
      // Refresh and restore state
      fileTree.fetchFiles().then(() => {
        // Small delay to ensure tree is properly loaded
        setTimeout(() => {
          fileTree.restoreState(selectedFiles, expandedNodes);
          
          // Reshow first selected file in viewer if any files are selected
          const restoredSelectedFiles = fileTree.getSelectedFiles();
          if (restoredSelectedFiles.length > 0) {
            viewer.setSelectedFiles(restoredSelectedFiles);
            this.loadSelectedFile(restoredSelectedFiles[0], viewer);
          }
        }, 50);
      });
    }
    this.#fileTree.clear(); // Clear cache to force rebuild
  }

  #handleMouseMove = (e: MouseEvent) => {
    if (!this.#isDragging) return;
    const deltaX = e.clientX - this.#dragStartX;
    const newWidth = Math.max(200, Math.min(800, this.#dragStartWidth + deltaX));
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

  #buildFileTreeMap(node: FileSystemNode, path: string, isRoot: boolean = false) {
    const fullPath = isRoot ? "." : path ? `${path}/${node.name}` : node.name;
    this.#fileTree.set(fullPath, node);
    if (node.type === "dir" && node.contents) {
      for (const child of node.contents) {
        this.#buildFileTreeMap(child, fullPath);
      }
    }
  }

  #getAllFilesInDirectory(dirPath: string): string[] {
    const files: string[] = [];
    const dirNode = this.#fileTree.get(dirPath);
    if (!dirNode || dirNode.type !== "dir" || !dirNode.contents) return files;
    for (const child of dirNode.contents) {
      const childPath = dirPath === "." ? child.name : `${dirPath}/${child.name}`;
      if (child.type === "file") {
        files.push(childPath);
      } else {
        files.push(...this.#getAllFilesInDirectory(childPath));
      }
    }
    return files;
  }

  async handleFileSelect(e: CustomEvent) {
    const paths = e.detail as string[];
    const newSelection = new Set<string>();
    
    // Build file tree map if it's empty
    if (this.#fileTree.size === 0) {
      const fileTree = this.shadowRoot!.querySelector("codespin-file-tree");
      if (fileTree) {
        const files = (fileTree as FileTree).files;
        if (files) {
          this.#buildFileTreeMap(files, "", true);
        }
      }
    }

    // Process each selected path
    for (const path of paths) {
      const node = this.#fileTree.get(path);
      if (node) {
        if (node.type === "file") {
          newSelection.add(path);
        } else {
          // For directories, add all contained files
          const dirFiles = this.#getAllFilesInDirectory(path);
          dirFiles.forEach((file) => newSelection.add(file));
        }
      }
    }

    this.#selectedFiles = newSelection;
    const selectedFiles = Array.from(this.#selectedFiles);
    const viewer = this.shadowRoot!.querySelector("codespin-file-content-viewer") as FileContentViewer;
    
    if (viewer) {
      if (selectedFiles.length === 0) {
        viewer.setContent("", undefined);
      } else {
        viewer.setSelectedFiles(selectedFiles);
        await this.loadSelectedFile(selectedFiles[0], viewer);
      }
    }

    requestAnimationFrame(() => {
      this.render();
    });
  }

  async loadSelectedFile(filepath: string, viewer: FileContentViewer) {
    try {
      const response = await getFileContent(filepath);
      if (response?.success) {
        viewer.setContent(response.result.contents, response.result.filename);
      }
    } catch (err: any) {
      viewer.setContent(`Error loading file contents: ${err.message}`, undefined);
    }
  }

  async handleDisconnect() {
    clearFileSystemCache();
    try {
      await getDirectoryHandle();
      const fileTree = this.shadowRoot!.querySelector("codespin-file-tree");
      if (fileTree) {
        await (fileTree as any).fetchFiles();
        this.#fileTree.clear();
      }
    } catch (error) {
      this.handleCancel();
    }
  }

  handleCancel() {
    this.dispatchEvent(new Event("cancel"));
  }

  handleSelect() {
    const selectedFiles = Array.from(this.#selectedFiles);
    if (selectedFiles.length === 0) return;
    this.dispatchEvent(new CustomEvent("select", { detail: selectedFiles }));
  }

  render() {
    const selectedCount = this.#selectedFiles.size;
    
    (this.shadowRoot!.querySelector(".file-tree-container") as HTMLElement)?.style.setProperty("--tree-width", `${this.#treeWidth}px`);
    (this.shadowRoot!.querySelector(".button-select") as HTMLElement)?.style.setProperty("--select-bg", selectedCount === 0 ? "#555" : "#2b579a");
    (this.shadowRoot!.querySelector(".button-select") as HTMLElement)?.style.setProperty("--select-cursor", selectedCount === 0 ? "not-allowed" : "pointer");
    (this.shadowRoot!.querySelector(".button-select") as HTMLElement)?.style.setProperty("--select-opacity", selectedCount === 0 ? "0.7" : "1");

    const vdom = (
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="main-container">
            <div class="file-tree-section">
              <div class="file-tree-container">
                <codespin-file-tree
                  onselect={(e) => { this.handleFileSelect(e); }}
                  oncancel={() => this.handleCancel()}
                ></codespin-file-tree>
              </div>
              <div class="tree-actions">
                <button class="button button-disconnect" onclick={() => this.handleDisconnect()}>
                  Change Directory
                </button>
              </div>
            </div>
            <div class="separator"></div>
            <div class="content-container">
              <codespin-file-content-viewer
                class="viewer-container"
                onfilechange={(e: { detail: string; target: FileContentViewer; }) => {
                  this.loadSelectedFile(e.detail, e.target as FileContentViewer);
                }}
              ></codespin-file-content-viewer>
            </div>
          </div>
          <div class="button-container">
            <button class="button button-cancel" onclick={() => this.handleCancel()}>
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