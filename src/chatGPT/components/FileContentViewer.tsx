import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";

export class FileContentViewer extends HTMLElement {
  #content: string = "";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setContent(content: string) {
    this.#content = content;
    this.render();
  }

  render() {
    const vdom = (
      <div style="height: 100%; background: #1e1e1e; color: #d4d4d4; border-radius: 4px;">
        <pre style="margin: 0; height: 100%; overflow: auto;">
          <code style="display: block; padding: 16px; font-family: 'Menlo', 'Monaco', 'Courier New', monospace; font-size: 13px;">
            {this.#content || "Select a file to view its contents"}
          </code>
        </pre>
      </div>
    );

    applyDiff(this.shadowRoot!, vdom);
  }
}

customElements.define("codespin-file-content-viewer", FileContentViewer);
