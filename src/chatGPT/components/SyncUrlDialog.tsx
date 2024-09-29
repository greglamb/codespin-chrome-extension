import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";
import { getProjectSyncUrl, setProjectSyncUrl } from "../../projectSyncUrls.js";
import * as syncStatusStore from "../../syncStatusStore.js"; // Assume sync status logic is now in the store

export type SyncUrlDialogProps = {
  syncUrl?: string;
};

class SyncUrlDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.onSubmitClick = this.onSubmitClick.bind(this);
    this.onCancelClick = this.onCancelClick.bind(this);
  }

  connectedCallback() {
    this.render();
    const dialog = this.shadowRoot!.getElementById(
      "dialog"
    ) as HTMLDialogElement;
    dialog.showModal();

    this.shadowRoot!.getElementById("codespin-submit")!.addEventListener(
      "click",
      this.onSubmitClick
    );
    this.shadowRoot!.getElementById("codespin-cancel")!.addEventListener(
      "click",
      this.onCancelClick
    );
  }

  disconnectedCallback() {
    this.shadowRoot!.getElementById("codespin-submit")!.removeEventListener(
      "click",
      this.onSubmitClick
    );
    this.shadowRoot!.getElementById("codespin-cancel")!.removeEventListener(
      "click",
      this.onCancelClick
    );
  }

  render() {
    const currentUrl = window.location.href;
    const currentSyncUrl = getProjectSyncUrl(currentUrl) || "";

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
        <h3>Set Sync URL</h3>
        <label htmlFor="codespin-url">Project Sync URL:</label>
        <br />
        <input
          type="text"
          id="codespin-url"
          name="codespin-url"
          style={{
            width: "100%",
            color: "black",
            marginTop: "10px",
            padding: "5px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          required
          value={currentSyncUrl}
        />
        <p style={{ marginTop: "20px" }}>
          <button
            id="codespin-submit"
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "4px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
          <button
            id="codespin-cancel"
            style={{
              backgroundColor: "#f44336",
              color: "white",
              padding: "4px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            Cancel
          </button>
        </p>
      </dialog>
    );

    applyDiff(this.shadowRoot!, vdom);
  }

  onSubmitClick() {
    const currentUrl = window.location.href;
    const urlInput = this.shadowRoot!.getElementById(
      "codespin-url"
    ) as HTMLInputElement;
    const url = urlInput.value.trim() || null;

    setProjectSyncUrl(currentUrl, url); // Update the sync URL

    // Update sync status based on the presence of the URL
    if (url) {
      syncStatusStore.setConnectionState("connected");
    } else {
      syncStatusStore.setConnectionState("disconnected");
    }

    const dialog = this.shadowRoot!.getElementById(
      "dialog"
    ) as HTMLDialogElement;
    dialog.close();
    this.remove(); // Close and remove the dialog after submission
  }

  onCancelClick() {
    const dialog = this.shadowRoot!.getElementById(
      "dialog"
    ) as HTMLDialogElement;
    dialog.close();
    this.remove(); // Close and remove the dialog
  }
}

customElements.define("codespin-sync-url-dialog", SyncUrlDialog);
