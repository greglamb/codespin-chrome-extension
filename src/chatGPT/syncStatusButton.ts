import { toggleMenu } from "./menu.js";

type ConnectionState = "connected" | "disconnected";

let buttonPosition = {
  left: "auto",
  top: "auto",
  bottom: "20px",
  right: "20px",
};

let wasDragged = false;
let useSmallOverlay = false;
let buttonBgColor = "green";
let buttonText = "CodeSpin Syncing";
let connectionState: ConnectionState = "connected";

// Load settings from chrome storage
chrome.storage.local.get(["useSmallOverlay", "buttonBgColor"], (result) => {
  useSmallOverlay =
    result.useSmallOverlay !== undefined ? result.useSmallOverlay : false;
  buttonBgColor = result.buttonBgColor || "green";
  updateSyncStatusButton();
});

export function setOverlaySize(smallOverlay: boolean) {
  useSmallOverlay = smallOverlay;
  saveOverlaySize(useSmallOverlay);
  updateSyncStatusButton();
}

export function setButtonBgColor(color: string) {
  buttonBgColor = color || "green";
  saveButtonBgColor(buttonBgColor);
  updateSyncStatusButton();
}

export function setConnectionState(state: ConnectionState) {
  connectionState = state;
  updateSyncStatusButton();
}

export function getConnectionState(): ConnectionState {
  return connectionState;
}

export function setButtonText(text: string) {
  buttonText = text || "CodeSpin Syncing";
  updateSyncStatusButton();
}

export function getOverlaySize(): boolean {
  return useSmallOverlay;
}

export function getButtonBgColor(): string {
  return buttonBgColor;
}

export function getButtonText(): string {
  return buttonText;
}

function updateSyncStatusButton() {
  removeSyncOverlayButton();
  showSyncStatusButton();
}

export function showSyncStatusButton() {
  let overlayButton = document.getElementById("codespin-overlay-button");

  const displayText =
    connectionState === "connected"
      ? buttonText
      : useSmallOverlay
      ? "Not Connected"
      : "CodeSpin Not Connected";

  const displayColor = connectionState === "connected" ? buttonBgColor : "gray";

  if (!overlayButton) {
    const buttonSizeStyle = useSmallOverlay
      ? "padding: 2px 8px; font-size: 0.7em;"
      : "padding: 4px 16px; font-size: 0.9em;";
    const buttonHtml = `
      <button id="codespin-overlay-button" style="position: fixed; bottom: ${buttonPosition.bottom}; left: ${buttonPosition.left}; right: ${buttonPosition.right}; top: ${buttonPosition.top}; background-color: ${displayColor}; color: white; ${buttonSizeStyle} border: none; border-radius: 20px; cursor: pointer; z-index: 1000;">
        ${displayText}
      </button>
    `;
    document.body.insertAdjacentHTML("beforeend", buttonHtml);

    overlayButton = document.getElementById("codespin-overlay-button");

    overlayButton!.onclick = (e) => {
      e.stopPropagation();
      if (!wasDragged) {
        toggleMenu(overlayButton!, e.clientX, e.clientY);
      }
      wasDragged = false;
    };

    makeButtonDraggable(overlayButton!);
  }
}

export function removeSyncOverlayButton() {
  const overlayButton = document.getElementById("codespin-overlay-button");
  if (overlayButton) {
    overlayButton.remove();
  }
}

function makeButtonDraggable(button: HTMLElement) {
  let offsetX: number;
  let offsetY: number;
  let isDragging = false;
  let initialX: number;
  let initialY: number;

  button.addEventListener("mousedown", (e) => {
    isDragging = true;
    initialX = e.clientX;
    initialY = e.clientY;
    offsetX = e.clientX - button.getBoundingClientRect().left;
    offsetY = e.clientY - button.getBoundingClientRect().top;
    button.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const deltaX = e.clientX - initialX;
      const deltaY = e.clientY - initialY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        wasDragged = true;
      }

      button.style.left = `${e.clientX - offsetX}px`;
      button.style.top = `${e.clientY - offsetY}px`;
      button.style.bottom = "auto";
      button.style.right = "auto";
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      button.style.cursor = "pointer";

      buttonPosition.left = button.style.left;
      buttonPosition.top = button.style.top;
      buttonPosition.bottom = button.style.bottom;
      buttonPosition.right = button.style.right;
    }
  });
}

function saveOverlaySize(smallOverlay: boolean) {
  chrome.storage.local.set({ useSmallOverlay: smallOverlay });
}

function saveButtonBgColor(color: string) {
  chrome.storage.local.set({ buttonBgColor: color });
}
