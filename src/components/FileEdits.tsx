import * as webjsx from "../libs/webjsx/factory.js";
import { applyDiff } from "../libs/webjsx/index.js";
import hljs from "../libs/highlight.js/core.js";
import { getCSS } from "../api/loadCSS.js";
import { getFileContent } from "../api/fs/files.js";
import { createTwoFilesPatch } from "../libs/diff/index.js";

const styleSheet = await getCSS("./FileEdits.css", import.meta.url);

type ViewMode = "content" | "diff";

export class FileEdits extends HTMLElement {
  #content: string = "";
  #originalContent: string = "";
  #highlightedContent: string = "";
  #highlightedDiff: string = "";
  #viewMode: ViewMode = "content";
  #currentFilename: string = "";
  #loading: boolean = false;
  #contentLineCount: number = 0;
  #diffLines: { type: 'header' | 'add' | 'remove' | 'context', number?: number }[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.adoptedStyleSheets = [styleSheet];
  }

  async #loadOriginalContent(filename: string) {
    this.#loading = true;
    this.render();

    try {
      const response = await getFileContent(filename);
      if (response?.success) {
        this.#originalContent = response.result.contents;
        this.#updateDiffView();
      }
    } catch (error) {
      console.error("Failed to load original content:", error);
      this.#originalContent = "";
    }

    this.#loading = false;
    this.render();
  }

  #updateDiffView() {
    if (!this.#currentFilename) return;

    const patch = createTwoFilesPatch(
      this.#currentFilename,
      this.#currentFilename,
      this.#originalContent,
      this.#content,
      "Original",
      "Modified",
      {
        context: Number.MAX_SAFE_INTEGER // Show all context lines
      }
    );

    // Parse the diff to track line numbers
    const lines = patch.split('\n');
    this.#diffLines = [];
    let currentLineNum = 0;
    let inHeader = true;

    for (const line of lines) {
      if (line.startsWith('\\ ')) {
        // Show "No newline" messages with no line number
        this.#diffLines.push({ type: 'header' });
        continue;
      }

      if (inHeader || line.startsWith('@@')) {
        if (line.startsWith('@@')) {
          inHeader = false;
        }
        this.#diffLines.push({ type: 'header' });
      } else {
        if (line.startsWith('-')) {
          this.#diffLines.push({ type: 'remove' });
        } else if (line.startsWith('+')) {
          currentLineNum++;
          this.#diffLines.push({ type: 'add', number: currentLineNum });
        } else if (line.length > 0) {
          currentLineNum++;
          this.#diffLines.push({ type: 'context', number: currentLineNum });
        }
      }
    }

    try {
      this.#highlightedDiff = hljs.highlight(patch, { language: "diff" }).value;
    } catch (error) {
      console.warn("Failed to highlight diff:", error);
      this.#highlightedDiff = patch;
    }
  }

  detectLanguage(filename: string): string | undefined {
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      css: "css",
      html: "xml",
      svg: "xml",
      xml: "xml",
      py: "python",
      rb: "ruby",
      java: "java",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
      go: "go",
      rs: "rust",
      php: "php",
      sql: "sql",
      md: "markdown",
      json: "json",
      yml: "yaml",
      yaml: "yaml",
    };

    return ext ? languageMap[ext] : undefined;
  }

  async setContent(content: string, filename: string) {
    this.#content = content;
    this.#currentFilename = filename;
    this.#contentLineCount = content.split('\n').length;

    try {
      const detectedLanguage = this.detectLanguage(filename);
      if (detectedLanguage) {
        this.#highlightedContent = hljs.highlight(content, {
          language: detectedLanguage,
        }).value;
      } else {
        this.#highlightedContent = hljs.highlightAuto(content).value;
      }
    } catch (error) {
      console.warn("Failed to highlight code:", error);
      this.#highlightedContent = content;
    }

    // Load original content for diff view
    await this.#loadOriginalContent(filename);
    this.render();
  }

  #handleViewModeChange(mode: ViewMode) {
    this.#viewMode = mode;
    this.render();
  }

  render() {
    const vdom = (
      <div class="viewer-container">
        <div class="view-mode-selector">
          <button
            class={`mode-button ${
              this.#viewMode === "content" ? "active" : ""
            }`}
            onclick={() => this.#handleViewModeChange("content")}
          >
            Show Content
          </button>
          <button
            class={`mode-button ${this.#viewMode === "diff" ? "active" : ""}`}
            onclick={() => this.#handleViewModeChange("diff")}
          >
            Show Diff
          </button>
        </div>
        {this.#loading ? (
          <div class="loading">Loading...</div>
        ) : (
          <div class="code-container">
            <div class="line-numbers">
              {this.#viewMode === "content" ? (
                Array.from({ length: this.#contentLineCount }, (_, i) => (
                  <div class="line-number">{i + 1}</div>
                ))
              ) : (
                this.#diffLines.map(line => (
                  <div class={`line-number ${line.type}`}>
                    {line.type === 'header' || line.type === 'remove' ? '' : line.number}
                  </div>
                ))
              )}
            </div>
            <pre>
              <code
                class="code-block hljs"
                innerHTML={
                  this.#viewMode === "content"
                    ? this.#highlightedContent
                    : this.#highlightedDiff
                }
              />
            </pre>
          </div>
        )}
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }
}

customElements.define("codespin-file-edits", FileEdits);
