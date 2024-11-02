import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";
import hljs from "../../libs/highlight.js/core.js";

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(
  await fetch("./FileContentViewer.css").then((r) => r.text())
);

export class FileContentViewer extends HTMLElement {
  #content: string = "";
  #highlightedContent: string = "";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.adoptedStyleSheets = [styleSheet];
  }

  detectLanguage(filename: string): string | undefined {
    const ext = filename.split(".").pop()?.toLowerCase();
    // Map of file extensions to highlight.js language names
    const languageMap: { [key: string]: string } = {
      // Web
      html: "xml",
      htm: "xml",
      xml: "xml",
      css: "css",
      scss: "scss",
      sass: "scss",
      less: "less",

      // JavaScript family
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      mjs: "javascript",
      cjs: "javascript",

      // Backend
      py: "python",
      rb: "ruby",
      php: "php",
      java: "java",
      kt: "kotlin",
      cs: "csharp",
      go: "go",
      rs: "rust",
      swift: "swift",

      // Shell/Config
      sh: "bash",
      bash: "bash",
      zsh: "bash",
      fish: "fish",
      yaml: "yaml",
      yml: "yaml",
      json: "json",
      toml: "toml",
      ini: "ini",

      // Databases
      sql: "sql",
      psql: "pgsql",
      mysql: "sql",

      // Markup
      md: "markdown",
      mdx: "markdown",
      tex: "latex",

      // Systems
      c: "c",
      cpp: "cpp",
      cc: "cpp",
      h: "c",
      hpp: "cpp",

      // Others
      dockerfile: "dockerfile",
      r: "r",
      scala: "scala",
      pl: "perl",
      pm: "perl",
      lua: "lua",
      vim: "vim",
      ex: "elixir",
      exs: "elixir",
      erl: "erlang",
      clj: "clojure",
      elm: "elm",
      hs: "haskell",
      ml: "ocaml",
      f90: "fortran",
      f95: "fortran",
      lisp: "lisp",
      scm: "scheme",
    };

    return ext ? languageMap[ext] : undefined;
  }

  setContent(content: string, filename: string | undefined) {
    this.#content = content;

    if (content && filename) {
      try {
        // Try auto-detection first
        let highlighted = hljs.highlightAuto(content);

        // If we have a specific language mapping, try that instead
        const detectedLanguage = this.detectLanguage(filename);
        if (detectedLanguage) {
          try {
            highlighted = hljs.highlight(content, {
              language: detectedLanguage,
            });
          } catch (error) {
            console.warn(
              `Failed to highlight as ${detectedLanguage}, using auto-detected language`
            );
          }
        }

        this.#highlightedContent = highlighted.value;
      } catch (error) {
        console.warn("Failed to highlight code:", error);
        this.#highlightedContent = content;
      }
    } else {
      this.#highlightedContent = content;
    }

    this.render();
  }

  render() {
    const vdom = (
      <div style="height: 100%; background: #1e1e1e; color: #d4d4d4; border-radius: 4px; padding-left: 16px; padding-top: 8px;">
        <style>
          {`
            @import url('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css');
            
            .code-container {
              margin: 0;
              height: 100%;
              overflow: auto;
            }
            
            .code-block {
              display: block;
              padding: 16px;
              font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
              font-size: 13px;
              line-height: 1.4;
              tab-size: 2;
              white-space: pre;
            }
            
            /* Base highlighting styles */
            .hljs {
              background: transparent;
              padding: 0;
              color: #d4d4d4;
            }

            /* Syntax highlighting colors - VS Code Dark Theme inspired */
            .hljs-keyword { color: #569cd6; }
            .hljs-literal { color: #569cd6; }
            .hljs-symbol { color: #569cd6; }
            .hljs-name { color: #569cd6; }
            
            .hljs-link { color: #569cd6; }
            .hljs-built_in { color: #4ec9b0; }
            .hljs-type { color: #4ec9b0; }
            
            .hljs-string { color: #ce9178; }
            .hljs-number { color: #b5cea8; }
            .hljs-attr { color: #9cdcfe; }
            .hljs-variable { color: #9cdcfe; }
            .hljs-template-variable { color: #9cdcfe; }
            
            .hljs-comment { color: #6a9955; }
            .hljs-quote { color: #6a9955; }
            .hljs-doctag { color: #608b4e; }
            
            .hljs-meta { color: #9cdcfe; }
            .hljs-meta-keyword { color: #569cd6; }
            
            .hljs-title { color: #dcdcaa; }
            .hljs-title.class_ { color: #4ec9b0; }
            .hljs-title.class_.inherited__ { color: #4ec9b0; opacity: 0.7; }
            .hljs-title.function_ { color: #dcdcaa; }
            
            .hljs-tag { color: #569cd6; }
            .hljs-attribute { color: #9cdcfe; }
            .hljs-value { color: #ce9178; }
            
            .hljs-regexp { color: #d16969; }
            
            .hljs-template-tag { color: #569cd6; }
            
            .hljs-addition { color: #6a9955; }
            .hljs-deletion { color: #d16969; }
            
            .hljs-selector-tag { color: #d7ba7d; }
            .hljs-selector-id { color: #d7ba7d; }
            .hljs-selector-class { color: #d7ba7d; }
            .hljs-selector-attr { color: #9cdcfe; }
            .hljs-selector-pseudo { color: #d7ba7d; }

            /* Additional language-specific styles */
            .hljs-subst { color: #d4d4d4; }
            .hljs-section { color: #dcdcaa; }
            .hljs-emphasis { font-style: italic; }
            .hljs-strong { font-weight: bold; }
            
            /* Markdown specific */
            .hljs-bullet { color: #6796e6; }
            .hljs-formula { color: #ce9178; }
            .hljs-params { color: #d4d4d4; }
            
            /* Template languages */
            .hljs-template-variable { color: #9cdcfe; }
            .hljs-variable.language_ { color: #4ec9b0; }
            
            /* Shell */
            .hljs-built_in { color: #4ec9b0; }
            .hljs-variable.constant_ { color: #9cdcfe; }
            
            /* Diff */
            .hljs-addition { background-color: rgba(155, 185, 85, 0.2); color: #b5cea8; display: inline-block; width: 100%; }
            .hljs-deletion { background-color: rgba(255, 0, 0, 0.2); color: #ce9178; display: inline-block; width: 100%; }
          `}
        </style>
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

customElements.define("codespin-file-content-viewer", FileContentViewer);
