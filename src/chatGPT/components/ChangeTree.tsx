import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";
import { getCSS } from "../../api/loadCSS.js";

const styleSheet = await getCSS("./ChangeTree.css", import.meta.url);

interface FileNode {
  type: "file" | "directory";
  name: string;
  path?: string;
  contents?: FileNode[];
}

export class ChangeTree extends HTMLElement {
  #selectedFiles: Set<string> = new Set();
  #expandedNodes: Set<string> = new Set();
  #files: FileNode[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.adoptedStyleSheets = [styleSheet];
  }

  #buildFileTree(files: { path: string; content: string }[]): FileNode[] {
    const root: { [key: string]: FileNode } = {};

    // Sort files by path to ensure parent directories are processed first
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

    sortedFiles.forEach((file) => {
      const parts = file.path.split("/");
      let current = root;

      // Process directories
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {
            type: "directory",
            name: part,
            contents: [],
          };
        }
        current = (current[part].contents as FileNode[]).reduce((acc, node) => {
          acc[node.name] = node;
          return acc;
        }, {} as { [key: string]: FileNode });
      }

      // Add file
      const fileName = parts[parts.length - 1];
      const parentNode = current;
      parentNode[fileName] = {
        type: "file",
        name: fileName,
        path: file.path,
      };
    });

    // Convert the object tree to array structure
    const convertToArray = (obj: { [key: string]: FileNode }): FileNode[] => {
      return Object.values(obj).map((node) => ({
        ...node,
        contents: node.contents
          ? node.contents.sort((a, b) => {
              // Directories first, then alphabetically
              if (a.type !== b.type) {
                return a.type === "directory" ? -1 : 1;
              }
              return a.name.localeCompare(b.name);
            })
          : undefined,
      }));
    };

    return convertToArray(root);
  }

  setFiles(
    files: { path: string; content: string }[],
    initialSelected: string
  ) {
    this.#files = this.#buildFileTree(files);
    this.#selectedFiles = new Set([initialSelected]);

    // Expand all parent directories of the selected file
    const parts = initialSelected.split("/");
    let currentPath = "";
    parts.forEach((part, index) => {
      if (index < parts.length - 1) {
        currentPath += (currentPath ? "/" : "") + part;
        this.#expandedNodes.add(currentPath);
      }
    });

    this.render();
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

  handleFileClick(e: MouseEvent, path: string) {
    e.stopPropagation();

    if (e.ctrlKey || e.metaKey) {
      if (this.#selectedFiles.has(path)) {
        this.#selectedFiles.delete(path);
      } else {
        this.#selectedFiles.add(path);
      }
    } else {
      this.#selectedFiles.clear();
      this.#selectedFiles.add(path);
    }

    this.dispatchEvent(
      new CustomEvent("select", {
        detail: Array.from(this.#selectedFiles),
      })
    );

    this.render();
  }

  renderNode(node: FileNode, path: string = "") {
    const fullPath = path ? `${path}/${node.name}` : node.name;

    if (node.type === "file") {
      return (
        <div
          class={`file-item ${
            this.#selectedFiles.has(node.path!) ? "selected" : ""
          }`}
          onclick={(e) => this.handleFileClick(e, node.path!)}
        >
          <span>📄</span>
          <span>{node.name}</span>
        </div>
      );
    }

    const isExpanded = this.#expandedNodes.has(fullPath);

    return (
      <div>
        <div class="dir-item" onclick={(e) => this.handleDirClick(e, fullPath)}>
          <span>{isExpanded ? "▾" : "▸"}</span>
          <span>📁</span>
          <span>{node.name}</span>
        </div>
        {isExpanded && node.contents && (
          <div class="dir-contents">
            {node.contents.map((child) => this.renderNode(child, fullPath))}
          </div>
        )}
      </div>
    );
  }

  render() {
    const vdom = (
      <div class="tree-container">
        {this.#files.map((file) => this.renderNode(file))}
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }
}

customElements.define("codespin-change-tree", ChangeTree);
