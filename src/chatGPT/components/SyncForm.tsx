import { SideDrawer } from "side-drawer";
import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";

export class SyncForm extends HTMLElement {
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
        <style
          dangerouslySetInnerHTML={{
            __html: ":host { --side-drawer-overlay-opacity: 0.2; }",
          }}
        ></style>
        <side-drawer
          id="sync-side-drawer"
          right="right"
          style="background-color: #ccc; width: 350px; max-width: 75vw; z-index: 10; border-top-right-radius: 0; border-bottom-right-radius: 0;"
        >
          <p style="color:black; padding: 1em;">Hello world</p>
        </side-drawer>
      </>
    );
    applyDiff(this.shadow, vdom);
  }

  showModal({ onClose }: { onClose: () => void }) {
    const sideDrawer = this.shadow.querySelector("side-drawer") as SideDrawer;
    sideDrawer.open = true;
    sideDrawer.addEventListener("close", onClose);
  }
}

customElements.define("codespin-sync-form", SyncForm);
