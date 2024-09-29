import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";

class PromptDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.onCloseClick = this.onCloseClick.bind(this);
  }

  connectedCallback() {
    this.render();
    const dialog = this.shadowRoot!.getElementById("dialog") as HTMLDialogElement;
    dialog.showModal();

    this.shadowRoot!.getElementById("prompt-ok")!.addEventListener("click", this.onCloseClick);
  }

  disconnectedCallback() {
    this.shadowRoot!.getElementById("prompt-ok")!.removeEventListener("click", this.onCloseClick);
  }

  render() {
    const vdom = (
      <dialog
        id="dialog"
        style={{
          width: "400px",
          backgroundColor: "black",
          color: "#ccc",
          borderRadius: "8px",
          padding: "20px",
          border: "solid #fff",
        }}
      >
        <h3>Prompt Information</h3>
        <p style={{ fontWeight: "bold" }}>
          Add the following text into your prompt:
        </p>
        <p style={{ marginTop: "8px", fontSize: "0.9em" }}>
          When you produce any source code, you must use the following format for each file.
          <br />
          <br />
          File path:./a/b/file.js
          <br />
          -- start a markdown code block for the code --
          <br />
          <br />
          "File path:./a/b/file.js" should not be inside the markdown code block, but just before the start of the code block.
        </p>
        <p style={{ marginTop: "20px" }}>
          <button
            id="prompt-ok"
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "4px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </p>
      </dialog>
    );

    applyDiff(this.shadowRoot!, vdom);
  }

  onCloseClick() {
    const dialog = this.shadowRoot!.getElementById("dialog") as HTMLDialogElement;
    dialog.close();
    this.remove();
  }
}

customElements.define("codespin-prompt-dialog", PromptDialog);
