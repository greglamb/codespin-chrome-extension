import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";
import { connectToServer } from "../../networkUtils.js";
import { setCookie } from "../../cookieUtils.js";

export class Connection extends HTMLElement {
  private shadow!: ShadowRoot;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadow = this.shadowRoot!;
    this.render();
  }

  render() {
    const vdom = (
      <>
        <dialog id="codespin-dialog">
          <form method="dialog">
            <label for="server-url">Server URL:</label>
            <input id="server-url" type="text" value="http://localhost:10860" />
            <label for="token">Bearer Token:</label>
            <input id="token" type="text" />
            <button id="connect-button">Connect</button>
          </form>
        </dialog>
      </>
    );
    applyDiff(this.shadow, vdom);

    this.shadow
      .querySelector("#connect-button")!
      .addEventListener("click", this.handleConnection.bind(this));
  }

  handleConnection() {
    const serverUrl = (
      this.shadow.querySelector("#server-url") as HTMLInputElement
    ).value;
    const token = (this.shadow.querySelector("#token") as HTMLInputElement)
      .value;

    connectToServer(token, serverUrl)
      .then((response) => {
        if (response.success) {
          alert("Connected");
          setCookie("server_url", serverUrl, 365);
          setCookie("bearer_token", token, 365);
          this.closeDialog();
        } else {
          alert(response.error || "Connection failed");
        }
      })
      .catch(() => alert("Is the server running?"));
  }

  showModal() {
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
  }
}

customElements.define("codespin-connection", Connection);
