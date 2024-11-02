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

  #normalizePath(path: string): string {
    return path.replace(/^\.?\//, "");
  }

  #buildFileTree(files: { path: string; content: string }[]): FileNode[] {
    // Create a root directory map
    const dirMap: { [key: string]: FileNode } = {};

    // Process each file
    files.forEach((file) => {
      const normalizedPath = this.#normalizePath(file.path);
      const parts = normalizedPath.split("/");

      // Create directories for each part of the path
      let currentPath = "";
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!dirMap[currentPath]) {
          dirMap[currentPath] = {
            type: "directory",
            name: part,
            contents: [],
          };
        }
      }

      // Create file node
      const fileName = parts[parts.length - 1];
      const fileNode: FileNode = {
        type: "file",
        name: fileName,
        path: file.path,
      };

      // Add file to its parent directory
      const parentPath = parts.slice(0, -1).join("/");
      if (parentPath) {
        dirMap[parentPath].contents!.push(fileNode);
      }
    });

    // Build the tree structure
    const rootNodes: FileNode[] = [];
    Object.entries(dirMap).forEach(([path, node]) => {
      const parts = path.split("/");
      if (parts.length === 1) {
        // This is a root level directory
        rootNodes.push(node);
      } else {
        // This is a nested directory, add it to its parent
        const parentPath = parts.slice(0, -1).join("/");
        if (dirMap[parentPath]) {
          dirMap[parentPath].contents!.push(node);
        }
      }
    });

    // Sort contents of all directories
    const sortNodes = (nodes: FileNode[]) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      nodes.forEach((node) => {
        if (node.type === "directory" && node.contents) {
          sortNodes(node.contents);
        }
      });
    };

    sortNodes(rootNodes);
    console.log("Built tree:", JSON.stringify(rootNodes, null, 2));
    return rootNodes;
  }

  setFiles(
    files: { path: string; content: string }[],
    initialSelected: string
  ) {
    console.log("Setting files:", files);
    this.#files = this.#buildFileTree(files);
    this.#selectedFiles = new Set([initialSelected]);

    // Expand all parent directories of the selected file
    const normalizedPath = this.#normalizePath(initialSelected);
    const parts = normalizedPath.split("/");
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
