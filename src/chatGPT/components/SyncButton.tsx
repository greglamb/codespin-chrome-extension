// ./src/chatGPT/components/SyncButton.tsx
import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";
import { writeFile } from "../../writeFile.js";
import { extractFilePath } from "../domExtractions.js";
import { getProjectSyncUrl } from "../../projectSyncUrls.js"; // Use the projectSyncUrls module
import * as syncStatusStore from "../../syncStatusStore.js";

class SyncButton extends HTMLElement {
  private preElement: HTMLElement | undefined;
  private filePath: string | null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.filePath = null;
  }

  connectedCallback() {
    // Get the reference to the <pre> element and its file path
    this.preElement = this.closest("pre")!;
    this.filePath = extractFilePath(this.preElement);

    // Render the button and attach the event listener
    this.render();
    this.shadowRoot!.getElementById("sync-button")!.addEventListener(
      "click",
      this.handleClick.bind(this)
    );
  }

  disconnectedCallback() {
    // Clean up the event listener when the element is removed
    this.shadowRoot!.getElementById("sync-button")!.removeEventListener(
      "click",
      this.handleClick.bind(this)
    );
  }

  render() {
    const vdom = (
      <button
        id="sync-button"
        style={{
          backgroundColor: "blue",
          color: "white",
          padding: "4px 8px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginLeft: "8px",
        }}
      >
        Sync
      </button>
    );
    applyDiff(this.shadowRoot!, vdom);
  }

  async handleClick() {
    if (!this.filePath) {
      alert("File path not found.");
      syncStatusStore.setConnectionState("disconnected");
      return;
    }

    const projectSyncUrl = getProjectSyncUrl(window.location.href); // Retrieve the sync URL for the current browser URL
    const codeText = this.preElement!.querySelector("code")?.innerText || "";

    if (projectSyncUrl && this.filePath && codeText) {
      const message = {
        type: "code",
        filePath: this.filePath,
        contents: codeText,
      };

      try {
        await writeFile(projectSyncUrl, message);
        alert("Sync successful!");
        syncStatusStore.setConnectionState("connected");
      } catch (error) {
        console.error("Error syncing file:", error);
        alert("Sync failed. Please check the console for more details.");
        syncStatusStore.setConnectionState("disconnected");
      }
    } else {
      alert("Sync URL or code is missing.");
      syncStatusStore.setConnectionState("disconnected");
    }
  }
}

// Register the custom element for use
customElements.define("codespin-sync-button", SyncButton);
