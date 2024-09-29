import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";

class OptionsDialog extends HTMLElement {
  private useSmallOverlay: boolean;
  private buttonBgColor: string;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.onOkClick = this.onOkClick.bind(this);
    this.useSmallOverlay = false; // Default value
    this.buttonBgColor = "green"; // Default value
  }

  connectedCallback() {
    // You might want to load saved settings from localStorage or similar here.
    this.loadSettings();
    this.render();
    const dialog = this.shadowRoot!.getElementById(
      "dialog"
    ) as HTMLDialogElement;
    dialog.showModal();

    this.shadowRoot!.getElementById("options-ok")!.addEventListener(
      "click",
      this.onOkClick
    );
  }

  disconnectedCallback() {
    this.shadowRoot!.getElementById("options-ok")!.removeEventListener(
      "click",
      this.onOkClick
    );
  }

  loadSettings() {
    // Load previously saved settings, for example, from localStorage
    const savedOverlaySize = localStorage.getItem("useSmallOverlay");
    const savedButtonBgColor = localStorage.getItem("buttonBgColor");

    this.useSmallOverlay = savedOverlaySize === "true"; // Convert from string
    this.buttonBgColor = savedButtonBgColor || "green"; // Default to green
  }

  saveSettings() {
    // Save settings, for example, to localStorage
    localStorage.setItem("useSmallOverlay", this.useSmallOverlay.toString());
    localStorage.setItem("buttonBgColor", this.buttonBgColor);
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
        <h3>Options</h3>
        <div style={{ marginTop: "20px" }}>
          <label>
            <input
              type="checkbox"
              id="use-small-overlay"
              style={{ marginRight: "8px" }}
              checked={this.useSmallOverlay}
            />
            Use small overlay
          </label>
        </div>
        <div style={{ marginTop: "20px" }}>
          <label htmlFor="bg-color-input">Sync Button Background Color:</label>
          <br />
          <input
            type="text"
            id="bg-color-input"
            name="bg-color-input"
            style={{
              width: "100%",
              color: "black",
              marginTop: "10px",
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            value={this.buttonBgColor}
          />
        </div>
        <p style={{ marginTop: "20px" }}>
          <button
            id="options-ok"
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "4px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </p>
      </dialog>
    );

    applyDiff(this.shadowRoot!, vdom);
  }

  onOkClick() {
    const smallOverlay = (
      this.shadowRoot!.getElementById("use-small-overlay") as HTMLInputElement
    ).checked;
    const color =
      (this.shadowRoot!.getElementById("bg-color-input") as HTMLInputElement)
        .value || "green";

    // Save these settings in the component's state
    this.useSmallOverlay = smallOverlay;
    this.buttonBgColor = color;

    // Save settings to localStorage (or another persistent storage)
    this.saveSettings();

    const dialog = this.shadowRoot!.getElementById(
      "dialog"
    ) as HTMLDialogElement;
    dialog.close();
    this.remove();
  }
}

customElements.define("codespin-options-dialog", OptionsDialog);
