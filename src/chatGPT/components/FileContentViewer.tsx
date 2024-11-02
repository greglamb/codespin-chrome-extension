import * as webjsx from "../../libs/webjsx/index.js";
import { applyDiff } from "../../libs/webjsx/index.js";
import hljs from "../../libs/highlight.js/core.js";

const styleSheet = new CSSStyleSheet();

const cssPath = new URL("./FileContentViewer.css", import.meta.url).href;
const css = await fetch(cssPath).then((r) => r.text());
styleSheet.replaceSync(css);

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

customElements.define("codespin-file-content-viewer", FileContentViewer);
