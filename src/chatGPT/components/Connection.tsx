import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";

export class Connection extends HTMLElement {
  private _visible = false;
  private shadow!: ShadowRoot;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadow = this.shadowRoot!;
    this.render();
  }

  get visible() {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
    this.render();
  }

  render() {
    const vdom = this._visible ? (
      <>
        {/* Dark overlay for background */}
        <div
          id="overlay"
          style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.8); /* Darken the background */
            z-index: 10; /* Ensure it is behind the dialog but above other content */
          "
        ></div>

        <dialog
          id="codespin-dialog"
          style="
            width: 480px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 20; /* Ensure it is above the overlay */
            border-radius: 12px; /* Rounded corners for a softer look */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
            border: none; /* Remove default dialog border */
          "
        >
          <form
            method="dialog"
            style="
              display: flex; 
              flex-direction: column; 
              gap: 15px; 
              padding: 10px; /* Add padding inside the form */
              border-radius: 8px; /* Round corners for the form */
              background-color: #333; /* Light background for the form */
            "
          >
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label for="key" style="font-weight: bold;">
                Secret Key (Required):
              </label>
              <input
                id="key"
                type="text"
                required
                style="padding: 8px; border-radius: 4px; border: 1px solid #ccc;"
              />
            </div>

            <hr style="border: 0; height: 1px; background: #e0e0e0;" />

            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label for="host" style="font-weight: bold;">
                Host (optional, defaults to "localhost"):
              </label>
              <input
                id="host"
                type="text"
                placeholder="localhost"
                style="padding: 8px; border-radius: 4px; border: 1px solid #ccc;"
              />
            </div>

            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label for="port" style="font-weight: bold;">
                Port (optional, defaults to "60280"):
              </label>
              <input
                id="port"
                type="text"
                placeholder="60280"
                style="padding: 8px; border-radius: 4px; border: 1px solid #ccc;"
              />
            </div>

            {/* Button Container */}
            <div style="
                display: flex; 
                justify-content: flex-end; 
                gap: 10px; /* Add space between the buttons */
            ">
              <button
                type="button"
                id="cancel-button"
                style="
                  padding: 8px 12px; 
                  border-radius: 4px; 
                  background-color: #6c757d; /* Grey color for cancel */
                  color: white; 
                  border: none; 
                  cursor: pointer;
                  width: 100px; /* Ensure both buttons are the same width */
                "
                onclick={(e) => this.closeDialog()}
              >
                Cancel
              </button>

              <button
                type="submit"
                id="ok-button"
                style="
                  padding: 8px 12px; 
                  border-radius: 4px; 
                  background-color: #007bff; /* Blue color for primary action */
                  color: white; 
                  border: none; 
                  cursor: pointer; 
                  font-weight: bold;
                  width: 100px; /* Ensure both buttons are the same width */
                "
                onclick={(e) => this.handleConnection(e)}
              >
                Save
              </button>
            </div>
          </form>
        </dialog>
      </>
    ) : (
      <></>
    );
    applyDiff(this.shadow, vdom);

    const dialog = this.shadow.querySelector(
      "#codespin-dialog"
    ) as HTMLDialogElement;

    // Close the modal when clicking outside the dialog
    document.addEventListener("mousedown", (event) => {
      if (
        dialog.open &&
        !dialog.contains(event.target as Node) &&
        (event.target as Node) !== dialog
      ) {
        this.closeDialog();
      }
    });
  }

  handleConnection(event: Event) {
    event.preventDefault(); // Prevent form submission

    const key = (this.shadow.querySelector("#key") as HTMLInputElement).value;
    const host =
      (this.shadow.querySelector("#host") as HTMLInputElement).value ||
      "localhost";
    const port =
      (this.shadow.querySelector("#port") as HTMLInputElement).value || "60280";

    if (!key) {
      alert("Key is required.");
      return;
    }

    // Just alert the values for now
    alert(`Key: ${key}\nHost: ${host}\nPort: ${port}`);

    this.closeDialog();
  }

  showModal() {
    this.visible = true;
    const dialog = this.shadow.querySelector(
      "#codespin-dialog"
    ) as HTMLDialogElement;
    dialog.showModal();
  }

  closeDialog() {
    const dialog = this.shadow.querySelector(
      "#codespin-dialog"
    ) as HTMLDialogElement;
    dialog.close();
    this.visible = false;
  }
}

customElements.define("codespin-connection", Connection);
