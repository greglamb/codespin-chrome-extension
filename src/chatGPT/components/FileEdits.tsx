import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";
import hljs from "../../libs/highlight.js/core.js";
import { getCSS } from "../../api/loadCSS.js";

const styleSheet = await getCSS("./FileEdits.css", import.meta.url);

export class FileEdits extends HTMLElement {
  #content: string = "";
  #highlightedContent: string = "";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.adoptedStyleSheets = [styleSheet];
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

  setContent(content: string, filename: string) {
    this.#content = content;

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

    this.render();
  }

  render() {
    const vdom = (
      <div class="viewer-container">
        <pre class="code-container">
          <code
            class="code-block hljs"
            innerHTML={
              this.#highlightedContent || "Select a file to view its contents"
            }
          />
        </pre>
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }
}

customElements.define("codespin-file-edits", FileEdits);
