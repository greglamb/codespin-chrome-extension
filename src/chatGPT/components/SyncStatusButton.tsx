import * as webjsx from "webjsx";
import { applyDiff } from "webjsx";
import * as syncStatusStore from "../../syncStatusStore.js"; // For connection state management

class SyncStatusButton extends HTMLElement {
  private wasDragged: boolean = false;
  private isDragging: boolean = false;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private initialX: number = 0;
  private initialY: number = 0;
  private connectionState: string = "disconnected";
  private useSmallOverlay: boolean = false;
  private buttonBgColor: string = "green";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.onClick = this.onClick.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.updateConnectionState = this.updateConnectionState.bind(this);
  }

  connectedCallback() {
    // Subscribe to the sync status store to update connection state when it changes
    syncStatusStore.subscribe(this.updateConnectionState);

    this.render();
    this.shadowRoot!.getElementById("button")!.addEventListener(
      "click",
      this.onClick
    );
    this.shadowRoot!.getElementById("button")!.addEventListener(
      "mousedown",
      this.onMouseDown
    );
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  disconnectedCallback() {
    // Unsubscribe from the sync status store
    syncStatusStore.unsubscribe(this.updateConnectionState);

    this.shadowRoot!.getElementById("button")!.removeEventListener(
      "click",
      this.onClick
    );
    this.shadowRoot!.getElementById("button")!.removeEventListener(
      "mousedown",
      this.onMouseDown
    );
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  updateConnectionState(state: string) {
    this.connectionState = state;
    this.render(); // Re-render the button whenever the connection state changes
  }

  render() {
    // Update state from local storage if needed
    const storedUseSmallOverlay = localStorage.getItem("useSmallOverlay");
    this.useSmallOverlay = storedUseSmallOverlay === "true";
    const storedButtonBgColor = localStorage.getItem("buttonBgColor");
    this.buttonBgColor = storedButtonBgColor || "green";
    const buttonText =
      this.connectionState === "connected"
        ? "CodeSpin Syncing"
        : "Not Connected";

    const displayColor =
      this.connectionState === "connected" ? this.buttonBgColor : "gray";

    const buttonSizeStyle = this.useSmallOverlay
      ? { padding: "2px 8px", fontSize: "0.7em" }
      : { padding: "4px 16px", fontSize: "0.9em" };

    const vdom = (
      <button
        id="button"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: displayColor,
          color: "white",
          border: "none",
          borderRadius: "20px",
          cursor: "pointer",
          zIndex: 1000,
          ...buttonSizeStyle,
        }}
      >
        {buttonText}
      </button>
    );

    applyDiff(this.shadowRoot!, vdom);
  }

  onClick(e: Event) {
    e.stopPropagation();
    if (!this.wasDragged) {
      const event = new CustomEvent("open-menu", {
        detail: { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
    this.wasDragged = false;
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.initialX = e.clientX;
    this.initialY = e.clientY;
    this.offsetX = e.clientX - this.getBoundingClientRect().left;
    this.offsetY = e.clientY - this.getBoundingClientRect().top;
    const button = this.shadowRoot!.getElementById("button")!;
    button.style.cursor = "grabbing";
  }

  onMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      const deltaX = e.clientX - this.initialX;
      const deltaY = e.clientY - this.initialY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        this.wasDragged = true;
      }

      const newLeft = e.clientX - this.offsetX;
      const newTop = e.clientY - this.offsetY;

      const button = this.shadowRoot!.getElementById("button")!;
      button.style.left = `${newLeft}px`;
      button.style.top = `${newTop}px`;
      button.style.bottom = "auto";
      button.style.right = "auto";
    }
  }

  onMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      const button = this.shadowRoot!.getElementById("button")!;
      button.style.cursor = "pointer";

      // Optionally store the position for persistence
      localStorage.setItem("buttonPositionLeft", button.style.left);
      localStorage.setItem("buttonPositionTop", button.style.top);
    }
  }
}

customElements.define("codespin-sync-status-button", SyncStatusButton);
